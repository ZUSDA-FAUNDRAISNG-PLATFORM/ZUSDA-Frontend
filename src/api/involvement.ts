import { apiPost } from "./client";

export interface PrayerSignupPayload {
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
}

export interface MpesaDonationPayload {
  donor_name: string;
  phone: string;
  amount: number;
  project_id: number;
}

export interface MissionaryRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  church?: string | null;
  age?: number | null;
  notes?: string | null;
}

export function submitPrayerSignup(payload: PrayerSignupPayload) {
  return apiPost(`/prayer-signups/`, payload);
}

export function submitMpesaDonation(payload: MpesaDonationPayload) {
  return apiPost(`/mpesa/stk-push`, payload);
}

export function submitMissionaryRegistration(payload: MissionaryRegistrationPayload) {
  return apiPost(`/missionary-registrations/`, payload);
}
