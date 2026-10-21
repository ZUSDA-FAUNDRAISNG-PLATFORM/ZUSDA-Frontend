import { useEffect, useState } from "react";

const PRESENCE_KEY = "zusda:presence-v2";
const TTL_MS = 8000;

type PresenceEntry = { id: string; updatedAt: number };

function sessionId() {
  const existing = sessionStorage.getItem("zusda:viewer-id");
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem("zusda:viewer-id", next);
  return next;
}

function readPresence(): PresenceEntry[] {
  const reads = [
    () => localStorage.getItem(PRESENCE_KEY),
    () => sessionStorage.getItem(`${PRESENCE_KEY}:session`),
  ];

  for (const read of reads) {
    try {
      const raw = read();
      if (raw) return JSON.parse(raw) as PresenceEntry[];
    } catch {
      // ignore corrupt presence cache entries and continue to the next fallback.
    }
  }

  return [];
}

function activeViewers(now = Date.now()) {
  return readPresence().filter((item) => now - item.updatedAt < TTL_MS);
}

export function useLiveViewers() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = sessionId();

    const publish = () => {
      const writePresence = (value: PresenceEntry[]) => {
        try {
          localStorage.setItem(PRESENCE_KEY, JSON.stringify(value));
        } catch {
          try {
            sessionStorage.setItem(`${PRESENCE_KEY}:session`, JSON.stringify(value));
          } catch {
            // ignore quota errors from the presence heartbeat so the page keeps working.
          }
        }
      };

      if (document.hidden) {
        const remaining = activeViewers().filter((item) => item.id !== id);
        writePresence(remaining);
        setCount(Math.max(remaining.length, 0));
        return;
      }
      const now = Date.now();
      const next = [...activeViewers(now).filter((item) => item.id !== id), { id, updatedAt: now }];
      writePresence(next);
      setCount(next.length);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === PRESENCE_KEY) {
        setCount(activeViewers().length || (document.hidden ? 0 : 1));
      }
    };
    const clearPresence = () => {
      const remaining = activeViewers().filter((item) => item.id !== id);
      try {
        localStorage.setItem(PRESENCE_KEY, JSON.stringify(remaining));
      } catch {
        try {
          sessionStorage.setItem(`${PRESENCE_KEY}:session`, JSON.stringify(remaining));
        } catch {
          // ignore cleanup quota errors.
        }
      }
    };

    publish();
    const interval = window.setInterval(publish, 3000);
    document.addEventListener("visibilitychange", publish);
    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", clearPresence);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", publish);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", clearPresence);
      clearPresence();
    };
  }, []);

  return count;
}
