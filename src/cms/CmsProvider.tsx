import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError, getStoredToken } from "@/api/client";
import * as cmsApi from "@/api/cms";
import { LOCAL_ADMIN_TOKEN } from "@/lib/testAdmin";
import type { CmsCollection, CmsState, CmsUser, SiteSettings } from "./types";
import { createSeedState, postersFromLegacyCollections } from "./seed";
import { nextId, readJson, writeJson } from "./utils";

const STORAGE_KEY = "zusda-cms-v1";
const USERS_KEY = "zusda-cms-users-v1";
const LEGACY_COLLECTIONS_KEY = "zusda-local-collections-v1";
const CMS_EVENT = "zusda:cms-changed";

type LegacyCollection = {
  id: number;
  name: string;
  posterUrl?: string | null;
  isPrimary?: boolean;
  themeTitle?: string;
  themeSubtitle?: string;
  verseText?: string;
  verseRef?: string;
  hymn?: string;
  hymnDesc?: string;
  location?: string;
  durationLabel?: string;
  eyebrow?: string;
  projectId?: number | null;
};

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

function hasServerToken() {
  const token = getStoredToken();
  return !!token && !token.startsWith(LOCAL_ADMIN_TOKEN);
}

function describe(err: unknown) {
  if (err instanceof ApiError && (err.status === 401 || err.status === 422)) {
    return "Sign in with a server admin account to save changes.";
  }
  return err instanceof Error ? err.message : "Could not save to the server.";
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CmsState | null>(null);

  const apply = (updater: (current: CmsState) => CmsState) =>
    setState((current) => (current ? updater(current) : current));

  const refresh = async () => {
    try {
      const remote = await cmsApi.fetchCms();
      if (remote.site) {
        apply((current) => ({ ...current, ...remote, site: remote.site as SiteSettings, users: current.users }) as CmsState);
      }
    } catch {
      // keep the current view
    }
  };

  const push = (task: Promise<unknown>, okMessage?: string) => {
    task
      .then(() => {
        if (okMessage) toast.success(okMessage);
      })
      .catch((err) => {
        toast.error(describe(err));
        void refresh();
      });
  };

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const seed = await createSeedState();
      try {
        const legacy = readJson<LegacyCollection[]>(LEGACY_COLLECTIONS_KEY);
        if (legacy?.some((item) => item.posterUrl)) {
          seed.posters = postersFromLegacyCollections(legacy as unknown as Parameters<typeof postersFromLegacyCollections>[0]);
        }
      } catch {
        // ignore legacy migration issues
      }

      const cached = readJson<CmsState>(STORAGE_KEY);
      const users = readJson<CmsUser[]>(USERS_KEY) ?? cached?.users ?? seed.users;

      let content: Partial<CmsState> | null = null;
      try {
        let remote = await cmsApi.fetchCms();
        if (!remote.site && hasServerToken()) {
          try {
            const { users: _ignored, ...seedContent } = seed;
            remote = await cmsApi.importCms(seedContent);
          } catch {
            remote = await cmsApi.fetchCms();
          }
        }
        if (remote.site) content = remote;
      } catch {
        content = cached;
        toast.error("Could not reach the server. Showing saved content.");
      }

      const base = content ?? {};
      const next = { ...seed, ...base, site: base.site ?? seed.site, users } as CmsState;
      if (!cancelled) setState(next);
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    writeJson(STORAGE_KEY, { ...state, users: [] });
    writeJson(USERS_KEY, state.users);
    window.dispatchEvent(new Event(CMS_EVENT));
  }, [state]);

  const value = useMemo<CmsContextValue | null>(() => {
    if (!state) return null;
    return {
      ready: true,
      state,
      updateSite: (patch) => {
        apply((current) => ({ ...current, site: { ...current.site, ...patch } }));
        push(cmsApi.saveSite(patch), "Site settings saved.");
      },
      saveCollection: (key, items) => {
        apply((current) => ({ ...current, [key]: items }) as CmsState);
        push(
          cmsApi
            .replaceCollection(key, items)
            .then((saved) => apply((current) => ({ ...current, [key]: saved }) as CmsState)),
        );
      },
      upsertItem: (key, item) => {
        if (item.id) {
          apply(
            (current) =>
              ({
                ...current,
                [key]: (current[key] as Array<{ id: number }>).map((row) =>
                  row.id === item.id ? { ...row, ...item } : row,
                ),
              }) as CmsState,
          );
          push(cmsApi.updateCmsItem(key, item.id, item), "Saved.");
          return;
        }
        const list = state[key] as Array<{ id: number }>;
        const payload = { published: true, sortOrder: list.length + 1, ...item };
        push(
          cmsApi.createCmsItem(key, payload).then((created) =>
            apply((current) => ({ ...current, [key]: [...(current[key] as unknown[]), created] }) as CmsState),
          ),
          "Added.",
        );
      },
      deleteItem: (key, id) => {
        apply(
          (current) =>
            ({
              ...current,
              [key]: (current[key] as Array<{ id: number }>).filter((row) => row.id !== id),
            }) as CmsState,
        );
        push(cmsApi.deleteCmsItem(key, id), "Removed.");
      },
      setUsers: (users) => apply((current) => ({ ...current, users })),
      addUser: (user) => {
        const created: CmsUser = {
          ...user,
          id: nextId(state.users),
          createdAt: new Date().toISOString(),
        };
        apply((current) => ({ ...current, users: [...current.users, created] }));
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
