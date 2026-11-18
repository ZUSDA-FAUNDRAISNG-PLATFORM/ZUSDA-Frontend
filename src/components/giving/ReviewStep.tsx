import { formatKes } from "@/lib/giving/formatMoney";
import type { ContributionLine } from "@/lib/giving/types";

type ReviewStepProps = {
  lines: ContributionLine[];
  total: number;
  donorName: string;
  phone: string;
  paybill: string;
  account: string;
  mode?: "campaign" | "general";
  campaignTitle?: string;
  paymentMethodLabel?: string;
  onDonorNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export function ReviewStep({
  lines,
  total,
  donorName,
  phone,
  paybill,
  account,
  mode = "general",
  campaignTitle,
  paymentMethodLabel = "M-Pesa STK Push",
  onDonorNameChange,
  onPhoneChange,
}: ReviewStepProps) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-heading sm:text-3xl">
        {mode === "campaign" ? "Confirm contribution" : "Review contribution"}
      </h2>
      <p className="mt-2 text-body">Confirm your gift details before continuing to payment.</p>

      <div className="mt-6 rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">Contribution summary</p>
        {mode === "campaign" && campaignTitle ? (
          <p className="mt-3 font-display text-xl font-bold text-heading">{campaignTitle}</p>
        ) : null}
        <div className="mt-4 flex items-baseline justify-between gap-3 border-b border-[#1C1D4D]/8 pb-4">
          <span className="text-sm font-medium text-muted-body">Total</span>
          <span className="font-display text-2xl font-bold text-heading">{formatKes(total)}</span>
        </div>
        {mode === "general" ? (
          <ul className="divide-y divide-[#1C1D4D]/8">
            {lines.map((line) => (
              <li key={line.categoryId} className="flex items-center justify-between gap-3 py-3">
                <span className="text-sm font-medium text-heading">{line.label}</span>
                <span className="text-sm font-semibold text-body">{formatKes(line.amount)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4 rounded-2xl bg-[#F7F8FC] px-4 py-3">
          <p className="text-sm font-semibold text-heading">Payment method</p>
          <p className="mt-1 text-sm text-body">{paymentMethodLabel}</p>
          <p className="mt-2 text-xs text-muted-body">
            Manual fallback — Paybill <strong>{paybill}</strong>, Account <strong>{account}</strong>
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-6">
        <p className="text-sm font-semibold text-heading">Contributor details</p>
        <p className="text-xs text-muted-body">
          Prepared for M-Pesa STK Push. Payment initiation will be connected in a later update.
        </p>
        <div>
          <label htmlFor="donor-name" className="text-sm font-medium text-heading">
            Full name (optional)
          </label>
          <input
            id="donor-name"
            value={donorName}
            onChange={(event) => onDonorNameChange(event.target.value)}
            maxLength={100}
            className="mt-1.5 w-full rounded-2xl border border-[#1C1D4D]/15 bg-[#F7F8FC] px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div>
          <label htmlFor="donor-phone" className="text-sm font-medium text-heading">
            M-Pesa phone number
          </label>
          <input
            id="donor-phone"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder="0712345678"
            inputMode="tel"
            autoComplete="tel"
            className="mt-1.5 w-full rounded-2xl border border-[#1C1D4D]/15 bg-[#F7F8FC] px-4 py-3 text-sm text-heading outline-none focus:ring-2 focus:ring-gold"
            aria-required="true"
          />
        </div>
      </div>
    </div>
  );
}

export default ReviewStep;
