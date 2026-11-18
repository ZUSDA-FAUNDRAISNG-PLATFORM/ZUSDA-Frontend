import { ChevronDown } from "lucide-react";
import Reveal from "@/components/Reveal";
import { StepCard } from "@/components/landing/StepCard";

const STEPS = [
  { step: 1, title: "Choose a campaign", description: "Pick the outreach cause that God places on your heart." },
  { step: 2, title: "Select category", description: "Give, pray, or go — every act of support matters." },
  { step: 3, title: "Complete M-Pesa payment", description: "Confirm your gift securely through the existing M-Pesa flow." },
  { step: 4, title: "Receive confirmation", description: "Get confirmation and a receipt once your gift is recorded." },
];

export function HowItWorksSection() {
  return (
    <section id="involved" className="relative scroll-mt-28 bg-page py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="section-eyebrow">Simple & secure</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="section-title">How It Works</h2>
          </Reveal>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((step, index) => (
            <div key={step.step} className="relative flex flex-col">
              <StepCard {...step} delay={index * 0.08} />
              {index < STEPS.length - 1 ? (
                <div className="flex justify-center py-2 xl:hidden" aria-hidden>
                  <ChevronDown className="h-5 w-5 text-gold" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
