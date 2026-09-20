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
  try {
    const raw = localStorage.getItem(PRESENCE_KEY);
    return raw ? (JSON.parse(raw) as PresenceEntry[]) : [];
  } catch {
    return [];
  }
}

function activeViewers(now = Date.now()) {
  return readPresence().filter((item) => now - item.updatedAt < TTL_MS);
}

export function useLiveViewers() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = sessionId();

    const publish = () => {
      if (document.hidden) {
        const remaining = activeViewers().filter((item) => item.id !== id);
        localStorage.setItem(PRESENCE_KEY, JSON.stringify(remaining));
        setCount(Math.max(remaining.length, 0));
        return;
      }
      const now = Date.now();
      const next = [...activeViewers(now).filter((item) => item.id !== id), { id, updatedAt: now }];
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(next));
      setCount(next.length);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === PRESENCE_KEY) {
        setCount(activeViewers().length || (document.hidden ? 0 : 1));
      }
    };

    publish();
    const interval = window.setInterval(publish, 3000);
    document.addEventListener("visibilitychange", publish);
    window.addEventListener("storage", onStorage);
    window.addEventListener("beforeunload", () => {
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(activeViewers().filter((item) => item.id !== id)));
    });

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", publish);
      window.removeEventListener("storage", onStorage);
      localStorage.setItem(PRESENCE_KEY, JSON.stringify(activeViewers().filter((item) => item.id !== id)));
    };
  }, []);

  return count;
}
