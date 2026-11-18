import { formatKes } from "@/lib/giving/formatMoney";
import type { ContributionSummary } from "@/lib/giving/types";
import { cn } from "@/lib/utils";

type GivingReceiptProps = {
  summary: ContributionSummary;
  className?: string;
};

/**
 * Printable receipt layout. Wire `window.print()` from the success screen.
 * Campaign receipts emphasize campaign name + amount; general receipts show category breakdown.
 */
export function GivingReceipt({ summary, className }: GivingReceiptProps) {
  const dateLabel = new Date(summary.createdAt).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <article
      id="giving-receipt"
      className={cn(
        "rounded-card border border-[#1C1D4D]/10 bg-white p-6 text-heading shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-8",
        className,
      )}
    >
      <header className="border-b border-[#1C1D4D]/10 pb-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-dark">Contribution receipt</p>
        <h3 className="mt-2 font-display text-2xl font-bold">{summary.churchName}</h3>
        <p className="mt-1 text-sm text-body">ZUSDA Fundraiser Platform</p>
      </header>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-body">Contributor</dt>
          <dd className="font-semibold">{summary.donorName || "Anonymous"}</dd>
        </div>
        <div>
          <dt className="text-muted-body">Date</dt>
          <dd className="font-semibold">{dateLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-body">Payment method</dt>
          <dd className="font-semibold">{summary.paymentMethod}</dd>
        </div>
        <div>
          <dt className="text-muted-body">Transaction reference</dt>
          <dd className="break-all font-semibold">{summary.transactionReference}</dd>
        </div>
      </dl>

      <div className="mt-6">
        {summary.mode === "campaign" ? (
          <>
            <p className="text-sm font-semibold text-heading">Campaign</p>
            <div className="mt-3 rounded-2xl border border-[#1C1D4D]/8 px-4 py-3">
              <p className="font-display text-lg font-bold">{summary.campaignTitle}</p>
              <p className="mt-2 text-sm text-muted-body">Contribution amount</p>
              <p className="font-display text-2xl font-bold">{formatKes(summary.total)}</p>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-heading">Category breakdown</p>
            <ul className="mt-3 divide-y divide-[#1C1D4D]/8 rounded-2xl border border-[#1C1D4D]/8">
              {summary.lines.map((line) => (
                <li key={line.categoryId} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span>{line.label}</span>
                  <span className="font-semibold">{formatKes(line.amount)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 bg-[#F7F8FC] px-4 py-3 text-sm font-bold">
                <span>Total</span>
                <span>{formatKes(summary.total)}</span>
              </li>
            </ul>
          </>
        )}
      </div>

      <footer className="mt-8 border-t border-[#1C1D4D]/10 pt-4 text-center">
        <p className="text-sm leading-relaxed text-body">
          Thank you for supporting
          <br />
          <span className="font-semibold text-heading">SDA Zetech University Church.</span>
        </p>
      </footer>
    </article>
  );
}

export default GivingReceipt;
