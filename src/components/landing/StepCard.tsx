import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StepCardProps = {
  step: number;
  title: string;
  description: string;
  className?: string;
  delay?: number;
};

export function StepCard({ step, title, description, className, delay = 0 }: StepCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.015 }}
      className={cn(
        "relative flex h-full flex-col rounded-card border border-[#1C1D4D]/8 bg-white p-6 shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(21,22,58,0.12)]",
        className,
      )}
    >
      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-gold">
        {step}
      </span>
      <h3 className="font-display text-lg font-bold text-heading">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{description}</p>
    </motion.article>
  );
}

export default StepCard;
