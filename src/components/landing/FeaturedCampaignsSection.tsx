import Reveal from "@/components/Reveal";
import { CampaignCard } from "@/components/landing/CampaignCard";
import { useInvolvement } from "@/components/InvolvementDialogs";
import { useFundraiserProgress } from "@/hooks/useFundraiserProgress";

export function FeaturedCampaignsSection() {
  const { campaigns, target, raised } = useFundraiserProgress();
  const { open } = useInvolvement();

  if (!campaigns.length) {
    return (
      <section id="campaigns" className="relative scroll-mt-28 bg-section-alt py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl rounded-card border border-[#1C1D4D]/8 bg-white p-8 text-center shadow-[0_4px_20px_rgba(21,22,58,0.06)]">
            <h2 className="font-display text-2xl font-bold text-heading">Featured Campaigns</h2>
            <p className="mt-2 text-body">
              Campaigns will appear here once posters are published in the admin dashboard.
            </p>
            <p className="mt-4 text-sm font-medium text-heading">
              Mission goal: KES {target.toLocaleString("en-KE")} · Raised: KES {raised.toLocaleString("en-KE")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="campaigns" className="relative scroll-mt-28 bg-section-alt py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="section-eyebrow">Give with purpose</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="section-title">Featured Campaigns</h2>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <p className="section-body">
              Goals and progress use the mission budget and linked project totals from the fundraiser.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {campaigns.slice(0, 4).map((campaign, index) => (
            <CampaignCard
              key={campaign.id}
              title={campaign.title}
              description={campaign.description}
              imageUrl={campaign.imageUrl}
              focal={campaign.focal}
              committeeId={campaign.committeeId}
              goal={campaign.goal}
              raised={campaign.raised}
              delay={index * 0.06}
              onSupport={() =>
                open("give", {
                  mode: "campaign",
                  projectId: campaign.projectId,
                  posterId: Number(campaign.id),
                  causeName: campaign.title,
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedCampaignsSection;
