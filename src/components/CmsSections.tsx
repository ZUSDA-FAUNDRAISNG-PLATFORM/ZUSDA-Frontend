import { usePublished } from "@/cms/CmsProvider";

export const AnnouncementsSection = () => {
  const items = usePublished("announcements");
  if (!items.length) return null;
  return (
    <section id="announcements" className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-display text-3xl font-bold text-navy">Announcements</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-navy/10 p-6">
              <p className="mb-2 text-xs text-gold-dark">{item.date}</p>
              <h3 className="mb-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
              <p className="text-muted-foreground">{item.body}</p>
            </article>
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
    <section id="events" className="bg-cream py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-display text-3xl font-bold text-navy">Events</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-xl border border-navy/10 bg-white">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" /> : null}
              <div className="p-6">
                <h3 className="mb-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="mb-2 text-sm text-navy/60">{item.location} · {item.startDate}{item.endDate ? ` – ${item.endDate}` : ""}</p>
                <p className="text-muted-foreground">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const GallerySection = () => {
  const items = usePublished("gallery");
  if (!items.length) return null;
  return (
    <section id="gallery" className="bg-white py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 font-display text-3xl font-bold text-navy">Gallery</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-xl bg-cream">
              <img src={item.imageUrl} alt={item.caption} className="aspect-square w-full object-cover" />
              {item.caption ? <figcaption className="p-2 text-xs text-navy/70">{item.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
