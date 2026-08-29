import { apiGet } from "./client";

export interface ContributionDTO {
  id: number;
  donor_name: string;
  donor_phone: string;
  amount: number;
  status: string;
  created_at: string;
}

export function getRecentContributions(params?: { projectId?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.projectId) query.set("project_id", String(params.projectId));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiGet<ContributionDTO[]>(`/contributions/recent${qs ? `?${qs}` : ""}`);
}
