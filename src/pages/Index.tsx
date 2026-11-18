import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ImpactStatsSection from "@/components/landing/ImpactStatsSection";
import FeaturedCampaignsSection from "@/components/landing/FeaturedCampaignsSection";
import WhySupportSection from "@/components/landing/WhySupportSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import HomeCtaSection from "@/components/landing/HomeCtaSection";
import BudgetSection from "@/components/BudgetSection";
import Footer from "@/components/Footer";
import ScrollExtras from "@/components/ScrollExtras";
import Confetti from "@/components/Confetti";
import { EventsSection } from "@/components/CmsSections";
import CommitteeSection from "@/components/CommitteeSection";
import { InvolvementProvider, useInvolvement } from "@/components/InvolvementDialogs";

const MobileStickyActions = () => {
  const { open } = useInvolvement();

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-card border border-[#1C1D4D]/10 bg-white/95 px-3 py-3 shadow-[0_8px_32px_rgba(21,22,58,0.14)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button type="button" onClick={() => open("give", { mode: "general" })} className="btn-gold flex-1 text-sm">
          Give Now
        </button>
        <button type="button" onClick={() => open("pray")} className="btn-secondary flex-1 text-sm">
          Prayer
        </button>
      </div>
    </div>
  );
};

const Index = () => (
  <InvolvementProvider>
    <div className="min-h-screen overflow-x-hidden bg-page pb-28 md:pb-0">
      <Navbar />
      <HeroSection />
      <ImpactStatsSection />
      <FeaturedCampaignsSection />
      <WhySupportSection />
      <HowItWorksSection />
      <EventsSection />
      <CommitteeSection />
      <BudgetSection />
      <TestimonialsSection />
      <HomeCtaSection />
      <Footer />
      <MobileStickyActions />
      <ScrollExtras />
      <Confetti />
    </div>
  </InvolvementProvider>
);

export default Index;
