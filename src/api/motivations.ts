import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "./client";
import type { MotivationSlide } from "@/lib/motivations";

export type MotivationSlideDTO = MotivationSlide;

export function listMotivations() {
  return apiGet<MotivationSlideDTO[]>("/motivations/");
}

export function createMotivation(input: Partial<MotivationSlideDTO>) {
  return apiPost<MotivationSlideDTO>("/motivations/", input);
}

export function updateMotivation(id: number, input: Partial<MotivationSlideDTO>) {
  return apiPut<MotivationSlideDTO>(`/motivations/${id}`, input);
}

export function uploadMotivationImage(id: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiUpload<MotivationSlideDTO>(`/motivations/${id}/image`, formData);
}

export function deleteMotivation(id: number) {
  return apiDelete<{ message: string }>(`/motivations/${id}`);
}
