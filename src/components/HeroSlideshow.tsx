import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface HeroSlideImage {
  src: string;
  caption?: string;
  focal?: "center" | "top" | "bottom" | "left" | "right";
}

const HeroSlideshow = ({ images }: { images: HeroSlideImage[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const currentIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const activeSlide = images[currentIndex];
  const objectPosition = activeSlide?.focal === "top"
    ? "center top"
    : activeSlide?.focal === "bottom"
      ? "center bottom"
      : activeSlide?.focal === "left"
        ? "left center"
        : activeSlide?.focal === "right"
          ? "right center"
          : "center";

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!images.length) return;

    setActiveIndex((current) => Math.min(current, images.length - 1));

    const preloadRemaining = () => {
      images.slice(1).forEach(({ src }) => {
        const image = new Image();
        image.src = src;
      });
    };

    if (document.readyState === "complete") {
      preloadRemaining();
      return;
    }

    window.addEventListener("load", preloadRemaining, { once: true });
    return () => window.removeEventListener("load", preloadRemaining);
  }, [images]);

  useEffect(() => {
    if (images.length < 2 || prefersReducedMotion) return;

    let timer: number | undefined;
    const scheduleAdvance = () => {
      if (document.hidden) return;

      timer = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % images.length);
      }, 6000);
    };
    const onVisibilityChange = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      scheduleAdvance();
    };

    scheduleAdvance();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [images.length, prefersReducedMotion, activeIndex]);

  if (!activeSlide) return null;

  return (
    <div className="absolute inset-0" role="region" aria-roledescription="carousel" aria-label="Hero slideshow">
      <AnimatePresence mode="sync">
        <motion.img
          key={`${currentIndex}:${activeSlide.src}`}
          fetchpriority={currentIndex === 0 ? "high" : "auto"}
          src={activeSlide.src}
          alt=""
          aria-hidden="true"
          decoding="async"
          initial={{ opacity: 0, scale: 1.12, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          style={{ objectPosition }}
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
        />
        <motion.div
          key={`mobile:${currentIndex}:${activeSlide.src}`}
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.12, filter: "blur(16px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute inset-0 bg-navy md:hidden"
        >
          <img
            src={activeSlide.src}
            alt=""
            fetchpriority={currentIndex === 0 ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-35 blur-2xl"
          />
          <img
            src={activeSlide.src}
            alt=""
            fetchpriority={currentIndex === 0 ? "high" : "auto"}
            decoding="async"
            style={{ objectPosition }}
            className="relative h-full w-full object-contain"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-navy/65 via-navy/40 to-navy/70" />
      {activeSlide.caption ? (
        <p className="absolute bottom-20 left-3 right-3 z-10 mx-auto max-w-[min(80%,32rem)] rounded bg-navy/70 px-3 py-1.5 text-center text-xs font-medium text-white/95 shadow sm:bottom-6 sm:left-8 sm:right-auto sm:text-left">
          {activeSlide.caption}
        </p>
      ) : null}
      {images.length > 1 ? (
        <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center" aria-label="Choose hero slide">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === currentIndex}
              onClick={() => setActiveIndex(index)}
              className="flex h-11 w-11 items-center justify-center rounded-full"
            >
              <span className={`h-2.5 rounded-full border border-white/90 transition-all ${
                index === currentIndex ? "w-7 bg-white" : "w-2.5 bg-navy/50 hover:bg-white/70"
              }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default HeroSlideshow;
