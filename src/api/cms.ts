import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import type { CmsCollection, CmsState, SiteSettings } from "@/cms/types";

export type RemoteCms = { site: SiteSettings | null } & { [K in CmsCollection]: CmsState[K] };

export const fetchCms = () => apiGet<RemoteCms>("/cms/");

export const importCms = (state: Omit<CmsState, "users">) => apiPost<RemoteCms>("/cms/import", state);

export const saveSite = (patch: Partial<SiteSettings>) => apiPut<SiteSettings>("/cms/site", patch);

export const createCmsItem = <K extends CmsCollection>(key: K, item: unknown) =>
  apiPost<CmsState[K][number]>(`/cms/${key}`, item);

export const updateCmsItem = <K extends CmsCollection>(key: K, id: number, item: unknown) =>
  apiPut<CmsState[K][number]>(`/cms/${key}/${id}`, item);

export const deleteCmsItem = (key: CmsCollection, id: number) =>
  apiDelete<{ message: string }>(`/cms/${key}/${id}`);

export const replaceCollection = <K extends CmsCollection>(key: K, items: CmsState[K]) =>
  apiPut<CmsState[K]>(`/cms/${key}`, items);
