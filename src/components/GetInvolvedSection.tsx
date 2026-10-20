import Reveal from "@/components/Reveal";
import { usePublished } from "@/cms/CmsProvider";
import { useInvolvement } from "./InvolvementDialogs";

const GetInvolvedSection = () => {
  const ministries = usePublished("ministries");
  const posters = usePublished("posters");
  const { open } = useInvolvement();
  if (!ministries.length) return null;
  const featured = posters.find((item) => item.featured) ?? posters[0];

  return (
    <section id="involved" className="relative overflow-hidden bg-cream py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-navy/15 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mb-12 text-center sm:mb-14">
          <Reveal direction="down">
            <p className="mb-3 text-sm font-medium tracking-wide text-gold-dark">Get Involved</p>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="mb-4 font-display text-3xl font-bold text-navy md:text-4xl">Ways to Participate</h2>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Everyone has a role to play. Whether through prayer, giving, or going — your involvement makes a difference.
            </p>
          </Reveal>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((item, i) => {
            const key = `${item.title} ${item.actionHref}`.toLowerCase();
            const dialog = key.includes("give") ? "give" : key.includes("pray") ? "pray" : key.includes("go") ? "go" : null;
            return (
              <Reveal key={item.id} direction="up" delay={(i % 3) * 130} className="h-full">
                <div className="glass-light hover-lift hover-glow flex h-full flex-col rounded-2xl p-6 text-center sm:p-8">
                  <h3 className="mb-3 font-display text-2xl font-bold text-navy">{item.title}</h3>
                  <p className="mb-6 flex-1 leading-relaxed text-muted-foreground">{item.description}</p>
                  {dialog ? (
                    <button
                      type="button"
                      onClick={() =>
                        open(
                          dialog,
                          dialog === "give"
                            ? { projectId: featured?.projectId, causeName: featured?.title }
                            : undefined,
                        )
                      }
                      className="rounded-lg bg-navy py-3 font-semibold text-white transition-colors hover:bg-navy-light"
                    >
                      {item.actionLabel}
                    </button>
                  ) : (
                    <a href={item.actionHref} className="block rounded-lg bg-navy py-3 text-center font-semibold text-white transition-colors hover:bg-navy-light">
                      {item.actionLabel}
                    </a>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
