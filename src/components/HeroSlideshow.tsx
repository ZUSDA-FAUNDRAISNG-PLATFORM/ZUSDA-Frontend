import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HERO_SLIDES_CACHE, readJson, writeJson } from "@/cms/utils";

const ROTATION_DELAY_MS = 6000;
const CMS_TIMEOUT_MS = 3000;

export interface HeroSlideImage {
  src: string;
  caption?: string;
  focal?: "center" | "top" | "bottom" | "left" | "right";
  sortOrder?: number;
}

function getCachedSlides() {
  const cached = readJson<HeroSlideImage[]>(HERO_SLIDES_CACHE);
  if (!Array.isArray(cached)) return [];
  return cached.filter((slide) => slide && typeof slide.src === "string" && slide.src.trim());
}

function hasCachedSlides() {
  return Array.isArray(readJson<HeroSlideImage[]>(HERO_SLIDES_CACHE));
}

const HeroSlideshow = ({
  images,
  cmsReady = true,
  cmsUnavailable = false,
  fallbackImage = "",
}: {
  images: HeroSlideImage[];
  cmsReady?: boolean;
  cmsUnavailable?: boolean;
  fallbackImage?: string;
}) => {
  const [slides, setSlides] = useState<HeroSlideImage[]>(getCachedSlides);
  const [hasCache, setHasCache] = useState(hasCachedSlides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (cmsReady) {
      writeJson(HERO_SLIDES_CACHE, images);
      setHasCache(true);
      setSlides(images);
      setActiveIndex(0);
      setShowFallback(images.length === 0 && Boolean(fallbackImage));
      return;
    }

    if (cmsUnavailable && slides.length === 0) {
      if (!hasCache && images.length > 0) {
        setSlides(images);
        setActiveIndex(0);
        setShowFallback(false);
      } else if (hasCache) {
        setShowFallback(Boolean(fallbackImage));
      }
    }
  }, [cmsReady, cmsUnavailable, fallbackImage, hasCache, images, slides.length]);

  useEffect(() => {
    if (cmsReady || cmsUnavailable || slides.length > 0 || showFallback) return;

    const timer = window.setTimeout(() => setShowFallback(true), CMS_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [cmsReady, cmsUnavailable, fallbackImage, showFallback, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;

    let timer: number | undefined;
    const scheduleAdvance = () => {
      if (document.hidden) return;

      timer = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % slides.length);
      }, ROTATION_DELAY_MS);
    };
    const onVisibilityChange = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
      scheduleAdvance();
    };

    if (!prefersReducedMotion) scheduleAdvance();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activeIndex, prefersReducedMotion, slides]);

  const currentSlides = cmsReady ? images : slides;
  const currentIndex = currentSlides.length > 0 ? activeIndex % currentSlides.length : 0;
  const visibleSlides = useMemo(
    () =>
      currentSlides.length > 0
        ? currentSlides
        : (cmsReady || showFallback) && fallbackImage
          ? [{ src: fallbackImage }]
          : [],
    [cmsReady, currentSlides, fallbackImage, showFallback],
  );
  const activeSlide = visibleSlides[currentIndex];
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
    if (!visibleSlides.length) return;
    visibleSlides.slice(1).forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });
  }, [visibleSlides]);

  return (
    <div className="absolute inset-0" role="region" aria-roledescription="carousel" aria-label="Hero slideshow">
      {activeSlide ? (
        <AnimatePresence key={cmsReady ? JSON.stringify(images.map((image) => image.src)) : "cms-pending"} mode="sync">
          <motion.img
            key={`desktop:${activeSlide.src}`}
            fetchpriority={currentIndex === 0 ? "high" : "auto"}
            src={activeSlide.src}
            alt=""
            aria-hidden="true"
            decoding="async"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ objectPosition }}
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
          />
          <motion.div
            key={`mobile:${activeSlide.src}`}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
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
      ) : (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-navy">
          <div className="absolute -inset-1/4 rounded-full bg-navy-light/20 opacity-40 blur-3xl" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/65 via-navy/40 to-navy/70" />
      {activeSlide?.caption ? (
        <p className="absolute bottom-20 left-3 right-3 z-10 mx-auto max-w-[min(80%,32rem)] rounded bg-navy/70 px-3 py-1.5 text-center text-xs font-medium text-white/95 shadow sm:bottom-6 sm:left-8 sm:right-auto sm:text-left">
          {activeSlide.caption}
        </p>
      ) : null}
      {currentSlides.length > 1 ? (
        <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center" aria-label="Choose hero slide">
          {currentSlides.map((image, index) => (
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
