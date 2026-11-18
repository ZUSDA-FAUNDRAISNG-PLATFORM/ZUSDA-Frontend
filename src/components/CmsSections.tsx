import { useState } from "react";
import Reveal from "@/components/Reveal";
import Lightbox from "@/components/Lightbox";
import CmsImage from "@/components/CmsImage";
import { AssignedCommittee } from "@/components/cms/AssignedCommittee";
import { usePublished } from "@/cms/CmsProvider";
import { focalObjectClass } from "@/lib/imageFocal";

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
              <article className="border border-navy/10 bg-white shadow-sm hover-lift hover-glow flex h-full flex-col rounded-2xl p-6">
                <p className="mb-2 text-xs font-medium tracking-wide text-gold-dark">{item.date}</p>
                <h3 className="mb-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="flex-1 text-muted-foreground">{item.body}</p>
                <AssignedCommittee committeeId={item.committeeId} compact />
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
  if (!items.length) {
    return (
      <section id="events" className="relative scroll-mt-28 bg-white py-16 sm:py-20">
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-xl rounded-card border border-dashed border-[#1C1D4D]/15 bg-[#F7F8FC] px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-bold text-heading">Events</h2>
            <p className="mt-2 text-sm text-muted-body">No events are visible yet. Publish an event in the CMS to show it here.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="relative scroll-mt-28 bg-white py-16 sm:py-20">
      <div className="container relative mx-auto px-4">
        <Reveal direction="right">
          <h2 className="mb-8 section-title">Events</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item, i) => (
            <Reveal key={item.id} direction="up" delay={(i % 2) * 100} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-card border border-[#1C1D4D]/8 bg-white shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_14px_36px_rgba(21,22,58,0.12)]">
                <div className="relative aspect-[16/9] overflow-hidden bg-[#EEF2F7]">
                  {item.imageUrl ? (
                    <CmsImage
                      src={item.imageUrl}
                      alt={item.title}
                      width={1200}
                      height={675}
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      className={`h-full w-full transition-transform duration-500 group-hover:scale-[1.02] ${focalObjectClass(item.focal)}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <p className="text-sm font-medium text-heading/40">No event image available</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 font-display text-xl font-semibold text-heading">{item.title}</h3>
                  <p className="mb-2 text-sm text-muted-body">
                    {item.location} · {item.startDate}
                    {item.endDate ? ` – ${item.endDate}` : ""}
                  </p>
                  <p className="flex-1 text-sm leading-relaxed text-body">{item.summary}</p>
                  <AssignedCommittee committeeId={item.committeeId} />
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
  if (!items.length) {
    return (
      <section id="gallery" className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-xl rounded-card border border-dashed border-[#1C1D4D]/15 bg-[#F7F8FC] px-6 py-10 text-center">
            <h2 className="font-display text-2xl font-bold text-heading">Gallery</h2>
            <p className="mt-2 text-sm text-muted-body">No gallery images uploaded yet.</p>
          </div>
        </div>
      </section>
    );
  }
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
                className="hover-lift group relative block min-h-11 w-full overflow-hidden rounded-2xl bg-[#EEF2F7]"
              >
                <CmsImage
                  src={item.imageUrl}
                  alt={item.caption}
                  width={600}
                  height={600}
                  loading={i < 4 ? "eager" : "lazy"}
                  className={`aspect-square w-full transition-transform duration-500 group-hover:scale-[1.03] ${focalObjectClass(item.focal)}`}
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
