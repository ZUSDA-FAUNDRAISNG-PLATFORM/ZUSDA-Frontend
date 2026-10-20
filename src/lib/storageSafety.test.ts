import { afterEach, describe, expect, it, vi } from "vitest";
import { sanitizeCmsAssetRefs, writeJson } from "@/cms/utils";
import { saveCollections } from "./eventCollections";

describe("storage safety", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("removes embedded image payloads and retries when localStorage hits quota", () => {
    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "demo" && value.includes("data:image")) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

    expect(() =>
      writeJson("demo", {
        site: {
          heroImageUrl: "data:image/png;base64,AAAA",
          title: "Hello",
        },
      }),
    ).not.toThrow();

    const stored = sessionStorage.getItem("demo:session");
    expect(stored).toContain("Hello");
    expect(stored).not.toContain("data:image");
  });

  it("does not crash when saving collections after quota errors", () => {
    const originalSetItem = Storage.prototype.setItem;
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    setItemSpy.mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === "event-collections-v2" && value.includes("data:image")) {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

    expect(() =>
      saveCollections([
        {
          id: "mission-2026",
          name: "Mission 2026",
          isPrimary: true,
          eyebrow: "Mission Details",
          heading: "When & Where",
          posterUrl: "data:image/png;base64,AAAA",
          location: "Kinamba",
          startDate: "2026-12-13",
          endDate: "2026-12-27",
          durationLabel: "13 days",
          season: "December",
          themeTitle: "Njooni",
          themeSubtitle: "Reason together",
          verseText: "hello",
          verseRef: "John 1:1",
          hymn: "Hymn 170",
          hymnDesc: "desc",
        },
      ]),
    ).not.toThrow();
  });

  it("restores seed asset paths when cached build URLs are stale", () => {
    const stale = {
      committee: [
        {
          id: 1,
          name: "Gregory Daghe",
          photoUrl: "/assets/Gregory_Daghe-Cimn_Pl-.jpeg",
          department: "General Oversight",
          isChair: true,
        },
      ],
    };

    const seed = {
      committee: [
        {
          id: 1,
          name: "Gregory Daghe",
          photoUrl: "/src/assets/committee/Gregory_Daghe.jpeg",
          department: "General Oversight",
          isChair: true,
        },
      ],
    };

    const fixed = sanitizeCmsAssetRefs(stale, seed);

    expect(fixed.committee[0].photoUrl).toBe("/src/assets/committee/Gregory_Daghe.jpeg");
  });
});
