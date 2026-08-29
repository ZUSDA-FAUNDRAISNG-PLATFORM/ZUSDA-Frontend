import { apiGet, apiPost, setStoredToken, getStoredToken } from "./client";

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
  const payload = await apiPost<LoginResponse>("/auth/login", { username, password });
  setStoredToken(payload.access_token);
  return payload;
}

export async function logout() {
  setStoredToken(null);
}

export async function getCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    return await apiGet<AuthAdmin>("/auth/me");
  } catch {
    setStoredToken(null);
    return null;
  }
}
