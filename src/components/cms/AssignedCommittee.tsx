import CmsImage from "@/components/CmsImage";
import { useCms } from "@/cms/CmsProvider";
import { focalObjectClass } from "@/lib/imageFocal";
import { cn } from "@/lib/utils";

type AssignedCommitteeProps = {
  committeeId?: number | null;
  className?: string;
  compact?: boolean;
};

/**
 * Renders a published committee assigned in the CMS.
 * Returns null when no committee is assigned or the committee is hidden —
 * no empty cards, placeholders, or reserved spacing.
 */
export function AssignedCommittee({ committeeId, className, compact }: AssignedCommitteeProps) {
  const { state } = useCms();
  if (committeeId == null || committeeId <= 0) return null;

  const committee = (state.committees ?? []).find((item) => item.id === committeeId && item.published);
  if (!committee) return null;

  return (
    <aside
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[#1C1D4D]/10 bg-[#F7F8FC] p-3",
        compact ? "mt-3" : "mt-4",
        className,
      )}
      aria-label={`Committee: ${committee.name}`}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white sm:h-14 sm:w-14">
        {committee.imageUrl ? (
          <CmsImage
            src={committee.imageUrl}
            alt=""
            width={112}
            height={112}
            className={cn("h-full w-full", focalObjectClass("top"))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-heading/40">
            {committee.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-dark">Committee</p>
        <p className="truncate font-display text-sm font-semibold text-heading sm:text-base">{committee.name}</p>
        {committee.description && !compact ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-body">{committee.description}</p>
        ) : null}
      </div>
    </aside>
  );
}

export default AssignedCommittee;
