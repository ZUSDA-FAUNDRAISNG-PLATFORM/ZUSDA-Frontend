import { HandCoins, Percent, Target, LayoutGrid } from "lucide-react";
import Reveal from "@/components/Reveal";
import { StatCard } from "@/components/landing/StatCard";
import { useFundraiserProgress } from "@/hooks/useFundraiserProgress";

export function ImpactStatsSection() {
  const { target, raised, progressPercent, campaignCount } = useFundraiserProgress();

  const stats = [
    { label: "Mission goal", value: target, prefix: "KES ", currency: true, icon: Target },
    { label: "Amount raised", value: raised, prefix: "KES ", currency: true, icon: HandCoins },
    { label: "Progress", value: progressPercent, suffix: "%", icon: Percent },
    { label: "Active campaigns", value: campaignCount, icon: LayoutGrid },
  ];

  return (
    <section aria-labelledby="impact-heading" className="relative bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="section-eyebrow">Impact at a glance</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 id="impact-heading" className="section-title">
              Quick Impact Summary
            </h2>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <p className="section-body">Live figures from the mission budget and published campaigns.</p>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImpactStatsSection;
