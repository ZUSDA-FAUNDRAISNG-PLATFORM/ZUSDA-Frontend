import { useMemo } from "react";
import { useCms } from "@/cms/CmsProvider";
import type { Slide } from "@/cms/types";

export type HomepageHighlight = Slide & { placement: "hero" };

/**
 * Published Homepage Highlights (CMS slides with placement "hero").
 * Sorted by display order. Supports future start/end scheduling.
 */
export function useHomepageHighlights() {
  const { state, cmsAnswered, cmsUnavailable } = useCms();
  const ready = cmsAnswered || cmsUnavailable;

  const highlights = useMemo(() => {
    const now = Date.now();
    return [...state.slides]
      .filter((slide) => {
        if (slide.placement !== "hero") return false;
        if (!slide.published) return false;
        if (!slide.imageUrl?.trim()) return false;
        if (slide.startsAt) {
          const start = Date.parse(slide.startsAt);
          if (!Number.isNaN(start) && now < start) return false;
        }
        if (slide.endsAt) {
          const end = Date.parse(slide.endsAt);
          if (!Number.isNaN(end) && now > end) return false;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder) as HomepageHighlight[];
  }, [state.slides]);

  return {
    highlights,
    ready,
    count: highlights.length,
    mode: highlights.length === 0 ? "empty" : highlights.length === 1 ? "static" : "slideshow",
  } as const;
}
