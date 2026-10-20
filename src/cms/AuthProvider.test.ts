import { describe, expect, it } from "vitest";
import { isAdminRole, normalizeRole } from "./AuthProvider";

describe("admin role handling", () => {
  it("keeps super_admin and editor distinct but treats both as admin roles", () => {
    expect(normalizeRole("super_admin")).toBe("super_admin");
    expect(normalizeRole("editor")).toBe("editor");
    expect(normalizeRole("admin")).toBe("admin");
    expect(normalizeRole("bogus")).toBe("member");
    expect(normalizeRole(undefined)).toBe("member");
    expect(isAdminRole("super_admin")).toBe(true);
    expect(isAdminRole("editor")).toBe(true);
    expect(isAdminRole("member")).toBe(false);
  });
});
