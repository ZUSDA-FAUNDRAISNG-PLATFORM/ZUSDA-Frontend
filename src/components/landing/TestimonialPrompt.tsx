import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type TestimonialPromptProps = {
  /** Presentational only until payment-success wiring. */
  contributorName?: string;
  onSubmit?: (payload: { rating: number; quote: string; anonymous: boolean }) => void;
  onSkip?: () => void;
  className?: string;
};

/**
 * Post-contribution UI: rate experience + optional testimony + anonymous option.
 * Backend submit is intentionally not implemented yet.
 */
export function TestimonialPrompt({
  contributorName = "Friend",
  onSubmit,
  onSkip,
  className,
}: TestimonialPromptProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [quote, setQuote] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div
      className={cn(
        "rounded-card border border-[#1C1D4D]/8 bg-white p-6 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-8",
        className,
      )}
    >
      <h3 className="font-display text-xl font-bold text-heading">Would you like to share your experience?</h3>
      <p className="mt-2 text-sm text-body">
        Thank you, {contributorName}. Only verified contributors can share a public testimonial after a successful gift.
      </p>

      <div className="mt-5 flex gap-1" role="radiogroup" aria-label="Rating">
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          const active = value <= (hover || rating);
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} star${value === 1 ? "" : "s"}`}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl transition hover:bg-[#EEF2F7]"
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
            >
              <Star className={cn("h-6 w-6", active ? "fill-gold text-gold" : "text-[#1C1D4D]/25")} aria-hidden />
            </button>
          );
        })}
      </div>

      <label className="mt-5 block text-sm font-medium text-heading" htmlFor="testimonial-quote">
        Comment
      </label>
      <textarea
        id="testimonial-quote"
        value={quote}
        onChange={(event) => setQuote(event.target.value)}
        rows={4}
        maxLength={400}
        placeholder="Share how this mission touched you…"
        className="mt-2 w-full rounded-2xl border border-[#1C1D4D]/15 bg-[#F7F8FC] px-4 py-3 text-sm text-body outline-none transition focus:border-[#1C1D4D] focus:ring-2 focus:ring-gold/40"
      />

      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-heading">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(event) => setAnonymous(event.target.checked)}
          className="h-5 w-5 rounded border-[#1C1D4D]/30 text-brand focus:ring-gold"
        />
        Share anonymously
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={rating < 1}
          onClick={() => onSubmit?.({ rating, quote: quote.trim(), anonymous })}
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
        {onSkip ? (
          <button type="button" onClick={onSkip} className="btn-secondary">
            Maybe later
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default TestimonialPrompt;
