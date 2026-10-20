import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError, getStoredToken } from "@/api/client";
import * as cmsApi from "@/api/cms";
import { LOCAL_ADMIN_TOKEN } from "@/lib/testAdmin";
import type { CmsCollection, CmsState, CmsUser, SiteSettings } from "./types";
import { createSeedState, postersFromLegacyCollections } from "./seed";
import { nextId, readJson, sanitizeCmsAssetRefs, writeJson } from "./utils";

const STORAGE_KEY = "zusda-cms-v1";
const USERS_KEY = "zusda-cms-users-v1";
const LEGACY_COLLECTIONS_KEY = "zusda-local-collections-v1";
const CMS_EVENT = "zusda:cms-changed";

const FALLBACK_CMS_STATE: CmsState = {
  site: {
    churchName: "ZUSDA",
    tagline: "",
    heroEyebrow: "",
    heroTitle: "",
    heroSubtitle: "",
    heroMeta: "",
    heroImageUrl: "",
    countdownDate: "",
    aboutEyebrow: "",
    aboutTitle: "",
    aboutBody: "",
    missionTitle: "",
    missionBody: "",
    visionTitle: "",
    visionBody: "",
    ctaTitle: "",
    ctaBody: "",
    ctaImageUrl: "",
    footerBlurb: "",
    contactEmail: "",
    chairmanName: "",
    chairmanPhone: "",
    elderName: "",
    elderPhone: "",
    budgetGoal: 0,
    paybill: "",
    paybillAccount: "",
    wordOfFaith: "",
  },
  posters: [],
  slides: [],
  values: [],
  committee: [],
  announcements: [],
  events: [],
  gallery: [],
  ministries: [],
  users: [],
};

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
  const [state, setState] = useState<CmsState>(FALLBACK_CMS_STATE);

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
      let seed: CmsState;
      try {
        seed = await createSeedState();
      } catch {
        seed = {
          site: { churchName: "ZUSDA", tagline: "", heroEyebrow: "", heroTitle: "", heroSubtitle: "", heroMeta: "", heroImageUrl: "", countdownDate: "", aboutEyebrow: "", aboutTitle: "", aboutBody: "", missionTitle: "", missionBody: "", visionTitle: "", visionBody: "", ctaTitle: "", ctaBody: "", ctaImageUrl: "", footerBlurb: "", contactEmail: "", chairmanName: "", chairmanPhone: "", elderName: "", elderPhone: "", budgetGoal: 0, paybill: "", paybillAccount: "", wordOfFaith: "" },
          posters: [],
          slides: [],
          values: [],
          committee: [],
          announcements: [],
          events: [],
          gallery: [],
          ministries: [],
          users: [],
        };
      }

      try {
        const legacy = readJson<LegacyCollection[]>(LEGACY_COLLECTIONS_KEY);
        if (legacy?.some((item) => item.posterUrl)) {
          seed.posters = postersFromLegacyCollections(legacy as unknown as Parameters<typeof postersFromLegacyCollections>[0]);
        }
      } catch {
        // ignore legacy migration issues
      }

      const cached = readJson<CmsState>(STORAGE_KEY);
      const safeCached = cached ? sanitizeCmsAssetRefs(cached, seed) : cached;
      const users = readJson<CmsUser[]>(USERS_KEY) ?? safeCached?.users ?? seed.users;

      let content: Partial<CmsState> | null = null;
      try {
        let remote = await Promise.race([
          cmsApi.fetchCms(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 8000)),
        ]);
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
        content = safeCached;
        toast.error("Could not reach the server. Showing saved content.");
        setTimeout(() => void refresh(), 15000);
      }

      const base = content ?? {};
      const mergedSite = { ...seed.site, ...(base.site ?? {}) };
      if (Number.isNaN(new Date(mergedSite.countdownDate).getTime())) {
        mergedSite.countdownDate = seed.site.countdownDate;
      }
      const next = { ...seed, ...base, site: mergedSite, users } as CmsState;
      const fixPhotos = (remoteList: any[], seedList: any[]) =>
        remoteList.map((item) => {
          if (!item || typeof item.photoUrl !== "string" || !item.photoUrl.startsWith("/assets/")) return item;
          const match = seedList.find((x) => x && x.name === item.name && typeof x.photoUrl === "string");
          return match ? { ...item, photoUrl: match.photoUrl } : item;
        });
      for (const k of Object.keys(seed)) {
        if (k === "users") continue;
        const sv = (seed as any)[k];
        const nv = (next as any)[k];
        if (Array.isArray(sv) && Array.isArray(nv)) (next as any)[k] = fixPhotos(nv, sv);
      }
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
