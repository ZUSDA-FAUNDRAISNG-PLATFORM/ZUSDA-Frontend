import { Heart, BookOpen, Users, Cross } from "lucide-react";
import MotivationMarquee from "@/components/MotivationMarquee";
import Reveal from "@/components/Reveal";
import { useCms, usePublished } from "@/cms/CmsProvider";

const icons = {
  book: BookOpen,
  heart: Heart,
  users: Users,
  cross: Cross,
};

const AboutSection = () => {
  const { state } = useCms();
  const values = usePublished("values");

  return (
    <section id="about" className="relative overflow-hidden bg-cream py-16 sm:py-24">
      {/* soft blobs so the glass has something to blur */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-navy/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-1/3 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <Reveal direction="down">
            <p className="mb-3 text-sm font-medium tracking-wide text-gold-dark">{state.site.aboutEyebrow}</p>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="mb-5 font-display text-3xl font-bold text-navy md:text-4xl">{state.site.aboutTitle}</h2>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{state.site.aboutBody}</p>
          </Reveal>
        </div>

        <div className="mx-auto mb-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {[
            { title: state.site.missionTitle, body: state.site.missionBody },
            { title: state.site.visionTitle, body: state.site.visionBody },
          ].map((item, i) => (
            <Reveal key={item.title} direction={i === 0 ? "left" : "right"} delay={i * 120} className="h-full">
              <article className="glass-light hover-lift hover-glow h-full rounded-2xl p-6 sm:p-8">
                <h3 className="mb-3 font-display text-2xl font-semibold text-navy">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        {values.length > 0 ? (
          <Reveal direction="up">
            <p className="mb-6 text-center text-sm font-medium tracking-wide text-gold-dark">Core values</p>
          </Reveal>
        ) : null}

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {values.map((item, i) => {
            const Icon = icons[item.icon] || Heart;
            return (
              <Reveal key={item.id} direction="up" delay={i * 130} className="h-full">
                <div className="glass-light hover-lift hover-glow group h-full rounded-2xl p-6 text-center sm:p-8">
                  <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/15 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="text-gold-dark" size={22} />
                  </div>
                  <h3 className="mb-3 font-display text-xl font-semibold text-navy">{item.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="relative mt-16">
        <MotivationMarquee />
      </div>
    </section>
  );
};

export default AboutSection;
