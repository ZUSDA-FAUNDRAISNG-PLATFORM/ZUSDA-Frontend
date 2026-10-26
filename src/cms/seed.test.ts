import { describe, expect, it } from "vitest";
import { defaultHeroSlides, missingDefaultHeroSlides } from "./seed";

describe("missingDefaultHeroSlides", () => {
  it("matches default slides by hero image path", () => {
    const existingHero = { ...defaultHeroSlides[0], id: 99 };
    const sameImageInScripture = { ...defaultHeroSlides[1], placement: "scripture" as const };

    expect(missingDefaultHeroSlides([existingHero, sameImageInScripture])).toEqual([
      defaultHeroSlides[1],
      defaultHeroSlides[2],
    ]);
  });
});
