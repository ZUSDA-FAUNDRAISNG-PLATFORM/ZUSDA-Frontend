import { cn } from "@/lib/utils";
import { formatKes, formatKesInput, parseKesInput } from "@/lib/giving/formatMoney";
import { validateAllocations } from "@/lib/giving/allocation";
import type { AllocationMap, GivingCategory } from "@/lib/giving/types";

type AllocationStepProps = {
  categories: GivingCategory[];
  categoryIds: string[];
  totalAmount: number;
  allocations: AllocationMap;
  onChange: (categoryId: string, amount: number) => void;
};

export function AllocationStep({
  categories,
  categoryIds,
  totalAmount,
  allocations,
  onChange,
}: AllocationStepProps) {
  const selected = categories.filter((item) => categoryIds.includes(item.id));
  const validation = validateAllocations(totalAmount, categoryIds, allocations);
  const single = categoryIds.length === 1;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-heading sm:text-3xl">
        {single ? "Allocation" : "Allocate your gift"}
      </h2>
      <p className="mt-2 text-body">
        {single
          ? "One category selected — your full amount is applied automatically."
          : "Split your total across the selected categories. Allocations must equal the total."}
      </p>

      <div className="mt-6 rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted-body">Total</p>
            <p className="font-display text-2xl font-bold text-heading">{formatKes(totalAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-body">Remaining</p>
            <p
              className={cn(
                "font-display text-xl font-bold",
                validation.isValid ? "text-success" : validation.isOver ? "text-destructive" : "text-heading",
              )}
              aria-live="polite"
            >
              {validation.isOver
                ? `Over by ${formatKes(Math.abs(validation.remaining))}`
                : formatKes(validation.remaining)}
            </p>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]"
          role="progressbar"
          aria-valuenow={validation.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Allocation progress"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              validation.isOver ? "bg-destructive" : validation.isValid ? "bg-success" : "bg-gradient-to-r from-[#D4AF37] to-[#b8942c]",
            )}
            style={{ width: `${Math.min(100, validation.progress)}%` }}
          />
        </div>
        <p
          className={cn(
            "mt-3 text-sm",
            validation.isValid ? "text-success" : validation.isOver ? "text-destructive" : "text-muted-body",
          )}
          role="status"
        >
          {validation.message}
        </p>
      </div>

      <ul className="mt-6 space-y-4">
        {selected.map((category) => {
          const value = allocations[category.id] ?? 0;
          return (
            <li
              key={category.id}
              className="rounded-card border border-[#1C1D4D]/8 bg-white p-4 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-5"
            >
              <label htmlFor={`alloc-${category.id}`} className="block font-display text-lg font-bold text-heading">
                {category.label}
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#1C1D4D]/12 bg-[#F7F8FC] px-4 py-3 focus-within:ring-2 focus-within:ring-gold">
                <span className="text-sm font-semibold text-gold-dark" aria-hidden>
                  KES
                </span>
                <input
                  id={`alloc-${category.id}`}
                  inputMode="numeric"
                  disabled={single}
                  value={value > 0 ? value.toLocaleString("en-KE") : ""}
                  onChange={(event) => onChange(category.id, parseKesInput(formatKesInput(event.target.value)))}
                  className="w-full bg-transparent text-lg font-semibold text-heading outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  aria-label={`Amount for ${category.label}`}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AllocationStep;
