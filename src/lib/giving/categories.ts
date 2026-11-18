import type { GivingCategory } from "@/lib/giving/types";

/**
 * Empty fallback when CMS has not seeded giving categories yet.
 * Prefer dashboard-managed `givingCategories` via `useGivingCategories`.
 */
export const DEFAULT_GIVING_CATEGORIES: GivingCategory[] = [];
