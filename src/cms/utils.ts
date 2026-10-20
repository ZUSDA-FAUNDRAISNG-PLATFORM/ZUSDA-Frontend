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
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    try {
      // quota exceeded: cache again without embedded images
      localStorage.setItem(
        key,
        JSON.stringify(value, (_k, v) => (typeof v === "string" && v.startsWith("data:") ? "" : v)),
      );
    } catch {
      localStorage.removeItem(key);
    }
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
