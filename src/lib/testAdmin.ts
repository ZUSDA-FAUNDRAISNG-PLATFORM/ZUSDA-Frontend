/** Temporary testing account until the real admin backend is connected. */
export const TEST_ADMIN_USERNAME = "zusda.admin";
export const TEST_ADMIN_PASSWORD = "Kinamba2026";
export const LOCAL_ADMIN_TOKEN = "zusda-local-admin";
export const ADMIN_SESSION_EVENT = "zusda:admin-changed";

export const TEST_ADMIN_PROFILE = {
  id: 0,
  username: TEST_ADMIN_USERNAME,
  email: "admin@zusda.local",
};

export function isLocalAdminToken(token?: string | null) {
  return token === LOCAL_ADMIN_TOKEN;
}

export function matchesTestAdmin(username: string, password: string) {
  return username.trim() === TEST_ADMIN_USERNAME && password === TEST_ADMIN_PASSWORD;
}

export function notifyAdminSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}
