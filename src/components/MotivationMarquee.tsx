import { usePublished } from "@/cms/CmsProvider";

const MotivationMarquee = () => {
  const slides = usePublished("slides");
  if (!slides.length) return null;

  return (
    <div className="relative w-full overflow-hidden" role="region" aria-label="Mission motivation highlights">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-cream to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-cream to-transparent md:w-16" />
      <div className="flex w-max animate-marquee py-1 hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:w-full motion-reduce:overflow-x-auto">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-4 pr-4" aria-hidden={copy === 1}>
            {slides.map((slide) => (
              <article key={`${slide.id}-${copy}`} className="relative h-56 w-[min(88vw,28rem)] shrink-0 overflow-hidden rounded-xl border border-navy/10 bg-navy sm:h-64 md:h-80">
                <img src={slide.imageUrl} alt={slide.title} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                <blockquote className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <p className="font-display max-w-md text-base italic leading-snug text-white md:text-xl">“{slide.caption}”</p>
                  {slide.attribution ? <cite className="mt-2 block text-sm not-italic text-gold">— {slide.attribution}</cite> : null}
                </blockquote>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MotivationMarquee;
