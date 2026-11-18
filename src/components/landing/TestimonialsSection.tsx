import Reveal from "@/components/Reveal";
import { TestimonialCarousel } from "@/components/landing/TestimonialCarousel";
import { useApprovedTestimonials } from "@/hooks/useApprovedTestimonials";

export function TestimonialsSection() {
  const { testimonials, isEmpty } = useApprovedTestimonials({ page: 1, pageSize: 3 });

  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Reveal direction="down">
            <p className="section-eyebrow">Stories of faith</p>
          </Reveal>
          <Reveal direction="up" delay={80}>
            <h2 className="section-title">Testimonials</h2>
          </Reveal>
          <Reveal direction="up" delay={120}>
            <p className="section-body">
              Voices from verified contributors who completed a successful gift to the mission.
            </p>
          </Reveal>
        </div>

        {isEmpty ? (
          <Reveal direction="up">
            <div className="mx-auto max-w-xl rounded-card border border-dashed border-[#1C1D4D]/20 bg-[#F7F8FC] px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold text-heading">Testimonials coming soon</p>
              <p className="mt-2 text-sm leading-relaxed text-body">
                After a successful contribution, supporters will be invited to rate their experience and share an optional
                testimony. Approved messages will appear here — latest three only.
              </p>
            </div>
          </Reveal>
        ) : (
          <TestimonialCarousel items={testimonials} />
        )}
      </div>
    </section>
  );
}

export default TestimonialsSection;
