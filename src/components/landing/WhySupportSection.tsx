import { Eye, HeartHandshake, Sparkles, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { useCms } from "@/cms/CmsProvider";

const FEATURES = [
  {
    title: "Transparency",
    description: "Track campaign progress and see how every gift advances the mission.",
    icon: Eye,
  },
  {
    title: "Faith",
    description: "Support God’s work through giving that strengthens evangelism and discipleship.",
    icon: Sparkles,
  },
  {
    title: "Community",
    description: "Transform lives together as students, members, and friends unite in service.",
    icon: Users,
  },
  {
    title: "Prayer",
    description: "Submit prayer requests and stand with others covering the mission in faith.",
    icon: HeartHandshake,
  },
];

export function WhySupportSection() {
  const { state } = useCms();

  return (
    <section id="about" className="relative scroll-mt-28 bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="section-eyebrow">{state.site.aboutEyebrow || "Why give"}</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="section-title">Why Support ZUSDA</h2>
          </Reveal>
          <Reveal direction="up" delay={140}>
            <p className="section-body">{state.site.aboutBody}</p>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} delay={index * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhySupportSection;
