import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useInvolvement } from "./InvolvementDialogs";
import { useScrollNavigation } from "@/hooks/useScrollNavigation";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useCms, usePublished } from "@/cms/CmsProvider";
import sdaLogo from "@/assets/sda-logo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { open: openDialog } = useInvolvement();
  const { state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { activeSection } = useScrollNavigation();
  const { hidden, scrolled } = useHideOnScroll();
  const events = usePublished("events");
  const gallery = usePublished("gallery");
  const announcements = usePublished("announcements");

  const links = [
    { label: "Home", href: "#home", id: "home" },
    { label: "About", href: "#about", id: "about" },
    { label: "Mission", href: "#theme", id: "theme" },
    ...(announcements.length ? [{ label: "Notices", href: "#announcements", id: "announcements" }] : []),
    ...(events.length ? [{ label: "Events", href: "#events", id: "events" }] : []),
    { label: "Get Involved", href: "#involved", id: "involved" },
    { label: "Committee", href: "#committee", id: "committee" },
    ...(gallery.length ? [{ label: "Gallery", href: "#gallery", id: "gallery" }] : []),
  ];

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

  const isHidden = hidden && !open;

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-out ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "border-white/40 bg-cream/60 shadow-[0_8px_32px_rgba(15,23,42,0.12)]"
          : "border-white/20 bg-cream/30"
      }`}
    >
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-3 px-4 lg:h-24 lg:px-6">
        <a href="#home" className="group flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-white transition-transform duration-300 group-hover:scale-105 lg:h-16 lg:w-16">
            <img src={sdaLogo} alt="Seventh-day Adventist Church logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-display text-xl font-bold text-navy sm:text-2xl lg:text-3xl">{state.site.churchName}</h1>
            <p className="hidden truncate font-sans text-sm font-medium text-navy/70 md:block">{state.site.tagline}</p>
          </div>
        </a>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-1.5 pl-2 lg:flex xl:gap-4 2xl:gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`group relative whitespace-nowrap text-[10px] font-semibold transition-colors duration-300 xl:text-sm ${
                activeSection === link.id ? "text-gold-dark" : "text-navy hover:text-gold-dark"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-gold transition-all duration-300 ${
                  activeSection === link.id ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </a>
          ))}
          <button
            onClick={() => openDialog("give", { projectId: featured?.projectId, causeName: featured?.title || "the Mission" })}
            className="min-h-11 rounded-lg bg-navy px-2 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-navy-light hover:shadow-lg xl:px-4 xl:text-sm"
          >
            Support
          </button>
          <Link to="/login" className="flex min-h-11 items-center text-sm font-semibold text-navy transition-colors hover:text-gold-dark">
            Login
          </Link>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-navy lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="public-mobile-menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            id="public-mobile-menu"
            className="absolute inset-x-0 top-full w-full overflow-hidden border-t border-white/30 bg-cream/95 shadow-lg backdrop-blur-xl lg:hidden"
          >
            <div className="flex max-h-[calc(100vh-5rem)] supports-[height:100svh]:max-h-[calc(100svh-5rem)] flex-col gap-1 overflow-y-auto px-4 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center rounded-lg px-4 py-3 text-base font-semibold transition-colors ${
                    activeSection === link.id ? "bg-gold/10 text-gold-dark" : "text-navy hover:bg-white/40"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  openDialog("give", { projectId: featured?.projectId, causeName: featured?.title || "the Mission" });
                }}
                className="mt-2 min-h-11 rounded-lg bg-navy px-5 py-3 font-semibold text-white"
              >
                Support
              </button>
              <a href="#involved" onClick={() => setOpen(false)} className="mt-2 flex min-h-11 items-center justify-center rounded-lg border border-navy/20 px-4 py-3 text-base font-semibold text-navy">
                Join
              </a>
              <Link to="/login" onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-lg px-4 py-3 text-base font-semibold text-navy">
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
