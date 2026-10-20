import Reveal from "@/components/Reveal";
import { useCms } from "@/cms/CmsProvider";

const CTASection = () => {
  const { state } = useCms();
  const lines = state.site.ctaTitle.split("\n");

  return (
    <section className="relative overflow-hidden bg-navy py-16 sm:py-24">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${state.site.ctaImageUrl})` }} />
      <div className="absolute inset-0 bg-navy/70" />
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <Reveal direction="zoom">
          <div className="glass-dark mx-auto max-w-3xl rounded-3xl p-8 text-center sm:p-12">
            <h2 className="mb-6 font-display text-3xl font-bold leading-tight text-white md:text-5xl">
              {lines.map((line, index) => (
                <span key={line}>
                  {index === lines.length - 1 ? <span className="text-gold">{line}</span> : line}
                  {index < lines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p className="mx-auto max-w-xl text-lg text-white/70">{state.site.ctaBody}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default CTASection;
