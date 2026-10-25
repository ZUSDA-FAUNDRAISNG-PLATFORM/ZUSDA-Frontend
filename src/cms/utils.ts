import type { CmsState } from "./types";

export function nextId<T extends { id: number }>(items: T[]) {
  return (items.reduce((max, item) => Math.max(max, item.id), 0) || 0) + 1;
}

export function sortByOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function publishedOnly<T extends { published: boolean }>(items: T[]) {
  return items.filter((item) => item.published);
}

export async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`zusda-cms:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readJson<T>(key: string): T | null {
  const readers = [
    () => localStorage.getItem(key),
    () => sessionStorage.getItem(`${key}:session`),
  ];

  for (const read of readers) {
    try {
      const raw = read();
      if (!raw) continue;
      return JSON.parse(raw) as T;
    } catch {
      // ignore corrupt or unavailable cache entries and continue to the next fallback.
    }
  }

  return null;
}

export function sanitizeCmsAssetRefs<T>(value: T, fallback: T): T {
  if (!value || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item, index) => sanitizeCmsAssetRefs(item, Array.isArray(fallback) ? fallback[index] : undefined as never)) as T;
  }

  const repaired = { ...(value as Record<string, unknown>) };
  const fallbackObject = (fallback && typeof fallback === "object" ? (fallback as Record<string, unknown>) : {}) as Record<string, unknown>;

  for (const [key, entry] of Object.entries(repaired)) {
    if (typeof entry === "string" && entry.startsWith("/assets/") && typeof fallbackObject[key] === "string") {
      repaired[key] = fallbackObject[key];
      continue;
    }

    if (
      key === "countdownDate" &&
      typeof entry === "string" &&
      Number.isNaN(new Date(entry).getTime()) &&
      typeof fallbackObject[key] === "string"
    ) {
      repaired[key] = fallbackObject[key];
      continue;
    }

    if (entry && typeof entry === "object") {
      repaired[key] = sanitizeCmsAssetRefs(entry as never, (fallbackObject[key] as never) ?? ({} as never));
    }
  }

  return repaired as T;
}

function stripDataUrls(input: unknown): unknown {
  if (typeof input === "string") {
    return input.startsWith("data:") ? "" : input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => stripDataUrls(item));
  }

  if (input && typeof input === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      cleaned[key] = stripDataUrls(value);
    }
    return cleaned;
  }

  return input;
}

export function writeJson(key: string, value: unknown) {
  const payload = JSON.stringify(value);
  const compact = JSON.stringify(stripDataUrls(value));

  const tryWrite = (store: Storage, storageKey: string, nextPayload: string) => {
    store.setItem(storageKey, nextPayload);
    return true;
  };

  try {
    tryWrite(localStorage, key, payload);
    return;
  } catch {
    // fall through to session fallback below
  }

  try {
    tryWrite(sessionStorage, `${key}:session`, compact.length < payload.length ? compact : payload);
    return;
  } catch {
    // final fallback: strip data URLs and retry once before giving up.
  }

  try {
    if (compact.length < payload.length) {
      try {
        localStorage.setItem(key, compact);
        return;
      } catch {
        try {
          sessionStorage.setItem(`${key}:session`, compact);
          return;
        } catch {
          localStorage.removeItem(key);
          sessionStorage.removeItem(`${key}:session`);
        }
      }
    }
  } catch {
    // ignore cleanup failures and keep the app running.
  }
}

function mergeByTitle<T extends { id: number; title: string }>(existing: T[] | undefined, seed: T[]): T[] {
  if (!existing?.length) return seed;
  const keys = new Set(existing.map((item) => item.title.toLowerCase()));
  const extras = seed.filter((item) => !keys.has(item.title.toLowerCase())).map((item, index) => ({
    ...item,
    id: nextId(existing) + index,
  }));
  return extras.length ? [...existing, ...extras] : existing;
}

export function mergeCmsState(existing: Partial<CmsState> | null, seed: CmsState): CmsState {
  if (!existing?.site) return seed;
  return {
    site: { ...seed.site, ...existing.site },
    posters: existing.posters?.length ? existing.posters : seed.posters,
    slides: existing.slides?.length ? existing.slides : seed.slides,
    values: existing.values?.length ? existing.values : seed.values,
    committee: existing.committee?.length ? existing.committee : seed.committee,
    announcements: Array.isArray(existing.announcements) ? existing.announcements : seed.announcements,
    events: existing.events?.length ? existing.events : seed.events,
    gallery: Array.isArray(existing.gallery) ? existing.gallery : seed.gallery,
    ministries: mergeByTitle(existing.ministries, seed.ministries),
    users: existing.users?.length ? existing.users : seed.users,
  };
}

export function compressImageToDataUrl(file: File, maxSize = 1200, quality = 0.8): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const original = String(reader.result);
      if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
        resolve(original);
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(original);
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(original);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = original;
    };
    reader.readAsDataURL(file);
  });
}

export function compressImage(file: File, maxWidth = 1600, quality = 0.78): Promise<string> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return Promise.reject(new Error("Choose a JPG, PNG, or WebP image."));
  }
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return Promise.reject(new Error("Image width limit must be greater than zero."));
  }

  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image."));
    };
    image.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not process the selected image.");

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/webp", quality);
        if (!compressed.startsWith("data:image/webp;")) {
          throw new Error("This browser could not convert the image to WebP.");
        }
        resolve(compressed);
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    image.src = objectUrl;
  });
}
