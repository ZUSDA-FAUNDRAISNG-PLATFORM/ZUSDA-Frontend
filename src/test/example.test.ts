import { describe, it, expect } from "vitest";
import { resolveApiBaseUrl } from "../api/client";

describe("API client", () => {
  it("uses the same-origin API path in every environment", () => {
    expect(resolveApiBaseUrl()).toBe("/api");
  });
});
