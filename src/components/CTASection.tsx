import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import helpingHands from "@/assets/helping-hands.jpg";

const CTASection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${helpingHands})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy/90 via-navy/80 to-navy" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            God is Calling.<br />
            The Mission is Ready.<br />
            <span className="text-gradient-gold">You Are Invited.</span>
          </h2>
          <p className="text-primary-foreground/60 text-lg mb-10 max-w-xl mx-auto">
            Be part of something eternal. Whether through prayer, giving, or going —
            your response matters. Join us in Kinungi this December.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
