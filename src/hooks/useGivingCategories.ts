import { useMemo } from "react";
import { usePublished } from "@/cms/CmsProvider";
import type { GivingCategory } from "@/lib/giving/types";

/**
 * General-giving categories from the CMS dashboard (`givingCategories`).
 * Not hardcoded — administrators publish titles like Tithes, Mission, Offering.
 */
export function useGivingCategories(): GivingCategory[] {
  const items = usePublished("givingCategories");

  return useMemo(
    () =>
      [...items]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          id: `cat-${item.id}`,
          label: item.title,
          description: item.description || undefined,
          projectId: item.projectId != null ? Number(item.projectId) : 1,
        })),
    [items],
  );
}
