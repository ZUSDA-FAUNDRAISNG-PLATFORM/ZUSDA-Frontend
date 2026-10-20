import { ReactNode } from "react";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

export default function HideOnScrollHeader({ children }: { children: ReactNode }) {
  const { hidden, scrolled } = useHideOnScroll();
  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${scrolled ? "glass-dark" : "bg-transparent"}`}
    >
      {children}
    </header>
  );
}
