import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useInvolvement } from "@/components/InvolvementDialogs";
import sdaLogo from "@/assets/sda-logo.jpg";
import { useCms } from "@/cms/CmsProvider";

const Footer = () => {
  const { state } = useCms();
  const { open } = useInvolvement();

  const quickLinks = [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Events", href: "/#events" },
    { label: "Support", href: "/#campaigns" },
  ];

  return (
    <footer className="relative overflow-hidden bg-footer text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden />

      <div className="container mx-auto px-4 py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-gold/80 bg-white">
                <img
                  src={sdaLogo}
                  alt="ZUSDA logo"
                  loading="lazy"
                  decoding="async"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-white">
                  {state.site.churchName}
                </p>
                <p className="text-xs text-white/65">{state.site.tagline}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              {state.site.footerBlurb ||
                "Supporting God’s work through faith, transparent giving, and mission service."}
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Quick Links</p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Get Involved */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Get Involved</p>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => open("give", { mode: "general" })}
                  className="inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-gold"
                >
                  Give
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => open("pray")}
                  className="inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-gold"
                >
                  Offer Prayer
                </button>
              </li>
              <li>
                <a
                  href={`mailto:${state.site.contactEmail}`}
                  className="inline-flex min-h-11 items-center text-sm text-white/80 transition hover:text-gold"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Contact</p>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${state.site.chairmanPhone.replace(/\s/g, "")}`}
                  className="group flex min-h-11 items-start gap-3 text-sm text-white/80 transition hover:text-gold"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span>
                    <span className="block text-xs text-white/50">{state.site.chairmanName}</span>
                    {state.site.chairmanPhone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${state.site.contactEmail}`}
                  className="group flex min-h-11 items-start gap-3 text-sm text-white/80 transition hover:text-gold"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span>{state.site.contactEmail}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                <span>Kinamba, Naivasha · Zetech University SDA Church</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs text-white/55">© {new Date().getFullYear()} ZUSDA Fundraiser Platform</p>
            <p className="mt-1 text-xs text-white/45">Designed for SDA Zetech University Church</p>
          </div>
          <Link to="/login" className="inline-flex min-h-11 items-center text-xs font-medium text-white/55 transition hover:text-gold">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
