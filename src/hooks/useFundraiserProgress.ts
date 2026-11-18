import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCms, usePublished } from "@/cms/CmsProvider";
import { useEventCollections } from "@/hooks/useEventCollections";
import { apiGet } from "@/api/client";
import { loadLocalContributions, sumLocalContributions } from "@/lib/localContributions";

interface ProjectSummary {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
}

/**
 * Reads the same CMS goal + project/local raised data as BudgetSection.
 * Presentational consumers should not invent alternate fundraising figures.
 */
export function useFundraiserProgress() {
  const { state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { activeCollection } = useEventCollections();
  const selectedProjectId = featured?.projectId ?? activeCollection?.projectId ?? null;

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["public-projects"],
    queryFn: () => apiGet<ProjectSummary[]>("/projects/"),
  });

  return useMemo(() => {
    const target = Number(state.site.budgetGoal) > 0 ? Number(state.site.budgetGoal) : 416000;
    const projects = Array.isArray(projectData) ? projectData : [];
    const activeProject =
      (selectedProjectId ? projects.find((item) => item.id === selectedProjectId) : undefined) ??
      projects[0] ??
      null;
    const apiRaised = activeProject?.current_amount ?? 0;
    const raised = Math.max(apiRaised, sumLocalContributions());
    const progressPercent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
    const gifts = loadLocalContributions();

    const campaigns = posters.map((poster) => {
      const matched = poster.projectId != null ? projects.find((item) => item.id === poster.projectId) : undefined;
      const goal = matched && matched.target_amount > 0 ? matched.target_amount : target;
      const campaignRaised = matched ? matched.current_amount : raised;
      return {
        id: String(poster.id),
        title: poster.title,
        description: poster.description || poster.subtitle || poster.eyebrow || "",
        imageUrl: poster.imageUrl,
        focal: poster.focal,
        committeeId: poster.committeeId ?? null,
        goal,
        raised: campaignRaised,
        projectId: poster.projectId ?? null,
        percent: goal > 0 ? Math.min(100, Math.round((campaignRaised / goal) * 100)) : 0,
      };
    });

    return {
      target,
      raised,
      progressPercent,
      campaignCount: posters.length,
      giftCount: gifts.length,
      campaigns,
      featured,
      isLoading,
    };
  }, [state.site.budgetGoal, projectData, selectedProjectId, posters, featured, isLoading]);
}
