import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInvolvement } from "./InvolvementDialogs";
import { useScrollNavigation } from "@/hooks/useScrollNavigation";
import sdaLogo from "@/assets/sda-logo.jpg";

const links = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Details", href: "#details", id: "details" },
  { label: "Theme", href: "#theme", id: "theme" },
  { label: "Get Involved", href: "#involved", id: "involved" },
  { label: "Committee", href: "#committee", id: "committee" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { open: openDialog } = useInvolvement();
  const { scrolled, activeSection } = useScrollNavigation();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gold/20 transition-all duration-300 ${
        scrolled ? "bg-navy/95 shadow-lg" : "bg-navy/40 shadow-none"
      }`}
    >
      <div className="w-full px-2 flex items-center justify-between h-28">
        {/* Logo Section */}
        <a
          href="#home"
          className="flex items-center gap-3 flex-shrink-0 pl-0"
        >
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gold shadow-lg bg-white flex-shrink-0">
            <motion.img
              src={sdaLogo}
              alt="Seventh-day Adventist Church logo"
              className="w-full h-full object-cover"
              whileHover={{ rotate: 8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>

          <div className="leading-tight">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">
              ZUSDA
            </h1>

            <p className="text-gold text-base md:text-lg font-semibold">
              Mission 2026
            </p>

            <p className="text-xs md:text-sm text-primary-foreground/70">
              Seventh-day Adventist Church • Zetech University
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 pr-4">
          {links.map((link) => (
            <motion.a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors relative group ${
                activeSection === link.id
                  ? "text-gold"
                  : "text-primary-foreground/70 hover:text-gold"
              }`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {link.label}

              {activeSection === link.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold-light"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}

              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gold/30 transition-all duration-300 ${
                  activeSection === link.id
                    ? "opacity-0"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />
            </motion.a>
          ))}

          <button
            onClick={() => openDialog("give")}
            className="bg-gradient-gold text-secondary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
          >
            Support the Mission
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-primary-foreground pr-4"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="md:hidden bg-navy/98 backdrop-blur-sm overflow-hidden border-t border-gold/10"
          >
            <div className="px-6 py-5 flex flex-col gap-2">
              {links.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`py-3 px-4 rounded-lg transition-colors relative group ${
                    activeSection === link.id
                      ? "text-gold bg-gold/10"
                      : "text-primary-foreground/80 hover:text-gold hover:bg-gold/5"
                  }`}
                >
                  {link.label}

                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeMobileIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-gold-light rounded-r"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.a>
              ))}

              <motion.button
                onClick={() => {
                  setOpen(false);
                  openDialog("give");
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.05 }}
                className="bg-gradient-gold text-secondary-foreground font-semibold px-5 py-3 rounded-full text-center mt-2 hover:opacity-90 transition-opacity"
              >
                Support the Mission
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;