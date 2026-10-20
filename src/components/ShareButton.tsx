import { Share2 } from "lucide-react";

type Props = { title: string; text?: string; className?: string; label?: string };

export default function ShareButton({ title, text, className = "", label = "Share on WhatsApp" }: Props) {
  const share = async () => {
    const url = window.location.origin;
    const message = text ?? title;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title, text: message, url });
      } catch {
        /* cancelled */
      }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message}\n${url}`)}`, "_blank", "noopener");
  };

  return (
    <button
      type="button"
      onClick={share}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${className}`}
    >
      <Share2 size={14} />
      {label}
    </button>
  );
}
