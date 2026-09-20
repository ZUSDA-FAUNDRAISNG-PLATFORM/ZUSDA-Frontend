import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/api/client";
import { listMotivations } from "@/api/motivations";
import { DEFAULT_MOTIVATIONS, type MotivationSlide } from "@/lib/motivations";

function normalizeSlides(items: MotivationSlide[]): MotivationSlide[] {
  return items
    .filter((slide) => slide.isActive !== false)
    .map((slide) => ({
      ...slide,
      imageUrl: resolveAssetUrl(slide.imageUrl) || slide.imageUrl,
    }))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function useMotivations() {
  const [slides, setSlides] = useState<MotivationSlide[]>(DEFAULT_MOTIVATIONS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const items = await listMotivations();
        if (cancelled || !items?.length) return;
        setSlides(normalizeSlides(items));
      } catch {
        // CMS endpoint is not required yet — keep bundled placeholders.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { slides };
}
