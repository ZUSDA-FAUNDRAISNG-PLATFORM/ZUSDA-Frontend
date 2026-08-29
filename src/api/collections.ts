import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "./client";

export interface EventCollectionDTO {
  id: number;
  name: string;
  isPrimary: boolean;
  projectId?: number | null;
  eyebrow?: string | null;
  heading?: string | null;
  posterUrl?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  durationLabel?: string | null;
  season?: string | null;
  themeTitle?: string | null;
  themeSubtitle?: string | null;
  verseText?: string | null;
  verseRef?: string | null;
  hymn?: string | null;
  hymnDesc?: string | null;
  createdAt?: string;
}

export function listCollections() {
  return apiGet<EventCollectionDTO[]>("/event-collections/");
}

export function getPrimaryCollection() {
  return apiGet<EventCollectionDTO>("/event-collections/primary");
}

export function getCollection(id: number) {
  return apiGet<EventCollectionDTO>(`/event-collections/${id}`);
}

export function createCollection(input: Partial<EventCollectionDTO>) {
  return apiPost<EventCollectionDTO>("/event-collections/", input);
}

export function updateCollection(id: number, input: Partial<EventCollectionDTO>) {
  return apiPut<EventCollectionDTO>(`/event-collections/${id}`, input);
}

export function uploadPoster(id: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<EventCollectionDTO>(`/event-collections/${id}/poster`, formData);
}

export function setPrimaryCollection(id: number) {
  return apiPost<EventCollectionDTO>(`/event-collections/${id}/set-primary`);
}

export function deleteCollection(id: number) {
  return apiDelete<{ message: string }>(`/event-collections/${id}`);
}
