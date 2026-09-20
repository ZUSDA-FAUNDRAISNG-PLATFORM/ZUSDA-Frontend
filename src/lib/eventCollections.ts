export interface EventCollection {
  id: string;
  name: string;
  isPrimary: boolean;

  eyebrow: string;
  heading: string;
  posterUrl: string | null;
  location: string;
  startDate: string;
  endDate: string;
  durationLabel: string;
  season: string;

  themeTitle: string;
  themeSubtitle: string;
  verseText: string;
  verseRef: string;
  hymn: string;
  hymnDesc: string;
}

const STORAGE_KEY = "event-collections-v2";

const MISSION_2026: EventCollection = {
  id: "mission-2026",
  name: "Mission 2026",
  isPrimary: true,
  eyebrow: "Mission Details",
  heading: "When & Where",
  posterUrl: null,
  location: "Kinamba, Naivasha, Nakuru County",
  startDate: "2026-12-13",
  endDate: "2026-12-27",
  durationLabel: "15 Days of Evangelism",
  season: "December – Time of Reflection",
  themeTitle: "Njooni Tusemezane",
  themeSubtitle: "Come Now, Let Us Reason Together",
  verseText:
    "Come now, and let us reason together, says the Lord, Though your sins are like scarlet, they shall be as white as snow; though they are red like crimson, they shall be as wool.",
  verseRef: "Isaiah 1:18 (NKJV)",
  hymn: "Hymn 170 (NZK)",
  hymnDesc: "Reinforcing our spiritual invitation and reflective worship",
};

function migrateLegacyStore(): EventCollection[] | null {
  try {
    const raw = localStorage.getItem("event-collections-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { collections: any[] };
    if (!parsed.collections?.length) return null;
    return parsed.collections.map((c, i) => ({
      ...c,
      isPrimary: i === 0, // first one becomes primary by default on migration
    }));
  } catch {
    return null;
  }
}

export function loadCollections(): EventCollection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EventCollection[];
      if (parsed?.length) {
        // safety net: ensure exactly one primary exists
        if (!parsed.some((c) => c.isPrimary)) parsed[0].isPrimary = true;
        return parsed;
      }
    }
    const migrated = migrateLegacyStore();
    if (migrated) {
      saveCollections(migrated);
      return migrated;
    }
    return [MISSION_2026];
  } catch {
    return [MISSION_2026];
  }
}

export function saveCollections(collections: EventCollection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
}

export function getPrimaryId(collections: EventCollection[]): string {
  return (collections.find((c) => c.isPrimary) ?? collections[0]).id;
}

function generateId(): string {
  // crypto.randomUUID() requires a secure context (https/localhost) and isn't
  // available everywhere (e.g. viewing via a LAN IP over http). This fallback
  // works unconditionally.
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function makeBlankCollection(name: string): EventCollection {
  return {
    id: generateId(),
    name,
    isPrimary: false,
    eyebrow: "Event Details",
    heading: "Event Information",
    posterUrl: null,
    location: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    durationLabel: "",
    season: "",
    themeTitle: "",
    themeSubtitle: "",
    verseText: "",
    verseRef: "",
    hymn: "",
    hymnDesc: "",
  };
}
