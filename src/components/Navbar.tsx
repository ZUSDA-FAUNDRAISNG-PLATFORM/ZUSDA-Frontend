import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useInvolvement } from "./InvolvementDialogs";
import { useScrollNavigation } from "@/hooks/useScrollNavigation";
import { useCms, usePublished } from "@/cms/CmsProvider";
import sdaLogo from "@/assets/sda-logo.jpg";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { open: openDialog } = useInvolvement();
  const { state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { scrolled, activeSection } = useScrollNavigation();
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
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? "border-navy/10 bg-cream/95 shadow-sm" : "border-transparent bg-cream/80"}`}>
      <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center justify-between gap-3 px-4 lg:h-24 lg:px-6">
        <a href="#home" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-white lg:h-16 lg:w-16">
            <img src={sdaLogo} alt="Seventh-day Adventist Church logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-display text-xl font-bold text-navy sm:text-2xl lg:text-3xl">{state.site.churchName}</h1>
            <p className="hidden truncate text-sm font-medium text-navy/70 md:block">{state.site.tagline}</p>
          </div>
        </a>

        <div className="hidden items-center gap-3 overflow-x-auto pr-2 lg:flex xl:gap-5 2xl:gap-6">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={`whitespace-nowrap text-xs font-semibold xl:text-sm ${activeSection === link.id ? "text-gold-dark" : "text-navy hover:text-gold-dark"}`}>
              {link.label}
            </a>
          ))}
          <button
            onClick={() => openDialog("give", { projectId: featured?.projectId, causeName: featured?.title || "the Mission" })}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            Support
          </button>
          <Link to="/login" className="text-sm font-semibold text-navy hover:text-gold-dark">
            Login
          </Link>
        </div>

        <button className="text-navy lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-navy/10 bg-cream lg:hidden">
            <div className="flex max-h-[80vh] flex-col gap-1 overflow-y-auto px-4 py-4">
              {links.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setOpen(false)} className={`rounded-lg px-4 py-3 text-base font-semibold ${activeSection === link.id ? "bg-gold/10 text-gold-dark" : "text-navy"}`}>
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  openDialog("give", { projectId: featured?.projectId, causeName: featured?.title || "the Mission" });
                }}
                className="mt-2 rounded-lg bg-navy px-5 py-3 font-semibold text-white"
              >
                Support
              </button>
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg px-4 py-3 text-base font-semibold text-navy">
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
