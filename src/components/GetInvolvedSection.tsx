import { usePublished } from "@/cms/CmsProvider";
import { useInvolvement } from "./InvolvementDialogs";

const GetInvolvedSection = () => {
  const ministries = usePublished("ministries");
  const posters = usePublished("posters");
  const { open } = useInvolvement();
  if (!ministries.length) return null;
  const featured = posters.find((item) => item.featured) ?? posters[0];

  return (
    <section id="involved" className="bg-cream py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center sm:mb-14">
          <p className="mb-3 text-sm font-medium text-gold-dark">Get Involved</p>
          <h2 className="mb-4 font-display text-3xl font-bold text-navy md:text-4xl">Ways to Participate</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everyone has a role to play. Whether through prayer, giving, or going — your involvement makes a difference.
          </p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((item) => {
            const key = `${item.title} ${item.actionHref}`.toLowerCase();
            const dialog = key.includes("give") ? "give" : key.includes("pray") ? "pray" : key.includes("go") ? "go" : null;
            return (
              <div key={item.id} className="flex flex-col rounded-xl border border-navy/10 bg-white p-6 text-center sm:p-8">
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
                    className="rounded-lg bg-navy py-3 font-semibold text-white hover:bg-navy-light"
                  >
                    {item.actionLabel}
                  </button>
                ) : (
                  <a href={item.actionHref} className="block rounded-lg bg-navy py-3 text-center font-semibold text-white hover:bg-navy-light">
                    {item.actionLabel}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
