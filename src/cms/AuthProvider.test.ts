import { describe, expect, it } from "vitest";
import { isAdminRole, normalizeRole } from "./AuthProvider";

describe("admin role handling", () => {
  it("treats super_admin and editor as admin roles", () => {
    expect(normalizeRole("super_admin")).toBe("admin");
    expect(normalizeRole("editor")).toBe("admin");
    expect(isAdminRole("super_admin")).toBe(true);
    expect(isAdminRole("editor")).toBe(true);
    expect(isAdminRole("member")).toBe(false);
  });
});
