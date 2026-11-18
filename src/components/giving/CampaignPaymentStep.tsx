import CmsImage from "@/components/CmsImage";
import { formatKes, formatKesInput, parseKesInput } from "@/lib/giving/formatMoney";
import type { CampaignContext, PaymentMethodId } from "@/lib/giving/types";
import { cn } from "@/lib/utils";

type CampaignPaymentStepProps = {
  campaign: CampaignContext;
  amount: number;
  paymentMethod: PaymentMethodId;
  onAmountChange: (amount: number) => void;
  onPaymentMethodChange: (method: PaymentMethodId) => void;
};

const METHODS: Array<{ id: PaymentMethodId; label: string; available: boolean }> = [
  { id: "mpesa", label: "M-Pesa STK Push", available: true },
  { id: "bank", label: "Bank transfer", available: false },
  { id: "card", label: "Card", available: false },
  { id: "other", label: "Other", available: false },
];

/**
 * Campaign support payment page: campaign summary + amount + payment method.
 * No category selection — campaign is already known.
 */
export function CampaignPaymentStep({
  campaign,
  amount,
  paymentMethod,
  onAmountChange,
  onPaymentMethodChange,
}: CampaignPaymentStepProps) {
  const display = amount > 0 ? amount.toLocaleString("en-KE") : "";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-card border border-[#1C1D4D]/8 bg-white shadow-[0_4px_20px_rgba(21,22,58,0.06)]">
        <div className="aspect-[16/10] bg-[#EEF2F7]">
          {campaign.imageUrl ? (
            <CmsImage
              src={campaign.imageUrl}
              alt=""
              width={960}
              height={600}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">Campaign support</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-heading sm:text-3xl">{campaign.title}</h2>
          {campaign.description ? <p className="mt-2 text-sm leading-relaxed text-body">{campaign.description}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F7F8FC] px-4 py-3">
              <p className="text-xs text-muted-body">Goal</p>
              <p className="font-display text-lg font-bold text-heading">{formatKes(campaign.goal)}</p>
            </div>
            <div className="rounded-2xl bg-[#F7F8FC] px-4 py-3">
              <p className="text-xs text-muted-body">Progress</p>
              <p className="font-display text-lg font-bold text-heading">
                {formatKes(campaign.raised)} · {campaign.percent}%
              </p>
            </div>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#1C1D4D]/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8942c]"
              style={{ width: `${campaign.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="campaign-amount" className="block text-sm font-semibold text-heading">
          Amount (KES)
        </label>
        <div className="mt-2 flex items-center gap-3 rounded-card border border-[#1C1D4D]/12 bg-white px-4 py-3 shadow-[0_4px_20px_rgba(21,22,58,0.06)] focus-within:ring-2 focus-within:ring-gold">
          <span className="font-semibold text-gold-dark" aria-hidden>
            KES
          </span>
          <input
            id="campaign-amount"
            inputMode="numeric"
            pattern="[0-9,]*"
            autoComplete="off"
            placeholder="1,000"
            value={display}
            onChange={(event) => onAmountChange(parseKesInput(formatKesInput(event.target.value)))}
            className="w-full bg-transparent text-2xl font-semibold text-heading outline-none placeholder:text-[#1C1D4D]/25"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-heading">Payment method</legend>
        <div className="mt-3 grid gap-2">
          {METHODS.map((method) => (
            <label
              key={method.id}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition",
                paymentMethod === method.id ? "border-brand bg-[#EEF2F7]" : "border-[#1C1D4D]/10 bg-white",
                !method.available && "cursor-not-allowed opacity-50",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.id}
                checked={paymentMethod === method.id}
                disabled={!method.available}
                onChange={() => onPaymentMethodChange(method.id)}
                className="h-4 w-4 border-[#1C1D4D]/30 text-brand focus:ring-gold"
              />
              <span className="text-sm font-medium text-heading">
                {method.label}
                {!method.available ? <span className="ml-2 text-xs text-muted-body">Coming soon</span> : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export default CampaignPaymentStep;
