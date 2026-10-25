import { useState } from "react";
import Reveal from "@/components/Reveal";
import Lightbox from "@/components/Lightbox";
import CmsImage from "@/components/CmsImage";
import { usePublished } from "@/cms/CmsProvider";

export const AnnouncementsSection = () => {
  const items = usePublished("announcements");
  if (!items.length) return null;
  return (
    <section id="announcements" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="container relative mx-auto px-4">
        <Reveal direction="left">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Announcements</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.id} direction={i % 2 === 0 ? "left" : "right"} delay={(i % 4) * 100} className="h-full">
              <article className="border border-navy/10 bg-white shadow-sm hover-lift hover-glow h-full rounded-2xl p-6">
                <p className="mb-2 text-xs font-medium tracking-wide text-gold-dark">{item.date}</p>
                <h3 className="mb-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export const EventsSection = () => {
  const items = usePublished("events");
  if (!items.length) return null;
  return (
    <section id="events" className="relative overflow-hidden bg-cream py-16 sm:py-24">
      <div className="container relative mx-auto px-4">
        <Reveal direction="right">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Events</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.id} direction="up" delay={(i % 2) * 140} className="h-full">
              <article className="border border-navy/10 bg-white shadow-sm hover-lift hover-glow group h-full overflow-hidden rounded-2xl">
                {item.imageUrl ? (
                  <div className="overflow-hidden">
                    <CmsImage
                      src={item.imageUrl}
                      alt={item.title}
                      width={1200}
                      height={600}
                      className="aspect-[16/9] w-full bg-cream object-contain transition-transform duration-500"
                    />
                  </div>
                ) : null}
                <div className="p-6">
                  <h3 className="mb-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                  <p className="mb-2 text-sm text-navy/60">{item.location} · {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}</p>
                  <p className="text-muted-foreground">{item.summary}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export const GallerySection = () => {
  const items = usePublished("gallery");
  const [active, setActive] = useState<number | null>(null);
  if (!items.length) return null;
  return (
    <section id="gallery" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="container relative mx-auto px-4">
        <Reveal direction="left">
          <h2 className="mb-8 font-display text-3xl font-bold text-navy">Gallery</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.id} direction="zoom" delay={(i % 4) * 90}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Open photo${item.caption ? `: ${item.caption}` : ""}`}
                className="hover-lift group relative block min-h-11 w-full overflow-hidden rounded-2xl bg-cream"
              >
                <CmsImage
                  src={item.imageUrl}
                  alt={item.caption}
                  width={600}
                  height={600}
                  className="aspect-square w-full object-contain transition-transform duration-500"
                />
                {item.caption ? (
                  <span className="absolute inset-x-0 bottom-0 bg-navy/85 p-2 text-left text-xs text-white transition-transform duration-300 md:translate-y-full md:group-hover:translate-y-0">
                    {item.caption}
                  </span>
                ) : null}
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Lightbox items={items} index={active} onClose={() => setActive(null)} onChange={setActive} />
    </section>
  );
};
