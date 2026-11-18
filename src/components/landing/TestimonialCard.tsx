import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type TestimonialCardProps = {
  name: string;
  quote: string;
  role?: string;
  rating?: number;
  initials?: string;
  className?: string;
  delay?: number;
  /** When used inside the auto-carousel, skip entrance motion. */
  staticCard?: boolean;
};

export function TestimonialCard({
  name,
  quote,
  role = "Verified contributor",
  rating = 5,
  initials,
  className,
  delay = 0,
  staticCard = false,
}: TestimonialCardProps) {
  const letters =
    initials ||
    name
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const content = (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/[0.06] font-display text-sm font-bold text-heading"
          aria-hidden
        >
          {letters}
        </div>
        <div>
          <p className="font-semibold text-heading">{name}</p>
          <p className="text-xs text-muted-body">{role}</p>
        </div>
      </div>
      <div className="mb-3 flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn("h-4 w-4", index < rating ? "fill-gold text-gold" : "text-[#1C1D4D]/20")}
            aria-hidden
          />
        ))}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-body">“{quote}”</p>
    </>
  );

  if (staticCard) {
    return (
      <article
        className={cn(
          "flex h-full min-w-[min(100%,20rem)] flex-col rounded-card border border-[#1C1D4D]/8 bg-white p-6 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:min-w-[22rem]",
          className,
        )}
      >
        {content}
      </article>
    );
  }

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
      {content}
    </motion.article>
  );
}

export default TestimonialCard;
