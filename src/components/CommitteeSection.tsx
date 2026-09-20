import { usePublished } from "@/cms/CmsProvider";

const initials = (name: string) =>
  name
    .replace(/Pastor|Eld\.?|Elder/gi, "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const CommitteeSection = () => {
  const members = usePublished("committee");
  const chair = members.find((item) => item.isChair);
  const departments = Array.from(new Set(members.filter((item) => !item.isChair).map((item) => item.department)));

  if (!members.length) return null;

  return (
    <section id="committee" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center sm:mb-16">
          <p className="mb-3 text-sm font-medium text-gold-dark">Leadership</p>
          <h2 className="mb-4 font-display text-3xl font-bold text-navy md:text-4xl">Mission Committee</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">Leaders serving the Kinamba mission, updated from the admin dashboard.</p>
        </div>

        {chair ? (
          <div className="mx-auto mb-10 max-w-5xl rounded-xl border border-gold/20 bg-navy p-6 text-primary-foreground sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-28 w-28 overflow-hidden rounded-full ring-2 ring-gold/50 ring-offset-2 ring-offset-navy sm:h-32 sm:w-32">
                {chair.photoUrl ? <img src={chair.photoUrl} alt={chair.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div className="text-center sm:text-left">
                <p className="mb-1 text-xs font-medium text-gold">{chair.position}</p>
                <h3 className="mb-1 font-display text-2xl font-bold md:text-3xl">{chair.name}</h3>
                <p className="text-primary-foreground/70">{chair.department}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => {
            const leaders = members.filter((item) => !item.isChair && item.department === department);
            return (
              <div key={department} className="flex flex-col rounded-xl border border-navy/10 bg-cream p-6">
                <h4 className="font-display text-lg font-bold text-navy">{department}</h4>
                <p className="mb-5 text-sm text-muted-foreground">{leaders[0]?.bio}</p>
                <div className="mt-auto flex flex-wrap justify-around gap-3 pt-2">
                  {leaders.map((leader) => (
                    <div key={leader.id} className="flex w-28 flex-col items-center gap-2">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-navy/10 ring-2 ring-gold/60 sm:h-24 sm:w-24">
                        {leader.photoUrl ? (
                          <img src={leader.photoUrl} alt={leader.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="font-display text-sm font-bold text-navy">{initials(leader.name)}</span>
                        )}
                      </div>
                      <span className="text-center text-xs font-medium text-navy">{leader.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommitteeSection;
