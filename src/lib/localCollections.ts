import type { EventCollectionDTO } from "@/api/collections";

const STORAGE_KEY = "zusda-local-collections-v1";

const MISSION_SEED: EventCollectionDTO = {
  id: 1,
  name: "Mission 2026",
  isPrimary: true,
  projectId: 1,
  eyebrow: "Current outreach",
  heading: "When & Where",
  posterUrl: null,
  location: "Kinamba, Naivasha",
  startDate: "2026-12-13",
  endDate: "2026-12-27",
  durationLabel: "13–27 December 2026",
  season: "December",
  themeTitle: "Njooni Tusemezane",
  themeSubtitle: "Come Now, Let Us Reason Together",
  verseText:
    "Come now, and let us reason together, says the Lord, Though your sins are like scarlet, they shall be as white as snow; though they are red like crimson, they shall be as wool.",
  verseRef: "Isaiah 1:18 (NKJV)",
  hymn: "Hymn 170 (NZK)",
};

export function loadLocalCollections(): EventCollectionDTO[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EventCollectionDTO[];
      if (parsed?.length) return parsed;
    }
  } catch {
    // ignore corrupt local data
  }
  const seeded = [MISSION_SEED];
  saveLocalCollections(seeded);
  return seeded;
}

export function saveLocalCollections(collections: EventCollectionDTO[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

export function createLocalCollection(name: string, current: EventCollectionDTO[]): EventCollectionDTO {
  const created: EventCollectionDTO = {
    id: Date.now(),
    name,
    isPrimary: current.length === 0,
    projectId: null,
    eyebrow: "Outreach",
    heading: "Event Information",
    posterUrl: null,
    location: "Kinamba, Naivasha",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    durationLabel: "",
    season: "",
    themeTitle: name,
    themeSubtitle: "",
    verseText: "",
    verseRef: "",
    hymn: "",
    hymnDesc: "",
  };
  const next = [...current, created];
  saveLocalCollections(next);
  return created;
}

export function setLocalPrimary(id: number, current: EventCollectionDTO[]) {
  const next = current.map((item) => ({ ...item, isPrimary: item.id === id }));
  saveLocalCollections(next);
  return next.find((item) => item.id === id) ?? next[0];
}

export function removeLocalCollection(id: number, current: EventCollectionDTO[]) {
  const next = current.filter((item) => item.id !== id);
  if (next.length && !next.some((item) => item.isPrimary)) next[0].isPrimary = true;
  saveLocalCollections(next);
  return next;
}

export function setLocalPoster(id: number, posterUrl: string, current: EventCollectionDTO[]) {
  const next = current.map((item) => (item.id === id ? { ...item, posterUrl } : item));
  saveLocalCollections(next);
  return next.find((item) => item.id === id)!;
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
