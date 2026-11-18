import { Link } from "react-router-dom";
import { useCms } from "@/cms/CmsProvider";

const HomepageHubPage = () => {
  const { state } = useCms();
  const activeHighlights = state.slides.filter(
    (slide) => slide.placement === "hero" && slide.published && slide.imageUrl.trim(),
  ).length;
  const mode =
    activeHighlights === 0 ? "Empty State" : activeHighlights === 1 ? "Static Image" : "Automatic Slideshow";

  const cards = [
    {
      to: "/dashboard/homepage/hero",
      title: "Hero Content",
      body: "Edit the static left-side label, headings, description, and buttons.",
    },
    {
      to: "/dashboard/homepage/highlights",
      title: "Homepage Highlights",
      body: `Manage the Hero Image Card. Active: ${activeHighlights} · Mode: ${mode}`,
    },
    {
      to: "/dashboard/homepage/welcome",
      title: "Welcome Section",
      body: "Coming soon — homepage welcome messaging.",
      disabled: true,
    },
    {
      to: "/dashboard/homepage/ministries",
      title: "Featured Ministries",
      body: "Coming soon — featured ministry cards on the homepage.",
      disabled: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold text-navy">Homepage</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Central place to manage everything visible on the public homepage. The hero layout stays the same — you only
        update content and highlights.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((card) =>
          card.disabled ? (
            <div key={card.title} className="rounded-xl border border-dashed border-navy/15 bg-white/70 p-5 opacity-70">
              <p className="font-display text-xl font-bold text-navy">{card.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ) : (
            <Link
              key={card.title}
              to={card.to}
              className="rounded-xl border border-navy/10 bg-white p-5 transition hover:border-gold/40"
            >
              <p className="font-display text-xl font-bold text-navy">{card.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </Link>
          ),
        )}
      </div>
    </div>
  );
};

export default HomepageHubPage;
