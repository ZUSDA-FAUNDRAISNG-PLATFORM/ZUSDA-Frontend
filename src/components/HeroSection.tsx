import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import heroFallbackImage from "@/assets/hero-bg.webp";
import CountdownTimer from "./CountdownTimer";
import HeroSlideshow, { type HeroSlideImage } from "./HeroSlideshow";
import Reveal from "./Reveal";
import DaysToGo from "./DaysToGo";
import { useInvolvement } from "./InvolvementDialogs";
import { useCountdown } from "@/hooks/useCountdown";
import { useCms, usePublished } from "@/cms/CmsProvider";

const GALLERY_FALLBACKS = ["/uploads/gallery-0-imageurl.jpg", "/uploads/gallery-1-imageurl.jpg"];

const HeroSection = () => {
  const { open } = useInvolvement();
  const { state } = useCms();
  const posters = usePublished("posters");
  const publishedSlides = usePublished("slides");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { site } = state;
  const countdown = useCountdown(site.countdownDate);
  const slides = useMemo<HeroSlideImage[]>(() => {
    const cmsSlides = publishedSlides
      .filter((slide) => slide.placement === "hero")
      .filter((slide) => slide.imageUrl.trim())
      .map((slide) => ({
        src: slide.imageUrl,
        caption: slide.caption || undefined,
        focal: slide.focal ?? "center",
      }));

    if (cmsSlides.length >= 2) return cmsSlides;

    return [
      { src: site.heroImageUrl || heroFallbackImage },
      ...GALLERY_FALLBACKS.map((src) => ({ src })),
    ];
  }, [publishedSlides, site.heroImageUrl]);

  return (
    <section id="home" className="relative flex min-h-screen supports-[height:100svh]:min-h-[100svh] items-center justify-center overflow-hidden">
      <HeroSlideshow images={slides} />

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-24 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-4xl p-2 text-center sm:p-10 md:p-14">
          <Reveal direction="down" delay={0}>
            <p className="mb-4 text-sm font-semibold tracking-wide text-gold">{site.heroEyebrow}</p>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <h1 className="mb-4 break-words font-display text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              {site.heroTitle}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={240}>
            <p className="mb-3 font-display text-lg italic text-white/95 sm:text-xl md:text-2xl">{site.heroSubtitle}</p>
          </Reveal>
          <Reveal direction="up" delay={340}>
            <p className="mb-10 text-sm font-medium text-white/90 sm:text-base md:text-lg">{site.heroMeta}</p>
          </Reveal>

          <DaysToGo days={countdown.expired ? -1 : countdown.days} />
          <Reveal direction="zoom" delay={460}>
            <CountdownTimer time={countdown} />
          </Reveal>

          <Reveal direction="up" delay={600}>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 min-[480px]:flex-row">
              <button
                onClick={() =>
                  open("give", {
                    projectId: featured?.projectId,
                    causeName: featured?.title || "the Mission",
                  })
                }
                className="hover-lift min-h-11 w-full rounded-lg bg-gold px-8 py-3 text-base font-semibold text-navy hover:bg-gold/90 min-[480px]:w-auto"
              >
                Support {featured?.title || "the Mission"}
              </button>
              <a
                href="#involved"
                className="hover-lift min-h-11 w-full rounded-lg border border-white/30 bg-navy/60 px-8 py-3 text-center text-base font-semibold text-white hover:bg-navy/75 min-[480px]:w-auto"
              >
                Get Involved
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <a href="#about" aria-label="Scroll to about" className="absolute bottom-8 left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 animate-bounce items-center justify-center text-white/80 transition-colors hover:text-white sm:flex">
        <ChevronDown size={28} />
      </a>
    </section>
  );
};

export default HeroSection;
