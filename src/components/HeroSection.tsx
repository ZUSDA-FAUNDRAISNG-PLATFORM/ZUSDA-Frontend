import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/worship-sunrise.jpg";
import CountdownTimer from "./CountdownTimer";
import Hero3D from "./Hero3D";
import { useInvolvement } from "./InvolvementDialogs";

const HeroSection = () => {
  const { open } = useInvolvement();
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-navy/80" />
      <Hero3D />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/60" />

      <div className="relative z-10 container mx-auto px-4 text-center py-32">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gold font-body text-sm md:text-base uppercase tracking-[0.3em] mb-6"
        >
          ZUSDA Evangelical Mission
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-4"
        >
          Njooni Tusemezane
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-display italic text-xl md:text-2xl text-gold-light mb-3"
        >
          "Come Now, Let Us Reason Together"
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-primary-foreground/60 text-sm md:text-base mb-10"
        >
          Isaiah 1:18 (NKJV) &nbsp;·&nbsp; 13–27 December 2026 &nbsp;·&nbsp; Kinungi, Naivasha
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <CountdownTimer targetDate="2026-12-13T00:00:00" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => open("give")}
              className="bg-gradient-gold text-secondary-foreground font-semibold px-8 py-3.5 rounded-full text-base hover:opacity-90 transition-opacity shadow-lg shadow-gold/20 animate-pulse-gold"
            >
              Support the Mission
            </button>
            <a
              href="#involved"
              className="rounded-full border border-gold/40 bg-white/10 px-8 py-3.5 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/10"
            >
              Get Involved
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-primary-foreground/80">
            <span className="rounded-full border border-gold/30 bg-white/10 px-3 py-1">13–27 Dec 2026</span>
            <span className="rounded-full border border-gold/30 bg-white/10 px-3 py-1">Kinungi, Naivasha</span>
            <span className="rounded-full border border-gold/30 bg-white/10 px-3 py-1">Prayer • Giving • Go</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold/60"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
