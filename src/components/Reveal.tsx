import { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "zoom";
  delay?: number;
  className?: string;
  threshold?: number;
};

export default function Reveal({ children, direction = "up", delay = 0, className = "", threshold = 0.05 }: Props) {
  const { ref, visible } = useReveal(threshold);
  return (
    <div
      ref={ref}
      data-dir={direction}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
