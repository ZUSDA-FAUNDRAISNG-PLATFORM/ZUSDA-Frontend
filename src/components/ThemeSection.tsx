import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { usePublished } from "@/cms/CmsProvider";
import { useInvolvement } from "@/components/InvolvementDialogs";

const ThemeSection = () => {
  const posters = usePublished("posters");
  const { open } = useInvolvement();

  if (!posters.length) return null;

  const columns =
    posters.length === 1
      ? "mx-auto max-w-sm"
      : posters.length === 2
        ? "mx-auto max-w-3xl sm:grid-cols-2"
        : "mx-auto max-w-5xl sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="theme" className="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:scroll-mt-28 sm:py-24">

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="mb-3 text-sm font-medium tracking-wide text-gold-dark">Outreach</p>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="mb-3 font-display text-3xl font-bold text-navy md:text-5xl">Support Mission</h2>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <p className="text-muted-foreground">Choose a cause and give. Each poster is shown at its natural size so nothing is stretched.</p>
          </Reveal>
        </div>

        <div className={`grid items-start gap-6 ${columns}`}>
          {posters.map((poster, i) => (
            <Reveal key={poster.id} direction="zoom" delay={i * 140}>
              <article className="border border-navy/10 bg-white shadow-sm hover-lift hover-glow group overflow-hidden rounded-2xl">
                <div className="flex max-h-[28rem] items-center justify-center overflow-hidden p-3">
                  <img
                    src={poster.imageUrl}
                    alt={poster.title}
                    className="max-h-[26rem] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="border-t border-white/60 bg-white/50 px-4 py-4">
                  <p className="mb-1 text-xs font-medium tracking-wide text-gold-dark">{poster.eyebrow || "Outreach"}</p>
                  <h3 className="mb-3 font-display text-xl font-semibold text-navy">{poster.title}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (poster.ctaHref?.startsWith("#")) {
                        document.getElementById(poster.ctaHref.slice(1))?.scrollIntoView({ behavior: "smooth" });
                      }
                      open("give", { projectId: poster.projectId, causeName: poster.title });
                    }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-navy underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-gold-dark"
                  >
                    {poster.ctaLabel || `Support ${poster.title}`}
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ThemeSection;
