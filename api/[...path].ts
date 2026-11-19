import type { IncomingMessage, ServerResponse } from "node:http";

type CacheEntry = {
  body: string;
  cacheable: boolean;
  contentType: string;
  expiresAt: number;
  retryAfter?: string;
  status: number;
};

type RateEntry = {
  count: number;
  resetAt: number;
};

const PUBLIC_READ_TTL_MS = 8_000;
const MAX_CACHE_ENTRIES = 256;
const MAX_RATE_ENTRIES = 4_096;
const PUBLIC_READS_PER_MINUTE = 1_200;
const AUTH_REQUESTS_PER_MINUTE = 240;
const WRITE_REQUESTS_PER_MINUTE = 300;
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();
const rateLimits = new Map<string, RateEntry>();

const isPublicRead = (pathname: string) =>
  pathname === "/cms/" ||
  pathname === "/projects/" ||
  pathname === "/event-collections/" ||
  pathname === "/event-collections/primary" ||
  /^\/event-collections\/\d+$/.test(pathname) ||
  pathname === "/contributions/recent" ||
  pathname === "/motivations/";

function clientAddress(req: IncomingMessage) {
  const vercelAddress = req.headers["x-vercel-forwarded-for"];
  const value = Array.isArray(vercelAddress)
    ? vercelAddress[0]
    : vercelAddress;
  const candidate = value?.split(",")[0]?.trim();
  return candidate && /^[\da-fA-F:.%]+$/.test(candidate)
    ? candidate
    : req.socket.remoteAddress || "unknown";
}

function ratePolicy(pathname: string, method: string) {
  if (pathname === "/auth/login" && method === "POST") {
    return { limit: AUTH_REQUESTS_PER_MINUTE, windowMs: 60_000 };
  }
  if (pathname.startsWith("/auth/")) {
    return { limit: AUTH_REQUESTS_PER_MINUTE, windowMs: 60_000 };
  }
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    return { limit: WRITE_REQUESTS_PER_MINUTE, windowMs: 60_000 };
  }
  return { limit: PUBLIC_READS_PER_MINUTE, windowMs: 60_000 };
}

function isRateLimited(req: IncomingMessage, pathname: string, method: string) {
  const now = Date.now();
  if (rateLimits.size >= MAX_RATE_ENTRIES) {
    for (const [key, entry] of rateLimits) {
      if (entry.resetAt <= now) rateLimits.delete(key);
    }
    if (rateLimits.size >= MAX_RATE_ENTRIES) {
      const oldest = rateLimits.keys().next().value;
      if (oldest) rateLimits.delete(oldest);
    }
  }

  const policy = ratePolicy(pathname, method);
  const key = `${clientAddress(req)}:${pathname.startsWith("/auth/") ? "auth" : method === "GET" ? "read" : "write"}`;
  const current = rateLimits.get(key);
  if (!current || current.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + policy.windowMs });
    return 0;
  }
  current.count += 1;
  return current.count > policy.limit
    ? Math.max(1, Math.ceil((current.resetAt - now) / 1_000))
    : 0;
}

function respondJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function remember(key: string, entry: CacheEntry) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, entry);
}

function readCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry;
}

function sendCached(res: ServerResponse, entry: CacheEntry) {
  res.statusCode = entry.status;
  res.setHeader("Content-Type", entry.contentType);
  if (entry.retryAfter) res.setHeader("Retry-After", entry.retryAfter);
  res.setHeader(
    "Cache-Control",
    entry.cacheable ? "public, max-age=0, s-maxage=8, stale-while-revalidate=20" : "no-store",
  );
  res.end(entry.body);
}

async function fetchPublic(
  key: string,
  url: URL,
  headers: Headers,
): Promise<CacheEntry> {
  const cached = readCache(key);
  if (cached) return cached;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const fetchPromise = fetch(url, { method: "GET", headers })
    .then(async (response) => {
      const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";
      const body = await response.text();
      const entry = {
        body,
        cacheable:
          response.ok &&
          contentType.includes("application/json") &&
          body.length <= 1_000_000,
        contentType,
        expiresAt: 0,
        retryAfter: response.headers.get("retry-after") || undefined,
        status: response.status,
      };
      if (entry.cacheable) {
        entry.expiresAt = Date.now() + PUBLIC_READ_TTL_MS;
        remember(key, entry);
      }
      return entry;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, fetchPromise);
  return fetchPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const method = (req.method || "GET").toUpperCase();
  const requestUrl = new URL(req.url || "/", "http://vercel.local");
  const pathname = requestUrl.pathname.startsWith("/api/")
    ? requestUrl.pathname.slice(4)
    : "";

  if (!pathname) {
    respondJson(res, 404, { error: "Not found." });
    return;
  }

  const retryAfter = isRateLimited(req, pathname, method);
  if (retryAfter) {
    res.setHeader("Retry-After", String(retryAfter));
    respondJson(res, 429, { error: "Too many requests. Please retry shortly." });
    return;
  }

  const backendBaseUrl = process.env.BACKEND_API_URL;
  if (!backendBaseUrl) {
    respondJson(res, 503, { error: "The API service is not configured." });
    return;
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(`/api${pathname}${requestUrl.search}`, `${backendBaseUrl.replace(/\/+$/, "")}/`);
    if (upstreamUrl.protocol !== "https:" && process.env.NODE_ENV === "production") {
      respondJson(res, 503, { error: "The API service is not configured." });
      return;
    }
  } catch {
    respondJson(res, 503, { error: "The API service is not configured." });
    return;
  }

  const headers = new Headers();
  for (const name of ["accept", "authorization", "content-type"] as const) {
    const value = req.headers[name];
    if (typeof value === "string") headers.set(name, value);
  }
  headers.set("x-forwarded-for", clientAddress(req));

  const useCache =
    method === "GET" &&
    isPublicRead(pathname) &&
    !headers.has("authorization") &&
    !req.headers.cookie;
  const cacheKey = `${pathname}${requestUrl.search}`;

  try {
    if (useCache) {
      const entry = await fetchPublic(cacheKey, upstreamUrl, headers);
      sendCached(res, entry);
      return;
    }

    const response = await fetch(upstreamUrl, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : (req as unknown as BodyInit),
      duplex: method === "GET" || method === "HEAD" ? undefined : "half",
    } as RequestInit & { duplex?: "half" });

    res.statusCode = response.status;
    for (const name of ["content-type", "retry-after", "cache-control"] as const) {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.end(
      response.status === 204 || method === "HEAD"
        ? undefined
        : new Uint8Array(await response.arrayBuffer()),
    );
  } catch {
    respondJson(res, 502, { error: "The API service is temporarily unavailable." });
  }
}

export const config = { api: { bodyParser: false } };
