import { Heart, BookOpen, Users, Cross } from "lucide-react";
import MotivationMarquee from "@/components/MotivationMarquee";
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
    <section id="about" className="bg-cream py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium text-gold-dark">{state.site.aboutEyebrow}</p>
          <h2 className="mb-5 font-display text-3xl font-bold text-navy md:text-4xl">{state.site.aboutTitle}</h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{state.site.aboutBody}</p>
        </div>

        <div className="mx-auto mb-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {[
            { title: state.site.missionTitle, body: state.site.missionBody },
            { title: state.site.visionTitle, body: state.site.visionBody },
          ].map((item) => (
            <article key={item.title} className="rounded-xl border border-navy/10 bg-white p-6 sm:p-8">
              <h3 className="mb-3 font-display text-2xl font-semibold text-navy">{item.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>

        {values.length > 0 ? (
          <p className="mb-6 text-center text-sm font-medium text-gold-dark">Core values</p>
        ) : null}

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {values.map((item) => {
            const Icon = icons[item.icon] || Heart;
            return (
              <div key={item.id} className="rounded-xl border border-navy/10 bg-white p-6 text-center sm:p-8">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
                  <Icon className="text-gold-dark" size={22} />
                </div>
                <h3 className="mb-3 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        <MotivationMarquee />
      </div>
    </section>
  );
};

export default AboutSection;
