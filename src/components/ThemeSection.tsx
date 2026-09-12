import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ThemeSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="theme" className="py-24 bg-cream">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl mx-auto bg-navy relative overflow-hidden rounded-3xl shadow-elevated"
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold/40 rounded-tl-3xl m-4 pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-gold/40 rounded-tr-3xl m-4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-gold/40 rounded-bl-3xl m-4 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold/40 rounded-br-3xl m-4 pointer-events-none" />

          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="text-gold uppercase tracking-[0.3em] text-xs md:text-sm font-semibold mb-6"
            >
              Mission Theme
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-3 italic"
            >
              "Njooni Tusemezane"
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-primary-foreground/70 mb-10"
            >
              Come Now, Let Us Reason Together
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={inView ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="w-16 h-px bg-gold mx-auto mb-10"
            />

            <motion.blockquote
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <p className="font-display text-lg md:text-2xl text-primary-foreground leading-relaxed italic">
                "Come now, and let us reason together," says the Lord, "Though your sins are like scarlet,
                they shall be as white as snow; though they are red like crimson, they shall be as wool."
              </p>
              <cite className="block mt-4 text-gold font-semibold not-italic tracking-wide">
                — Isaiah 1:18 (NKJV)
              </cite>
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="inline-block px-8 py-5 bg-primary-foreground/5 border border-gold/20 rounded-xl"
            >
              <p className="text-xs text-primary-foreground/50 uppercase tracking-[0.2em] mb-1">Key Hymn</p>
              <p className="font-display text-lg font-semibold text-primary-foreground">Hymn 170 (NZK)</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThemeSection;
