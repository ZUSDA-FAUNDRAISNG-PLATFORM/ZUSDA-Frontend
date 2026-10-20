import { useCallback, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Item = { imageUrl: string; caption?: string };
type Props = { items: Item[]; index: number | null; onClose: () => void; onChange: (i: number) => void };

export default function Lightbox({ items, index, onClose, onChange }: Props) {
  const touchX = useRef<number | null>(null);
  const open = index !== null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      onChange((index + d + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go, onClose]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25">
        <X size={22} />
      </button>
      <button
        type="button"
        aria-label="Previous photo"
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
      >
        <ChevronLeft size={26} />
      </button>
      <img
        src={item.imageUrl}
        alt={item.caption || "Gallery photo"}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
      <button
        type="button"
        aria-label="Next photo"
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
      >
        <ChevronRight size={26} />
      </button>
      <p className="mt-4 max-w-xl text-center text-sm text-white/80" onClick={(e) => e.stopPropagation()}>
        {item.caption ? `${item.caption} · ` : ""}
        {index + 1} / {items.length}
      </p>
    </div>
  );
}
