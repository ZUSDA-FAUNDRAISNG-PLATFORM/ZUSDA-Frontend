import { describe, it, expect } from "vitest";
import { resolveApiBaseUrl } from "../api/client";

describe("API client", () => {
  it("uses the deployed backend by default when no env URL is set", () => {
    expect(resolveApiBaseUrl("")).toBe("https://zusda-backend.onrender.com/api");
    expect(resolveApiBaseUrl("http://localhost:5000/api")).toBe("http://localhost:5000/api");
  });
});
