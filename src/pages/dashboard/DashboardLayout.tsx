import { NavLink, Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/cms/AuthProvider";

const links = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/posters", label: "Posters" },
  { to: "/dashboard/slider", label: "Hero slideshow" },
  { to: "/dashboard/scripture-cards", label: "Scripture cards" },
  { to: "/dashboard/values", label: "Mission & values" },
  { to: "/dashboard/committee", label: "Committee" },
  { to: "/dashboard/announcements", label: "Announcements" },
  { to: "/dashboard/events", label: "Events" },
  { to: "/dashboard/gallery", label: "Gallery" },
  { to: "/dashboard/ministries", label: "Ministries" },
  { to: "/dashboard/budget", label: "Budget" },
  { to: "/dashboard/settings", label: "Site settings" },
  { to: "/dashboard/users", label: "Users" },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      {open ? <button type="button" className="fixed inset-0 z-40 bg-navy/50 lg:hidden" aria-label="Close dashboard menu" onClick={() => setOpen(false)} /> : null}
      <aside id="dashboard-navigation" className={`fixed inset-y-0 left-0 z-50 w-[min(20rem,85vw)] overflow-y-auto bg-navy text-white transition-transform lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:border-r lg:border-white/10 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <p className="font-display text-xl font-bold">ZUSDA CMS</p>
          <button type="button" className="flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-11 items-center rounded-md px-3 py-2 text-sm ${isActive ? "bg-white/10 text-gold" : "text-white/80 hover:bg-white/5"}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 py-3">
          <button type="button" className="flex h-11 w-11 items-center justify-center lg:hidden" onClick={() => setOpen(true)} aria-label="Open dashboard menu" aria-expanded={open} aria-controls="dashboard-navigation">
            <Menu size={22} />
          </button>
          <p className="min-w-0 flex-1 truncate text-sm text-navy/70">{user?.name} · Administrator</p>
          <div className="flex items-center gap-3">
            <Link to="/" className="flex min-h-11 items-center text-sm font-medium text-navy hover:text-gold-dark">
              View site
            </Link>
            <button type="button" onClick={logout} className="min-h-11 text-sm text-navy/60 hover:text-navy">
              Sign out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
