import { Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
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
    <footer className="border-t border-gold/10 bg-navy py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-gold bg-white">
                <img src={sdaLogo} alt="SDA logo" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-primary-foreground">
                  {state.site.churchName} <span className="text-gold">Mission 2026</span>
                </p>
                <p className="text-xs text-primary-foreground/50">{state.site.tagline}</p>
              </div>
            </div>
            <p className="mb-4 text-sm italic text-primary-foreground/40">{state.site.footerBlurb}</p>
          </div>
          <div>
            <p className="mb-4 text-xs font-medium text-gold">Contact</p>
            <ul className="space-y-4">
              {contacts.map((item) => (
                <li key={item.value}>
                  <a href={item.href} className="group flex items-start gap-3">
                    {item.label === "Email" ? <Mail className="mt-0.5 text-gold/70" size={16} /> : <User className="mt-0.5 text-gold/70" size={16} />}
                    <div>
                      <p className="text-xs text-primary-foreground/50">{item.label}</p>
                      <p className="text-sm font-medium text-primary-foreground/90 group-hover:text-gold">{item.name}</p>
                      <p className="text-sm text-primary-foreground/70">{item.value}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-6 text-center">
          <p className="text-xs text-primary-foreground/30">© 2026 ZUSDA Evangelical Mission. All rights reserved.</p>
          <div className="mt-3">
            <Link to="/login" className="text-xs text-primary-foreground/40 hover:text-gold">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
