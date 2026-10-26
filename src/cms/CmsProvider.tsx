import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ApiError, getStoredToken } from "@/api/client";
import * as cmsApi from "@/api/cms";
import { ADMIN_SESSION_EVENT, LOCAL_ADMIN_TOKEN } from "@/lib/testAdmin";
import type { CmsCollection, CmsState, CmsUser, SiteSettings } from "./types";
import { createSeedState, missingDefaultHeroSlides, postersFromLegacyCollections } from "./seed";
import { cacheHeroSlides, nextId, readJson, sanitizeCmsAssetRefs, writeJson } from "./utils";

const STORAGE_KEY = "zusda-cms-v2";
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
  cmsAnswered: boolean;
  cmsUnavailable: boolean;
  state: CmsState;
  importDefaultHeroSlides: (onDemand?: boolean) => Promise<void>;
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

const repairRemote = (remote: Awaited<ReturnType<typeof cmsApi.fetchCms>>, seed: CmsState) => {
  const out = { ...remote };
  const stem = (u: string) =>
    u
      .replace(/^.*\//, "")
      .replace(/\.[^.]+$/, "")
      .replace(/-(?=[A-Za-z0-9_-]{6,10}$)(?=[A-Za-z0-9_-]*[A-Z0-9_-])[A-Za-z0-9_-]{6,10}$/, "")
      .toLowerCase();
  const seedUrls: Record<string, string> = {};
  const collect = (v: unknown): void => {
    if (Array.isArray(v)) v.forEach(collect);
    else if (v && typeof v === "object") Object.values(v).forEach(collect);
    else if (typeof v === "string" && v.startsWith("/assets/")) seedUrls[stem(v)] = v;
  };
  collect(seed);
  const fix = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(fix);
    if (v && typeof v === "object") {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fix(x)]));
    }
    if (typeof v === "string" && v.startsWith("/assets/")) return seedUrls[stem(v)] ?? v;
    return v;
  };
  return fix(out) as Awaited<ReturnType<typeof cmsApi.fetchCms>>;
};

let seedPromise: Promise<CmsState> | null = null;
const getSeed = () => (seedPromise ??= createSeedState());

export function CmsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CmsState | null>(null);
  const [cmsAnswered, setCmsAnswered] = useState(false);
  const [cmsUnavailable, setCmsUnavailable] = useState(false);

  const apply = useCallback(
    (updater: (current: CmsState) => CmsState) =>
      setState((current) => (current ? updater(current) : current)),
    [],
  );

  const refresh = useCallback(async () => {
    try {
      const seed = await getSeed();
      let remote = await cmsApi.fetchCms();
      setCmsAnswered(true);
      setCmsUnavailable(false);
      remote = repairRemote(remote, seed);
      cacheHeroSlides(remote.slides);
      if (remote.site) {
        apply((current) => ({ ...current, ...remote, site: remote.site as SiteSettings, users: current.users }) as CmsState);
      } else {
        apply((current) => ({ ...current, slides: remote.slides }) as CmsState);
      }
    } catch {
      setCmsUnavailable(true);
      toast.error("Could not refresh content from the server.");
    }
  }, [apply]);

  const importDefaultHeroSlides = useCallback(async (onDemand = false) => {
    if (!hasServerToken()) {
      if (onDemand) toast.error("Sign in with a server admin account to import default photos.");
      return;
    }

    try {
      const seed = await getSeed();
      let remote = await cmsApi.fetchCms();
      if (!remote.site) throw new Error("Site settings are unavailable.");

      if (onDemand || !remote.site.heroSeeded) {
        for (const { id: _id, ...slide } of missingDefaultHeroSlides(remote.slides)) {
          await cmsApi.createCmsItem("slides", slide);
        }
        if (!remote.site.heroSeeded) await cmsApi.saveSite({ heroSeeded: true });
        remote = await cmsApi.fetchCms();
      }

      setCmsAnswered(true);
      setCmsUnavailable(false);
      const fresh = repairRemote(remote, seed);
      cacheHeroSlides(fresh.slides);
      if (fresh.site) {
        apply((current) => ({ ...current, ...fresh, site: fresh.site as SiteSettings, users: current.users }) as CmsState);
      } else {
        apply((current) => ({ ...current, slides: fresh.slides }) as CmsState);
      }
      if (onDemand) toast.success("Default photos imported.");
    } catch (err) {
      toast.error(`Could not import default photos: ${describe(err)}`);
    }
  }, [apply]);

  const push = useCallback((task: Promise<unknown>, okMessage?: string) => {
    task
      .then(() => {
        if (okMessage) toast.success(okMessage);
      })
      .catch((err) => {
        toast.error(describe(err));
        void refresh();
      });
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    const retryHeroSeed = () => {
      if (hasServerToken()) void refresh();
    };
    window.addEventListener(ADMIN_SESSION_EVENT, retryHeroSeed);
    const boot = async () => {
      const cached = readJson<CmsState>(STORAGE_KEY);
      const cachedUsers = readJson<CmsUser[]>(USERS_KEY) ?? cached?.users ?? FALLBACK_CMS_STATE.users;
      if (cached) {
        setState({
          ...FALLBACK_CMS_STATE,
          ...cached,
          site: { ...FALLBACK_CMS_STATE.site, ...(cached.site ?? {}) },
          users: cachedUsers,
        });
      }

      let seed: CmsState;
      try {
        seed = await getSeed();
      } catch {
        seed = FALLBACK_CMS_STATE;
      }

      try {
        const legacy = readJson<LegacyCollection[]>(LEGACY_COLLECTIONS_KEY);
        if (legacy?.some((item) => item.posterUrl)) {
          seed.posters = postersFromLegacyCollections(legacy as unknown as Parameters<typeof postersFromLegacyCollections>[0]);
        }
      } catch {
        // ignore legacy migration issues
      }

      const safeCached = cached ? sanitizeCmsAssetRefs(cached, seed) : cached;
      const users = readJson<CmsUser[]>(USERS_KEY) ?? safeCached?.users ?? seed.users;

      const buildState = (content: Partial<CmsState> | null): CmsState => {
        const base = content ?? {};
        const mergedSite = { ...seed.site, ...(base.site ?? {}) };
        if (Number.isNaN(new Date(mergedSite.countdownDate).getTime())) {
          mergedSite.countdownDate = seed.site.countdownDate;
        }
        const next = { ...seed, ...base, site: mergedSite, users } as CmsState;
        const fixPhotos = (remoteList: CmsState["committee"], seedList: CmsState["committee"]) =>
          remoteList.map((item) => {
            if (typeof item.photoUrl !== "string" || !item.photoUrl.startsWith("/assets/")) return item;
            const match = seedList.find((x) => x.name === item.name);
            return match ? { ...item, photoUrl: match.photoUrl } : item;
          });
        next.committee = fixPhotos(next.committee, seed.committee);
        return next;
      };

      if (!cancelled) setState(buildState(safeCached ?? null));

      try {
        let remote = await cmsApi.fetchCms();
        if (!remote.site && hasServerToken()) {
          try {
            const { users: _ignored, ...seedContent } = seed;
            seedContent.slides = seedContent.slides.filter((slide) => slide.placement !== "hero");
            remote = await cmsApi.importCms(seedContent);
          } catch {
            remote = await cmsApi.fetchCms();
          }
        }
        if (!cancelled) {
          setCmsAnswered(true);
          setCmsUnavailable(false);
          const fresh = repairRemote(remote, seed);
          cacheHeroSlides(fresh.slides);
          if (fresh.site) {
            setState(buildState(fresh));
          } else {
            setState((current) => current ? { ...current, slides: fresh.slides } : current);
          }
        }
      } catch {
        if (cancelled) return;
        setCmsUnavailable(true);
        if (!safeCached) toast.error("Could not reach the server. Showing default content.");
        window.setTimeout(() => {
          if (!cancelled) void refresh();
        }, 15000);
      }
    };
    void boot();
    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_SESSION_EVENT, retryHeroSeed);
    };
  }, [refresh]);

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
      cmsAnswered,
      cmsUnavailable,
      state,
      importDefaultHeroSlides,
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
  }, [state, cmsAnswered, cmsUnavailable, apply, importDefaultHeroSlides, push]);

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
  return useMemo(() => [...state[key]].filter((item) => item.published).sort((a, b) => a.sortOrder - b.sortOrder), [state, key]);
}
