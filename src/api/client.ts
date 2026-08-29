export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const TOKEN_STORAGE_KEY = "zusda_auth_token";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredToken() {
  return typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function resolveAssetUrl(value?: string | null) {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${API_BASE_URL.replace(/\/api$/, "")}${value}`;
  return value;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init.headers);

  if (!(init.body instanceof FormData)) {
    headers.set("Accept", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") || "";
  let payload: any = null;

  if (contentType.includes("application/json")) {
    payload = await response.json();
  } else if (response.status !== 204) {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = payload?.error || payload?.message || payload?.msg || "Request failed";
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

export function apiGet<T>(path: string) {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPut<T>(path: string, body?: unknown) {
  return request<T>(path, {
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

export function apiUpload<T>(path: string, formData: FormData) {
  return request<T>(path, {
    method: "POST",
    body: formData,
  });
}
