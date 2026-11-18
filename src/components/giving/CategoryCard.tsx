import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GivingCategory } from "@/lib/giving/types";

type CategoryCardProps = {
  category: GivingCategory;
  selected: boolean;
  onToggle: () => void;
};

export function CategoryCard({ category, selected, onToggle }: CategoryCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      whileTap={{ scale: 0.98 }}
      animate={selected ? { scale: 1.015 } : { scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "relative flex min-h-[7.5rem] w-full flex-col rounded-card border bg-white p-5 text-left shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        selected
          ? "border-brand ring-2 ring-brand/20 shadow-[0_14px_36px_rgba(21,22,58,0.12)]"
          : "border-[#1C1D4D]/8 hover:border-brand/30",
      )}
    >
      <span
        className={cn(
          "absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border transition",
          selected ? "border-brand bg-brand text-white" : "border-[#1C1D4D]/20 bg-white text-transparent",
        )}
        aria-hidden
      >
        <Check className="h-4 w-4" />
      </span>
      <p className="pr-10 font-display text-lg font-bold text-heading">{category.label}</p>
      {category.description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{category.description}</p>
      ) : null}
      {selected ? (
        <span className="mt-auto pt-4 text-xs font-semibold text-gold-dark">Selected</span>
      ) : (
        <span className="mt-auto pt-4 text-xs font-medium text-muted-body">Tap to select</span>
      )}
    </motion.button>
  );
}

export default CategoryCard;
