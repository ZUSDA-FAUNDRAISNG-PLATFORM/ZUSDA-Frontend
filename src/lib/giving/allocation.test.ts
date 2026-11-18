import { describe, expect, it } from "vitest";
import { autoAllocateSingle, validateAllocations } from "@/lib/giving/allocation";

describe("validateAllocations", () => {
  it("requires allocations to equal the total", () => {
    const result = validateAllocations(1000, ["tithes", "mission"], {
      tithes: 600,
      mission: 300,
    });
    expect(result.isValid).toBe(false);
    expect(result.remaining).toBe(100);
  });

  it("accepts a complete allocation", () => {
    const result = validateAllocations(1000, ["tithes", "mission"], {
      tithes: 600,
      mission: 400,
    });
    expect(result.isValid).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("auto-allocates 100% for a single category", () => {
    expect(autoAllocateSingle(1000, "mission")).toEqual({ mission: 1000 });
  });
});
