import { formatKes, formatKesInput, parseKesInput } from "@/lib/giving/formatMoney";

type AmountStepProps = {
  amount: number;
  onChange: (amount: number) => void;
  categoryCount: number;
};

export function AmountStep({ amount, onChange, categoryCount }: AmountStepProps) {
  const display = amount > 0 ? amount.toLocaleString("en-KE") : "";

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-heading sm:text-3xl">Enter total amount</h2>
      <p className="mt-2 text-body">
        How much would you like to give in total
        {categoryCount > 1 ? ` across ${categoryCount} categories` : ""}?
      </p>

      <label htmlFor="giving-total" className="mt-8 block text-sm font-semibold text-heading">
        Total contribution (KES)
      </label>
      <div className="mt-2 flex items-center gap-3 rounded-card border border-[#1C1D4D]/12 bg-white px-4 py-3 shadow-[0_4px_20px_rgba(21,22,58,0.06)] focus-within:ring-2 focus-within:ring-gold">
        <span className="font-semibold text-gold-dark" aria-hidden>
          KES
        </span>
        <input
          id="giving-total"
          inputMode="numeric"
          pattern="[0-9,]*"
          autoComplete="off"
          placeholder="1,000"
          value={display}
          onChange={(event) => {
            const next = formatKesInput(event.target.value);
            onChange(parseKesInput(next));
          }}
          className="w-full bg-transparent text-2xl font-semibold text-heading outline-none placeholder:text-[#1C1D4D]/25"
          aria-describedby="giving-total-hint"
        />
      </div>
      <p id="giving-total-hint" className="mt-2 text-sm text-muted-body">
        Positive whole numbers only. {amount > 0 ? `Preview: ${formatKes(amount)}` : "Example: KES 1,000"}
      </p>
    </div>
  );
}

export default AmountStep;
