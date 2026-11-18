import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  /** When set, formats with en-KE grouping (for currency amounts). */
  currency?: boolean;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  className?: string;
  delay?: number;
};

export function StatCard({
  label,
  value,
  currency = false,
  prefix = "",
  suffix = "",
  icon: Icon,
  className,
  delay = 0,
}: StatCardProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    const start = performance.now();
    const duration = 1000;

    const tick = (now: number) => {
      if (cancelled) return;
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [inView, value]);

  const formatted = currency ? display.toLocaleString("en-KE") : display.toLocaleString("en-KE");

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      className={cn(
        "flex h-full flex-col rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(21,22,58,0.12)] sm:p-6",
        className,
      )}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/15 text-navy">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="font-display text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        {prefix}
        {formatted}
        {suffix}
      </p>
      <p className="mt-1.5 text-sm font-medium text-muted-body">{label}</p>
    </motion.article>
  );
}

export default StatCard;
