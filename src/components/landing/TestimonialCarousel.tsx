import { useEffect, useRef, useState } from "react";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import type { ApprovedTestimonial } from "@/hooks/useApprovedTestimonials";

type TestimonialCarouselProps = {
  items: ApprovedTestimonial[];
};

/**
 * Smooth auto-scrolling carousel for the latest approved testimonials.
 * Infinite loop via duplicated slides, pause on hover/focus, native swipe on touch.
 */
export function TestimonialCarousel({ items }: TestimonialCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const canLoop = items.length > 1;
  const loopItems = !items.length ? [] : canLoop ? [...items, ...items, ...items] : items;

  useEffect(() => {
    if (!canLoop) return;
    const node = scrollerRef.current;
    if (!node) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const step = () => {
      if (paused || !node) return;
      const cardWidth = node.querySelector("[data-slide]")?.clientWidth ?? 352;
      const gap = 20;
      const delta = cardWidth + gap;
      const maxScroll = node.scrollWidth / 3;

      if (node.scrollLeft >= maxScroll) {
        node.scrollLeft = node.scrollLeft - maxScroll;
      }
      node.scrollBy({ left: delta, behavior: "smooth" });
    };

    const id = window.setInterval(step, 4200);
    return () => window.clearInterval(id);
  }, [canLoop, paused]);

  if (!items.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="Approved testimonials carousel"
      >
        {loopItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            data-slide
            className="w-[min(100%-0.5rem,22rem)] shrink-0 snap-center sm:w-[22rem]"
          >
            <TestimonialCard
              name={item.name}
              quote={item.quote}
              role={item.role}
              rating={item.rating}
              staticCard
              className="h-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestimonialCarousel;
