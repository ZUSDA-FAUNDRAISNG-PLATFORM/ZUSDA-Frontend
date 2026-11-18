import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  delay?: number;
};

export function FeatureCard({ title, description, icon: Icon, className, delay = 0 }: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.015 }}
      className={cn(
        "flex h-full flex-col rounded-card border border-[#1C1D4D]/8 bg-white p-6 shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(21,22,58,0.12)]",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-navy">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="font-display text-xl font-bold text-heading">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-body">{description}</p>
    </motion.article>
  );
}

export default FeatureCard;
