import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CmsImage from "@/components/CmsImage";
import { AssignedCommittee } from "@/components/cms/AssignedCommittee";
import type { ImageFocal } from "@/cms/types";
import { focalObjectClass } from "@/lib/imageFocal";

export type CampaignCardProps = {
  title: string;
  description: string;
  imageUrl?: string;
  focal?: ImageFocal;
  committeeId?: number | null;
  goal: number;
  raised: number;
  onSupport: () => void;
  className?: string;
  delay?: number;
};

const currency = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;

export function CampaignCard({
  title,
  description,
  imageUrl,
  focal,
  committeeId,
  goal,
  raised,
  onSupport,
  className,
  delay = 0,
}: CampaignCardProps) {
  const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-card border border-[#1C1D4D]/8 bg-white shadow-[0_4px_20px_rgba(21,22,58,0.06)] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(21,22,58,0.12)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EEF2F7]">
        {imageUrl ? (
          <CmsImage
            src={imageUrl}
            alt=""
            width={800}
            height={500}
            loading={delay === 0 ? "eager" : "lazy"}
            className={cn("h-full w-full", focalObjectClass(focal))}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <p className="font-display text-lg font-semibold text-heading/35">{title}</p>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-heading shadow-sm">
          {percent}% funded
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold text-heading">{title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-body">
          {description || "Support this mission campaign."}
        </p>
        <AssignedCommittee committeeId={committeeId} compact />

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-body">
            <span>Raised {currency(raised)}</span>
            <span>Goal {currency(goal)}</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-[#1C1D4D]/10"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${title} progress`}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8942c]"
              initial={{ width: 0 }}
              whileInView={{ width: `${percent}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <button type="button" onClick={onSupport} className="btn-primary mt-5 w-full text-sm">
          Support
        </button>
      </div>
    </motion.article>
  );
}

export default CampaignCard;
