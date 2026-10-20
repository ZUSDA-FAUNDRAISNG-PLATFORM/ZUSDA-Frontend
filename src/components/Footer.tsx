import { Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import sdaLogo from "@/assets/sda-logo.jpg";
import { useCms } from "@/cms/CmsProvider";

const Footer = () => {
  const { state } = useCms();
  const contacts = [
    { label: "Mission Chairman", name: state.site.chairmanName, value: state.site.chairmanPhone, href: `tel:${state.site.chairmanPhone.replace(/\s/g, "")}` },
    { label: "Elder in Charge", name: state.site.elderName, value: state.site.elderPhone, href: `tel:${state.site.elderPhone.replace(/\s/g, "")}` },
    { label: "Email", name: "Get in touch", value: state.site.contactEmail, href: `mailto:${state.site.contactEmail}` },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-gold/10 bg-navy py-14">
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-10 grid max-w-5xl gap-6 md:grid-cols-2">
          <Reveal direction="left" className="h-full">
            <div className="glass-dark h-full rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gold bg-white">
                  <img src={sdaLogo} alt="SDA logo" loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-primary-foreground">
                    {state.site.churchName} <span className="text-gold">Mission 2026</span>
                  </p>
                  <p className="text-xs text-primary-foreground/50">{state.site.tagline}</p>
                </div>
              </div>
              <p className="text-sm italic text-primary-foreground/50">{state.site.footerBlurb}</p>
            </div>
          </Reveal>
          <Reveal direction="right" delay={120} className="h-full">
            <div className="glass-dark h-full rounded-2xl p-6">
              <p className="mb-4 text-xs font-medium tracking-wide text-gold">Contact</p>
              <ul className="space-y-4">
                {contacts.map((item) => (
                  <li key={item.value}>
                    <a href={item.href} className="group flex items-start gap-3 transition-transform duration-300 hover:translate-x-1">
                      {item.label === "Email" ? <Mail className="mt-0.5 text-gold/70" size={16} /> : <User className="mt-0.5 text-gold/70" size={16} />}
                      <div>
                        <p className="text-xs text-primary-foreground/50">{item.label}</p>
                        <p className="text-sm font-medium text-primary-foreground/90 transition-colors group-hover:text-gold">{item.name}</p>
                        <p className="text-sm text-primary-foreground/70">{item.value}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
        <div className="border-t border-gold/10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/40">© 2026 ZUSDA Evangelical Mission. All rights reserved.</p>
          <div className="mt-3">
            <Link to="/login" className="text-xs text-primary-foreground/50 transition-colors hover:text-gold">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
