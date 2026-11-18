import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HomepageHighlight } from "@/hooks/useHomepageHighlights";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;
const RESUME_MS = 8000;

type HeroHighlightsCardProps = {
  highlights: HomepageHighlight[];
  loading?: boolean;
  className?: string;
  /** Compact preview for CMS admin. */
  preview?: boolean;
};

function captionLines(item: HomepageHighlight) {
  const title = item.title?.trim() || "";
  const caption = item.caption?.trim() || item.subtitle?.trim() || "";
  const meta = [item.verseText, item.eventDate, item.location].filter(Boolean).join(" · ");
  return { title, caption, meta };
}

/**
 * Right-side Hero Image Card.
 * 0 → empty placeholder | 1 → static | 2+ → image-only slideshow (left hero text stays static).
 */
export function HeroHighlightsCard({ highlights, loading, className, preview }: HeroHighlightsCardProps) {
  const isSlideshow = highlights.length >= 2;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resumeTimer = useRef<number>();

  const active = highlights[Math.min(index, Math.max(highlights.length - 1, 0))];
  const { title, caption, meta } = active ? captionLines(active) : { title: "", caption: "", meta: "" };

  const goTo = useCallback(
    (next: number) => {
      if (highlights.length < 2) return;
      const len = highlights.length;
      setIndex(((next % len) + len) % len);
    },
    [highlights.length],
  );

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), RESUME_MS);
  }, []);

  useEffect(() => {
    if (!isSlideshow || paused) return;
    const id = window.setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [goTo, index, isSlideshow, paused]);

  useEffect(() => {
    if (!isSlideshow) return;
    const next = highlights[(index + 1) % highlights.length];
    if (!next?.imageUrl) return;
    const img = new Image();
    img.src = next.imageUrl;
  }, [highlights, index, isSlideshow]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-card border border-[#1C1D4D]/8 bg-white shadow-[0_8px_32px_rgba(21,22,58,0.08)]",
          className,
        )}
        aria-busy="true"
        aria-label="Loading homepage highlight"
      >
        <div className="aspect-[4/3] animate-pulse bg-[#EEF2F7] sm:aspect-[16/11]" />
        <div className="border-t border-[#1C1D4D]/8 px-5 py-4">
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#1C1D4D]/10" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded-full bg-[#1C1D4D]/8" />
        </div>
      </div>
    );
  }

  return (
    <div
      tabIndex={isSlideshow ? 0 : undefined}
      onMouseEnter={() => isSlideshow && setPaused(true)}
      onMouseLeave={() => isSlideshow && setPaused(false)}
      onFocus={() => isSlideshow && setPaused(true)}
      onBlur={() => isSlideshow && setPaused(false)}
      onKeyDown={(event) => {
        if (!isSlideshow) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          pauseTemporarily();
          goTo(index + 1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          pauseTemporarily();
          goTo(index - 1);
        }
      }}
      onTouchStart={(event) => {
        if (isSlideshow) setPaused(true);
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (!isSlideshow) return;
        const startX = touchStartX.current;
        touchStartX.current = null;
        if (startX == null) {
          pauseTemporarily();
          return;
        }
        const delta = (event.changedTouches[0]?.clientX ?? 0) - startX;
        if (Math.abs(delta) < 40) {
          pauseTemporarily();
          return;
        }
        pauseTemporarily();
        goTo(delta < 0 ? index + 1 : index - 1);
      }}
      role={isSlideshow ? "region" : undefined}
      aria-roledescription={isSlideshow ? "carousel" : undefined}
      aria-label={isSlideshow ? "Homepage highlights" : undefined}
      className={cn(
        "relative overflow-hidden rounded-card border border-[#1C1D4D]/8 bg-white shadow-[0_8px_32px_rgba(21,22,58,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
    >
      {!active ? (
        <div
          className="flex aspect-[4/3] items-center justify-center bg-[#EEF2F7] px-6 text-center sm:aspect-[16/11]"
          role="img"
          aria-label="No homepage highlight published"
        >
          <div>
            <p className="font-display text-lg font-semibold text-heading">Homepage highlight coming soon</p>
            <p className="mt-2 text-sm text-muted-body">Publish a highlight in the CMS to showcase it here.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF2F7] sm:aspect-[16/11]">
            <AnimatePresence mode="sync">
              <motion.img
                key={active.id}
                src={active.imageUrl}
                alt={title || "Homepage highlight"}
                decoding="async"
                loading={preview || index > 0 ? "lazy" : "eager"}
                fetchPriority={index === 0 ? "high" : "auto"}
                initial={isSlideshow ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isSlideshow ? { opacity: 0 } : undefined}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
          </div>
          <div className="border-t border-[#1C1D4D]/8 px-5 py-4">
            <p className="text-sm font-semibold text-heading">{title || meta || "Highlight"}</p>
            <p className="mt-1 text-sm text-body">
              {caption || meta || "A welcoming home for faith-driven giving and prayer."}
            </p>
            {meta && (title || caption) ? <p className="mt-1 text-xs text-muted-body">{meta}</p> : null}
            {active.buttonText?.trim() && active.buttonLink?.trim() ? (
              <a
                href={active.buttonLink}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                {active.buttonText}
              </a>
            ) : null}
          </div>
        </>
      )}

      {isSlideshow ? (
        <div
          className="absolute bottom-[5.5rem] left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#15163A]/45 px-2 py-1 backdrop-blur sm:bottom-24"
          role="tablist"
          aria-label="Highlight slides"
        >
          {highlights.map((item, slideIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`Show highlight ${slideIndex + 1}`}
              className="flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              onClick={() => {
                pauseTemporarily();
                goTo(slideIndex);
              }}
            >
              <span
                className={cn(
                  "h-2 rounded-full border border-white/90 transition-all",
                  slideIndex === index ? "w-5 bg-white" : "w-2 bg-white/45 hover:bg-white/75",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}

      {isSlideshow ? (
        <div className="sr-only" aria-live="polite">
          {title}
        </div>
      ) : null}
    </div>
  );
}

export default HeroHighlightsCard;
