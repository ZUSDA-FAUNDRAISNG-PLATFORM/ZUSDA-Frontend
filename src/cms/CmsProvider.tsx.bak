import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { CmsCollection, CmsState, CmsUser, SiteSettings } from "./types";
import { createSeedState, postersFromLegacyCollections } from "./seed";
import { mergeCmsState, nextId, readJson, writeJson } from "./utils";

const STORAGE_KEY = "zusda-cms-v1";
const LEGACY_COLLECTIONS_KEY = "zusda-local-collections-v1";
const CMS_EVENT = "zusda:cms-changed";

interface CmsContextValue {
  ready: boolean;
  state: CmsState;
  updateSite: (patch: Partial<SiteSettings>) => void;
  saveCollection: <K extends CmsCollection>(key: K, items: CmsState[K]) => void;
  upsertItem: <K extends CmsCollection>(key: K, item: Partial<CmsState[K][number]> & { id?: number }) => void;
  deleteItem: (key: CmsCollection, id: number) => void;
  setUsers: (users: CmsUser[]) => void;
  addUser: (user: Omit<CmsUser, "id" | "createdAt">) => CmsUser;
}

const CmsContext = createContext<CmsContextValue | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CmsState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const seed = await createSeedState();
      const existing = readJson<CmsState>(STORAGE_KEY);
      const next = mergeCmsState(existing, seed);
      if (!existing?.posters?.length) {
        try {
          const legacy = readJson<Array<{ id: number; name: string; posterUrl?: string | null; isPrimary?: boolean; themeTitle?: string; themeSubtitle?: string; verseText?: string; verseRef?: string; hymn?: string; hymnDesc?: string; location?: string; durationLabel?: string; eyebrow?: string; projectId?: number | null }>>(LEGACY_COLLECTIONS_KEY);
          if (legacy?.some((item) => item.posterUrl)) {
            next.posters = postersFromLegacyCollections(legacy);
          }
        } catch {
          // ignore legacy migration issues
        }
      }
      writeJson(STORAGE_KEY, next);
      if (!cancelled) setState(next);
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (updater: (current: CmsState) => CmsState) => {
    setState((current) => {
      if (!current) return current;
      const next = updater(current);
      writeJson(STORAGE_KEY, next);
      window.dispatchEvent(new Event(CMS_EVENT));
      return next;
    });
  };

  const value = useMemo<CmsContextValue | null>(() => {
    if (!state) return null;
    return {
      ready: true,
      state,
      updateSite: (patch) => {
        persist((current) => ({ ...current, site: { ...current.site, ...patch } }));
        toast.success("Site settings saved.");
      },
      saveCollection: (key, items) => persist((current) => ({ ...current, [key]: items })),
      upsertItem: (key, item) => {
        persist((current) => {
          const list = current[key] as Array<{ id: number; sortOrder?: number }>;
          if (item.id) {
            return {
              ...current,
              [key]: list.map((row) => (row.id === item.id ? { ...row, ...item } : row)),
            } as CmsState;
          }
          const created = {
            published: true,
            sortOrder: list.length + 1,
            ...item,
            id: nextId(list),
          };
          return { ...current, [key]: [...list, created] } as CmsState;
        });
        toast.success(item.id ? "Saved." : "Added.");
      },
      deleteItem: (key, id) => {
        persist((current) => ({
          ...current,
          [key]: (current[key] as Array<{ id: number }>).filter((row) => row.id !== id),
        }) as CmsState);
        toast.success("Removed.");
      },
      setUsers: (users) => persist((current) => ({ ...current, users })),
      addUser: (user) => {
        const created: CmsUser = {
          ...user,
          id: nextId(state.users),
          createdAt: new Date().toISOString(),
        };
        persist((current) => ({ ...current, users: [...current.users, created] }));
        return created;
      },
    };
  }, [state]);

  if (!value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-navy/60">
        Loading content…
      </div>
    );
  }

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used within CmsProvider");
  return ctx;
}

export function usePublished<K extends CmsCollection>(key: K) {
  const { state } = useCms();
  return [...state[key]].filter((item) => item.published).sort((a, b) => a.sortOrder - b.sortOrder);
}
