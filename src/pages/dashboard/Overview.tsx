import { Link } from "react-router-dom";
import { useCms } from "@/cms/CmsProvider";

const Overview = () => {
  const { state } = useCms();
  const cards = [
    { label: "Posters", count: state.posters.length, to: "/dashboard/posters" },
    { label: "Slider slides", count: state.slides.length, to: "/dashboard/slider" },
    { label: "Committee", count: state.committee.length, to: "/dashboard/committee" },
    { label: "Announcements", count: state.announcements.length, to: "/dashboard/announcements" },
    { label: "Events", count: state.events.length, to: "/dashboard/events" },
    { label: "Gallery", count: state.gallery.length, to: "/dashboard/gallery" },
    { label: "Ministries", count: state.ministries.length, to: "/dashboard/ministries" },
    { label: "Budget goal", count: state.site.budgetGoal, to: "/dashboard/budget" },
    { label: "Users", count: state.users.length, to: "/dashboard/users" },
  ];

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold text-navy">Dashboard</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Manage every public section from here. Published items appear on the homepage immediately. Members cannot access this dashboard.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="rounded-xl border border-navy/10 bg-white p-5 hover:border-gold/40">
            <p className="text-sm text-navy/60">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-navy">{card.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Overview;
