import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ThemeSection from "@/components/ThemeSection";
import BudgetSection from "@/components/BudgetSection";
import GetInvolvedSection from "@/components/GetInvolvedSection";
import CommitteeSection from "@/components/CommitteeSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { InvolvementProvider, useInvolvement } from "@/components/InvolvementDialogs";

const MobileStickyActions = () => {
  const { open } = useInvolvement();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-navy/95 px-3 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        <button
          onClick={() => open("give")}
          className="flex-1 rounded-full bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-lg"
        >
          Support
        </button>
        <a
          href="#involved"
          className="flex-1 rounded-full border border-gold/40 px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
        >
          Join
        </a>
      </div>
    </div>
  );
};

const Index = () => (
  <InvolvementProvider>
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <HeroSection />
      <div className="border-t border-gold/10"><AboutSection /></div>
      <div className="border-t border-gold/10"><ThemeSection /></div>
      <div className="border-t border-gold/10"><BudgetSection /></div>
      <div className="border-t border-gold/10"><GetInvolvedSection /></div>
      <div className="border-t border-gold/10"><CommitteeSection /></div>
      <div className="border-t border-gold/10"><CTASection /></div>
      <Footer />
      <MobileStickyActions />
    </div>
  </InvolvementProvider>
);

export default Index;
