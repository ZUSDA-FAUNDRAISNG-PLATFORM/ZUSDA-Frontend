import { useEffect, useState } from "react";
import { toast } from "sonner";

type Piece = { id: number; left: number; delay: number; dur: number; color: string; size: number; rot: number };
const COLORS = ["#d4a017", "#f5d06f", "#0f172a", "#ffffff", "#38bdf8"];

export default function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const onGift = (event: Event) => {
      const amount = Number((event as CustomEvent<{ amount?: number }>).detail?.amount);
      if (!(amount > 0)) return;
      toast.success(`Thank you! Your gift of KSH ${amount.toLocaleString("en-KE")} was received 🙏`);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const now = Date.now();
      setPieces(
        Array.from({ length: 60 }, (_, i) => ({
          id: now + i,
          left: Math.random() * 100,
          delay: Math.random() * 0.4,
          dur: 2.2 + Math.random() * 1.6,
          color: COLORS[i % COLORS.length],
          size: 6 + Math.random() * 8,
          rot: Math.random() * 360,
        })),
      );
      window.setTimeout(() => setPieces([]), 4500);
    };
    window.addEventListener("zusda:contribution", onGift);
    return () => window.removeEventListener("zusda:contribution", onGift);
  }, []);

  if (!pieces.length) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
