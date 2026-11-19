export const ADMIN_SESSION_EVENT = "zusda:admin-changed";

export function notifyAdminSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}
