import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import Reveal from "./Reveal";
import DaysToGo from "./DaysToGo";
import { useInvolvement } from "./InvolvementDialogs";
import { useCms, usePublished } from "@/cms/CmsProvider";

const DEFAULT_HERO_IMAGE = "/uploads/site-heroimageurl.jpg";

const HeroSection = () => {
  const { open } = useInvolvement();
  const { ready, state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { site } = state;
  const [heroImageUrl, setHeroImageUrl] = useState(DEFAULT_HERO_IMAGE);

  useEffect(() => {
    const cmsImageUrl = site.heroImageUrl;
    if (!ready || !cmsImageUrl || cmsImageUrl === DEFAULT_HERO_IMAGE) return;

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) setHeroImageUrl(cmsImageUrl);
    };
    image.onerror = () => {
      console.error("Could not load the configured hero image; keeping the default image.", cmsImageUrl);
    };
    image.src = cmsImageUrl;

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [ready, site.heroImageUrl]);

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <img
        src={heroImageUrl}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-cream/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream/80" />

      <div className="relative z-10 container mx-auto px-4 py-28 sm:py-32">
        <div className="mx-auto max-w-4xl p-6 text-center sm:p-10 md:p-14">
          <Reveal direction="down" delay={0}>
            <p className="mb-4 text-sm font-medium tracking-wide text-gold-dark">{site.heroEyebrow}</p>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <h1 className="mb-4 break-words font-display text-4xl font-bold leading-tight text-navy md:text-6xl lg:text-7xl">
              {site.heroTitle}
            </h1>
          </Reveal>
          <Reveal direction="up" delay={240}>
            <p className="mb-3 font-display text-lg italic text-navy/80 sm:text-xl md:text-2xl">{site.heroSubtitle}</p>
          </Reveal>
          <Reveal direction="up" delay={340}>
            <p className="mb-10 text-sm font-medium text-navy/70 sm:text-base md:text-lg">{site.heroMeta}</p>
          </Reveal>

          <DaysToGo date={site.countdownDate} />
          <Reveal direction="zoom" delay={460}>
            <CountdownTimer targetDate={site.countdownDate} />
          </Reveal>

          <Reveal direction="up" delay={600}>
            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() =>
                  open("give", {
                    projectId: featured?.projectId,
                    causeName: featured?.title || "the Mission",
                  })
                }
                className="hover-lift w-full rounded-lg bg-navy px-8 py-3 text-base font-semibold text-white hover:bg-navy-light sm:w-auto"
              >
                Support {featured?.title || "the Mission"}
              </button>
              <a
                href="#involved"
                className="hover-lift w-full rounded-lg border border-navy/20 bg-white/70 px-8 py-3 text-center text-base font-semibold text-navy hover:bg-white/80 sm:w-auto"
              >
                Get Involved
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <a href="#about" aria-label="Scroll to about" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-navy/50 transition-colors hover:text-navy">
        <ChevronDown size={28} />
      </a>
    </section>
  );
};

export default HeroSection;
