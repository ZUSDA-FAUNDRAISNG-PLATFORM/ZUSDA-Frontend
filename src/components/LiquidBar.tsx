import { motion } from "framer-motion";
import { progressHue } from "@/lib/progress";

const LiquidBar = ({ percent }: { percent: number }) => {
  const boundedPercent = Math.max(0, Math.min(100, percent));
  const hue = progressHue(boundedPercent);

  return (
    <div
      aria-label="Fundraising progress"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={boundedPercent}
      className="h-4 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-sm"
      role="progressbar"
    >
      <motion.div
        initial={{ width: 0, backgroundColor: "hsl(0 85% 50%)" }}
        animate={{ width: `${boundedPercent}%`, backgroundColor: `hsl(${hue} 80% 50%)` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="liquid-fill h-full rounded-full"
        style={{ boxShadow: `0 0 16px hsl(${hue} 80% 50% / .55)` }}
      />
    </div>
  );
};

export default LiquidBar;
