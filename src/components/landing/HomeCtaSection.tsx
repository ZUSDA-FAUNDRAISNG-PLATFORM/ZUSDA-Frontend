import { motion } from "framer-motion";
import { useInvolvement } from "@/components/InvolvementDialogs";

export function HomeCtaSection() {
  const { open } = useInvolvement();

  return (
    <section className="relative bg-brand py-16 sm:py-20">
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Together We Can Make A Difference
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            Join hands in faith, generosity, and prayer as we support the ZUSDA Evangelical Mission.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => open("give", { mode: "general" })} className="btn-gold w-full sm:w-auto">
              Support Now
            </button>
            <button
              type="button"
              onClick={() => open("pray")}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-button border border-white/35 bg-white/10 px-8 py-3 text-base font-semibold text-white transition hover:bg-white/15 sm:w-auto"
            >
              Share Prayer Request
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HomeCtaSection;
