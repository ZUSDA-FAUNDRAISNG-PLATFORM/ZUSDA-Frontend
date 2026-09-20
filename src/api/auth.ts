import { apiGet, apiPost, setStoredToken, getStoredToken } from "./client";
import {
  LOCAL_ADMIN_TOKEN,
  TEST_ADMIN_PROFILE,
  isLocalAdminToken,
  matchesTestAdmin,
  notifyAdminSessionChanged,
} from "@/lib/testAdmin";

export interface AuthAdmin {
  id: number;
  username: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  admin: AuthAdmin;
}

export async function login(username: string, password: string) {
  try {
    const payload = await apiPost<LoginResponse>("/auth/login", { username, password });
    setStoredToken(payload.access_token);
    notifyAdminSessionChanged();
    return payload;
  } catch (error) {
    if (matchesTestAdmin(username, password)) {
      setStoredToken(LOCAL_ADMIN_TOKEN);
      notifyAdminSessionChanged();
      return { access_token: LOCAL_ADMIN_TOKEN, admin: TEST_ADMIN_PROFILE };
    }
    throw error;
  }
}

export async function logout() {
  setStoredToken(null);
  notifyAdminSessionChanged();
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  if (isLocalAdminToken(token)) return TEST_ADMIN_PROFILE;
  try {
    return await apiGet<AuthAdmin>("/auth/me");
  } catch {
    setStoredToken(null);
    return null;
  }
}
