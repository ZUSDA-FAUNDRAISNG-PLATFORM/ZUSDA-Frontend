import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useInvolvement } from "./InvolvementDialogs";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { useCms } from "@/cms/CmsProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import sdaLogo from "@/assets/sda-logo.jpg";

const sectionHref = (hash: string, pathname: string) => (pathname === "/" ? hash : `/${hash}`);

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const [involvedOpen, setInvolvedOpen] = useState(false);
  const { open: openDialog } = useInvolvement();
  const { state } = useCms();
  const { hidden, scrolled } = useHideOnScroll();
  const { pathname } = useLocation();

  const closeDrawer = () => {
    setDrawerOpen(false);
    setAboutOpen(false);
    setMissionOpen(false);
    setInvolvedOpen(false);
  };

  const openSupport = () => {
    closeDrawer();
    openDialog("give", { mode: "general" });
  };

  const openPrayer = () => {
    closeDrawer();
    openDialog("pray");
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  const isHidden = hidden && !drawerOpen;

  const triggerClass =
    "inline-flex min-h-11 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-navy outline-none transition-colors hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-gold data-[state=open]:bg-white/60";

  const itemClass =
    "cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-navy outline-none focus:bg-gold/10 focus:text-navy data-[highlighted]:bg-gold/10";

  return (
    <nav
      className={cn(
        "fixed top-3 inset-x-3 z-50 rounded-2xl border border-[#1C1D4D]/8 bg-white/90 shadow-[0_8px_32px_rgba(21,22,58,0.12)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ease-out md:inset-x-auto md:left-1/2 md:w-[min(96%,1200px)] md:-translate-x-1/2",
        isHidden ? "-translate-y-[calc(100%+1.5rem)] md:-translate-x-1/2" : "translate-y-0",
        scrolled && "bg-white/95 shadow-[0_10px_36px_rgba(21,22,58,0.14)]",
      )}
      aria-label="Primary"
    >
      <div className="mx-auto flex min-h-[64px] w-full items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4 lg:px-6">
        {/* Brand */}
        <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-3" onClick={closeDrawer}>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
            <img src={sdaLogo} alt="Seventh-day Adventist Church logo" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-lg font-bold text-heading sm:text-xl">{state.site.churchName}</p>
            <p className="hidden max-w-[220px] text-xs font-medium leading-tight text-muted-body sm:block xl:max-w-[260px]">
              {state.site.tagline}
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="ml-auto hidden items-center gap-1 lg:flex xl:gap-2">
          <a href={sectionHref("#home", pathname)} className={triggerClass}>
            Home
          </a>

          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass} aria-label="About menu">
              About
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[14rem] rounded-2xl border-white/50 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
            >
              <DropdownMenuItem asChild className={itemClass}>
                <a href={sectionHref("#about", pathname)}>About ZUSDA Fundraiser</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className={itemClass}>
                <Link to="/contact">Contact Us</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className={triggerClass} aria-label="Mission menu">
              Mission
              <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[14rem] rounded-2xl border-white/50 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
            >
              <DropdownMenuItem asChild className={itemClass}>
                <a href={sectionHref("#events", pathname)}>Events</a>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className={cn(itemClass, "data-[state=open]:bg-gold/10")}>
                  Get Involved
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="min-w-[12rem] rounded-2xl border-white/50 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
                  <DropdownMenuItem className={itemClass} onSelect={(event) => { event.preventDefault(); openSupport(); }}>
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuItem className={itemClass} onSelect={(event) => { event.preventDefault(); openPrayer(); }}>
                    Offer Prayer
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/login"
            className="btn-gold ml-1 rounded-full px-4 py-2 text-sm"
          >
            Login
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
          onClick={() => setDrawerOpen((value) => !value)}
          aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={drawerOpen}
          aria-controls="public-mobile-menu"
        >
          {drawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            id="public-mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/40 lg:hidden"
          >
            <div className="max-h-[min(70vh,32rem)] overflow-y-auto overflow-x-hidden px-3 py-3">
              <a
                href={sectionHref("#home", pathname)}
                onClick={closeDrawer}
                className="flex min-h-11 items-center rounded-xl px-4 py-3 text-base font-semibold text-navy hover:bg-white/60"
              >
                Home
              </a>

              <div className="mt-1">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy hover:bg-white/60"
                  aria-expanded={aboutOpen}
                  onClick={() => setAboutOpen((value) => !value)}
                >
                  About
                  <ChevronDown className={cn("h-5 w-5 transition-transform", aboutOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {aboutOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3"
                    >
                      <a
                        href={sectionHref("#about", pathname)}
                        onClick={closeDrawer}
                        className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60"
                      >
                        About ZUSDA Fundraiser
                      </a>
                      <Link
                        to="/contact"
                        onClick={closeDrawer}
                        className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60"
                      >
                        Contact Us
                      </Link>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="mt-1">
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-navy hover:bg-white/60"
                  aria-expanded={missionOpen}
                  onClick={() => setMissionOpen((value) => !value)}
                >
                  Mission
                  <ChevronDown className={cn("h-5 w-5 transition-transform", missionOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {missionOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-3"
                    >
                      <a
                        href={sectionHref("#events", pathname)}
                        onClick={closeDrawer}
                        className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60"
                      >
                        Events
                      </a>

                      <button
                        type="button"
                        className="flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-navy hover:bg-white/60"
                        aria-expanded={involvedOpen}
                        onClick={() => setInvolvedOpen((value) => !value)}
                      >
                        Get Involved
                        <ChevronRight className={cn("h-4 w-4 transition-transform", involvedOpen && "rotate-90")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {involvedOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-3"
                          >
                            <button
                              type="button"
                              onClick={openSupport}
                              className="flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60"
                            >
                              Support
                            </button>
                            <button
                              type="button"
                              onClick={openPrayer}
                              className="flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60"
                            >
                              Offer Prayer
                            </button>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <Link
                to="/login"
                onClick={closeDrawer}
                className="btn-gold mt-3 w-full"
              >
                Login
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
