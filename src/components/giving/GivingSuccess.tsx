import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { GivingReceipt } from "@/components/giving/GivingReceipt";
import { TestimonialPrompt } from "@/components/landing/TestimonialPrompt";
import { formatKes } from "@/lib/giving/formatMoney";
import type { ContributionSummary } from "@/lib/giving/types";

type GivingSuccessProps = {
  summary: ContributionSummary;
  onGiveAgain: () => void;
};

export function GivingSuccess({ summary, onGiveAgain }: GivingSuccessProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [showTestimonial, setShowTestimonial] = useState(true);
  const multi = summary.lines.length > 1;
  const singleLabel = summary.campaignTitle || summary.lines[0]?.label || "this gift";

  const thankYou =
    summary.mode === "campaign" || !multi
      ? `Thank you for supporting SDA Zetech University Church through ${singleLabel}.`
      : "Thank you for your contribution.";

  const downloadReceipt = () => {
    setShowReceipt(true);
    requestAnimationFrame(() => {
      window.print();
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold text-heading">Contribution recorded</h2>
        <p className="mx-auto mt-2 max-w-lg text-body">{thankYou}</p>
      </div>

      <div className="rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-6">
        {summary.mode === "campaign" ? (
          <div className="text-center">
            <p className="text-sm text-muted-body">Campaign</p>
            <p className="mt-1 font-display text-2xl font-bold text-heading">{summary.campaignTitle}</p>
            <p className="mt-3 font-display text-3xl font-bold text-heading">{formatKes(summary.total)}</p>
          </div>
        ) : multi ? (
          <>
            <ul className="divide-y divide-[#1C1D4D]/8">
              {summary.lines.map((line) => (
                <li key={line.categoryId} className="flex items-center justify-between gap-3 py-3">
                  <span className="font-medium text-heading">{line.label}</span>
                  <span className="font-semibold text-body">{formatKes(line.amount)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-[#1C1D4D]/10 pt-4">
              <span className="font-semibold text-heading">Total</span>
              <span className="font-display text-2xl font-bold text-heading">{formatKes(summary.total)}</span>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-body">Category</p>
            <p className="mt-1 font-display text-2xl font-bold text-heading">{summary.lines[0]?.label}</p>
            <p className="mt-3 font-display text-3xl font-bold text-heading">{formatKes(summary.total)}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={downloadReceipt} className="btn-primary flex-1">
          Download Receipt
        </button>
        <Link to="/" className="btn-secondary flex-1 text-center">
          Return Home
        </Link>
        <Link to="/account" className="btn-secondary flex-1 text-center">
          View Giving History
        </Link>
        <button
          type="button"
          onClick={onGiveAgain}
          className="min-h-11 flex-1 rounded-button px-4 text-sm font-semibold text-heading underline-offset-4 hover:underline"
        >
          Give again
        </button>
      </div>

      {showTestimonial ? (
        <TestimonialPrompt
          contributorName={summary.donorName || "Friend"}
          onSubmit={() => {
            toast.success("Thank you! Your testimony will appear after approval.");
            setShowTestimonial(false);
          }}
          onSkip={() => setShowTestimonial(false)}
        />
      ) : null}

      <div className={showReceipt ? "print:block" : "hidden print:block"}>
        <GivingReceipt summary={summary} />
      </div>
    </div>
  );
}

export default GivingSuccess;
