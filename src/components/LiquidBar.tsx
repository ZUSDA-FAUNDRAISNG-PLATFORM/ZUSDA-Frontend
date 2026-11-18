import { motion } from "framer-motion";

const LiquidBar = ({ percent }: { percent: number }) => {
  const boundedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div
      aria-label="Fundraising progress"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={boundedPercent}
      className="h-4 overflow-hidden rounded-full bg-[#1C1D4D]/10 ring-1 ring-[#1C1D4D]/10"
      role="progressbar"
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${boundedPercent}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="liquid-fill h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b8942c]"
      />
    </div>
  );
};

export default LiquidBar;
