import { readJson, writeJson } from "@/cms/utils";

export interface LocalContribution {
  id: number;
  hash: string;
  amount: number;
  created_at: string;
}

const STORAGE_KEY = "zusda-local-gifts-v1";

export function donorHash(seed: string) {
  let hash = 2166136261;
  const value = seed.trim() || "anonymous";
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `#${(hash >>> 0).toString(16).padStart(8, "0").slice(-6)}`;
}

export function loadLocalContributions(): LocalContribution[] {
  return readJson<LocalContribution[]>(STORAGE_KEY) ?? [];
}

export function addLocalContribution(amount: number, seed?: string): LocalContribution {
  const gift: LocalContribution = {
    id: Date.now(),
    hash: donorHash(`${seed || "gift"}:${Date.now()}:${amount}`),
    amount,
    created_at: new Date().toISOString(),
  };
  writeJson(STORAGE_KEY, [gift, ...loadLocalContributions()].slice(0, 20));
  return gift;
}

export function sumLocalContributions() {
  return loadLocalContributions().reduce((total, item) => total + (Number(item.amount) || 0), 0);
}
