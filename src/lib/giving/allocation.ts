import type { AllocationMap, GivingCategory } from "@/lib/giving/types";

export type AllocationValidation = {
  allocated: number;
  remaining: number;
  isValid: boolean;
  isOver: boolean;
  message: string;
  progress: number;
};

export function sumAllocations(allocations: AllocationMap, categoryIds: string[]): number {
  return categoryIds.reduce((sum, id) => sum + (Number(allocations[id]) || 0), 0);
}

export function validateAllocations(
  totalAmount: number,
  categoryIds: string[],
  allocations: AllocationMap,
): AllocationValidation {
  const allocated = sumAllocations(allocations, categoryIds);
  const remaining = totalAmount - allocated;
  const isOver = remaining < 0;
  const isValid =
    totalAmount > 0 &&
    categoryIds.length > 0 &&
    remaining === 0 &&
    categoryIds.every((id) => (allocations[id] ?? 0) > 0);

  let message = "";
  if (totalAmount <= 0) {
    message = "Enter a total contribution amount first.";
  } else if (isOver) {
    message = `Over-allocated by ${Math.abs(remaining).toLocaleString("en-KE")} KES.`;
  } else if (remaining > 0) {
    message = `Remaining ${remaining.toLocaleString("en-KE")} KES to allocate.`;
  } else if (categoryIds.some((id) => (allocations[id] ?? 0) <= 0)) {
    message = "Each selected category needs an amount greater than zero.";
  } else {
    message = "Allocation matches your total contribution.";
  }

  const progress = totalAmount > 0 ? Math.min(100, Math.round((allocated / totalAmount) * 100)) : 0;

  return { allocated, remaining, isValid, isOver, message, progress };
}

/** When a single category is selected, put 100% of the total on that category. */
export function autoAllocateSingle(totalAmount: number, categoryId: string): AllocationMap {
  return { [categoryId]: totalAmount };
}

/** Keep only selected categories; drop orphan keys. */
export function pruneAllocations(allocations: AllocationMap, categoryIds: string[]): AllocationMap {
  const next: AllocationMap = {};
  for (const id of categoryIds) {
    next[id] = Number(allocations[id]) || 0;
  }
  return next;
}

export function buildLines(
  categories: GivingCategory[],
  categoryIds: string[],
  allocations: AllocationMap,
) {
  return categoryIds.map((id) => {
    const category = categories.find((item) => item.id === id);
    return {
      categoryId: id,
      label: category?.label ?? id,
      amount: Number(allocations[id]) || 0,
      projectId: category?.projectId ?? null,
    };
  });
}
