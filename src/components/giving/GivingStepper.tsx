import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GivingMode, GivingStep } from "@/lib/giving/types";

type GivingStepperProps = {
  current: GivingStep;
  mode: GivingMode;
  /** When false, hide allocate step for single-category general gifts. */
  showAllocate?: boolean;
};

export function GivingStepper({ current, mode, showAllocate = true }: GivingStepperProps) {
  if (current === "success") return null;

  const steps: Array<{ id: GivingStep; label: string }> =
    mode === "campaign"
      ? [
          { id: "amount", label: "Amount" },
          { id: "review", label: "Confirm" },
        ]
      : [
          { id: "categories", label: "Category" },
          { id: "amount", label: "Amount" },
          ...(showAllocate ? [{ id: "allocate" as const, label: "Allocate" }] : []),
          { id: "review", label: "Review" },
        ];

  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === current),
  );

  return (
    <nav aria-label="Giving steps" className="mb-8">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                {index > 0 ? (
                  <div
                    className={cn("h-0.5 flex-1 rounded-full", done || active ? "bg-brand" : "bg-[#1C1D4D]/15")}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" />
                )}
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition",
                    done && "bg-brand text-white",
                    active && "bg-brand text-white ring-4 ring-brand/15",
                    !done && !active && "bg-[#EEF2F7] text-muted-body",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <div
                    className={cn("h-0.5 flex-1 rounded-full", done ? "bg-brand" : "bg-[#1C1D4D]/15")}
                    aria-hidden
                  />
                ) : (
                  <div className="flex-1" />
                )}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] font-medium sm:text-xs",
                  active || done ? "text-heading" : "text-muted-body",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default GivingStepper;
