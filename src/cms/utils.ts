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
  localStorage.setItem(key, JSON.stringify(value));
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
