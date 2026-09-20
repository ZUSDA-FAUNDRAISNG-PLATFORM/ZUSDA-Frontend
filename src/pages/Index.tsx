import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ThemeSection from "@/components/ThemeSection";
import BudgetSection from "@/components/BudgetSection";
import GetInvolvedSection from "@/components/GetInvolvedSection";
import CommitteeSection from "@/components/CommitteeSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { AnnouncementsSection, EventsSection, GallerySection } from "@/components/CmsSections";
import { InvolvementProvider, useInvolvement } from "@/components/InvolvementDialogs";
import { usePublished } from "@/cms/CmsProvider";

const MobileStickyActions = () => {
  const { open } = useInvolvement();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-navy px-3 py-3 md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button
          onClick={() => open("give", { projectId: featured?.projectId, causeName: featured?.title || "the Mission" })}
          className="flex-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy"
        >
          Support
        </button>
        <a href="#involved" className="flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-center text-sm font-semibold text-white">
          Join
        </a>
      </div>
    </div>
  );
};

const Index = () => (
  <InvolvementProvider>
    <div className="min-h-screen overflow-x-hidden pb-24 md:pb-0">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ThemeSection />
      <AnnouncementsSection />
      <EventsSection />
      <BudgetSection />
      <GetInvolvedSection />
      <CommitteeSection />
      <GallerySection />
      <CTASection />
      <Footer />
      <MobileStickyActions />
    </div>
  </InvolvementProvider>
);

export default Index;
