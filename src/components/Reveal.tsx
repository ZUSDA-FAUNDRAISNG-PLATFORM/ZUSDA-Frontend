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
  const { ref, visible } = useReveal<HTMLDivElement>(threshold);
  return (
    <div ref={ref} className={className}>
      <div
        data-dir={direction}
        style={{ transitionDelay: visible ? `${Math.min(delay, 300)}ms` : "0ms" }}
        className={`reveal h-full ${visible ? "is-visible" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
