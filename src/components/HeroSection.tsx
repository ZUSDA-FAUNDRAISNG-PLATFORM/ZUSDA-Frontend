import { ChevronDown } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { useInvolvement } from "./InvolvementDialogs";
import { useCms, usePublished } from "@/cms/CmsProvider";

const HeroSection = () => {
  const { open } = useInvolvement();
  const { state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { site } = state;

  return (
    <section id="home" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${site.heroImageUrl})` }} />
      <div className="absolute inset-0 bg-cream/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-cream/20 via-transparent to-cream" />

      <div className="relative z-10 container mx-auto px-4 py-28 text-center sm:py-32">
        <p className="mb-4 text-sm font-medium text-gold-dark">{site.heroEyebrow}</p>
        <h1 className="mb-4 break-words font-display text-4xl font-bold leading-tight text-navy md:text-6xl lg:text-7xl">
          {site.heroTitle}
        </h1>
        <p className="mb-3 font-display text-lg italic text-navy/80 sm:text-xl md:text-2xl">{site.heroSubtitle}</p>
        <p className="mb-10 text-sm font-medium text-navy/70 sm:text-base md:text-lg">{site.heroMeta}</p>

        <CountdownTimer targetDate={site.countdownDate} />

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() =>
              open("give", {
                projectId: featured?.projectId,
                causeName: featured?.title || "the Mission",
              })
            }
            className="w-full rounded-lg bg-navy px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-navy-light sm:w-auto"
          >
            Support {featured?.title || "the Mission"}
          </button>
          <a
            href="#involved"
            className="w-full rounded-lg border border-navy/20 bg-white/70 px-8 py-3 text-center text-base font-semibold text-navy transition-colors hover:border-navy/40 hover:bg-white sm:w-auto"
          >
            Get Involved
          </a>
        </div>
      </div>

      <a href="#about" aria-label="Scroll to about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-navy/40 hover:text-navy/70">
        <ChevronDown size={28} />
      </a>
    </section>
  );
};

export default HeroSection;
