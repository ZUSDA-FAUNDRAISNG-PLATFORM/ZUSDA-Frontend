import { Mail, User } from "lucide-react";
import sdaLogo from "@/assets/sda-logo.jpg";

const contacts = [
  {
    icon: User,
    label: "Mission Chairman",
    name: "Gregory Daghe",
    value: "+254 742 618 592",
    href: "tel:+254742618592",
  },
  {
    icon: User,
    label: "Elder in Charge",
    name: "Elder Robert Carlos",
    value: "+254 110 264 570",
    href: "tel:+254110264570",
  },
  {
    icon: Mail,
    label: "Email",
    name: "Get in touch",
    value: "zetechuniversity.sda@gmail.com",
    href: "mailto:zetechuniversity.sda@gmail.com",
  },
];

const Footer = () => (
  <footer className="bg-navy border-t border-gold/10 py-14">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-10 mb-10 max-w-5xl mx-auto">

        {/* Left Side */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-gold shadow-lg bg-white">
              <img
                src={sdaLogo}
                alt="SDA logo"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <p className="font-display text-2xl font-bold text-primary-foreground">
                ZUSDA <span className="text-gold">Mission 2026</span>
              </p>
              <p className="text-primary-foreground/50 text-xs">
                Seventh-day Adventist Church • Zetech University
              </p>
            </div>
          </div>

          <p className="text-primary-foreground/40 text-sm mb-4 italic">
            "Njooni Tusemezane" — Come Now, Let Us Reason Together
          </p>

          <div className="flex gap-5 flex-wrap">
            {["About", "Details", "Get Involved", "Committee"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "")}`}
                className="text-primary-foreground/50 hover:text-gold text-sm transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div>
          <p className="text-gold uppercase tracking-[0.2em] text-xs font-semibold mb-4">
            Contact
          </p>

          <ul className="space-y-4">
            {contacts.map((c) => (
              <li key={c.value}>
                <a href={c.href} className="flex items-start gap-3 group">
                  <c.icon
                    className="text-gold/70 group-hover:text-gold transition-colors mt-0.5"
                    size={16}
                  />

                  <div>
                    <p className="text-primary-foreground/50 text-xs">
                      {c.label}
                    </p>

                    <p className="text-primary-foreground/90 group-hover:text-gold text-sm font-medium transition-colors">
                      {c.name}
                    </p>

                    <p className="text-primary-foreground/70 text-sm">
                      {c.value}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t border-gold/10 pt-6 text-center">
        <p className="text-primary-foreground/30 text-xs">
          © 2026 ZUSDA Evangelical Mission. All rights reserved.
        </p>

        <p className="text-primary-foreground/40 text-xs mt-2">
          Website developed by JKomosh • 0745988691
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;