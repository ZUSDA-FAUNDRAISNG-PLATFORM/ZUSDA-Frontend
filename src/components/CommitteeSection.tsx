import Reveal from "@/components/Reveal";
import CmsImage from "@/components/CmsImage";
import { useCms, usePublished } from "@/cms/CmsProvider";
import { focalObjectClass } from "@/lib/imageFocal";

const initials = (name: string) =>
  name
    .replace(/Pastor|Eld\.?|Elder/gi, "")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * Mission Committee section — only renders when CMS assigns a published
 * mission committee via site.missionCommitteeId. Members shown are published
 * leaders linked to that committee (or all published members for the primary mission committee).
 */
const CommitteeSection = () => {
  const { state } = useCms();
  const members = usePublished("committee");
  const missionCommitteeId = state.site.missionCommitteeId ?? null;
  const committees = state.committees ?? [];
  const missionCommittee =
    missionCommitteeId != null
      ? committees.find((item) => item.id === missionCommitteeId && item.published)
      : undefined;

  // Relationship-driven: no assigned / unpublished committee → hide completely.
  if (!missionCommittee) return null;

  const linkedMembers = members.filter(
    (member) => member.committeeId == null || member.committeeId === missionCommittee.id || member.isChair,
  );
  if (!linkedMembers.length) return null;

  const chair = linkedMembers.find((item) => item.isChair);
  const departments = Array.from(
    new Set(linkedMembers.filter((item) => !item.isChair).map((item) => item.department).filter(Boolean)),
  );

  return (
    <section id="committee" className="relative overflow-hidden bg-background py-16 sm:py-24">
      <div className="container relative mx-auto px-4">
        <div className="mb-12 text-center sm:mb-16">
          <Reveal direction="down">
            <p className="mb-3 text-sm font-medium tracking-wide text-gold-dark">Leadership</p>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <h2 className="mb-4 font-display text-3xl font-bold text-navy md:text-4xl">{missionCommittee.name}</h2>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <p className="mx-auto max-w-xl text-muted-foreground">
              {missionCommittee.description || "Leaders serving this mission, updated from the admin dashboard."}
            </p>
          </Reveal>
        </div>

        {chair ? (
          <Reveal direction="zoom" className="mx-auto mb-10 max-w-5xl">
            <article className="rounded-card border border-[#1C1D4D]/8 bg-white p-6 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl border border-[#1C1D4D]/10 bg-[#EEF2F7] sm:w-32">
                  {chair.photoUrl ? (
                    <CmsImage
                      src={chair.photoUrl}
                      alt={chair.name}
                      width={256}
                      height={320}
                      loading="eager"
                      className={`h-full w-full ${focalObjectClass("top", "contain")}`}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-heading/40">
                      {initials(chair.name)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark">
                    {chair.position || "Chairperson"}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-heading md:text-3xl">{chair.name}</h3>
                  {chair.department ? (
                    <p className="mt-1 text-sm text-muted-body sm:text-base">{chair.department}</p>
                  ) : null}
                  {chair.bio ? (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">{chair.bio}</p>
                  ) : null}
                </div>
              </div>
            </article>
          </Reveal>
        ) : null}

        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department, i) => {
            const leaders = linkedMembers.filter((item) => !item.isChair && item.department === department);
            return (
              <Reveal key={department} direction="up" delay={(i % 3) * 130} className="h-full">
                <div className="border border-navy/10 bg-white shadow-sm hover-lift hover-glow flex h-full flex-col rounded-2xl p-6">
                  <h4 className="font-display text-lg font-bold text-navy">{department}</h4>
                  <p className="mb-5 text-sm text-muted-foreground">{leaders[0]?.bio}</p>
                  <div className="mt-auto flex flex-wrap justify-around gap-3 pt-2">
                    {leaders.map((leader) => (
                      <div key={leader.id} className="group flex w-28 flex-col items-center gap-2">
                        <div className="aspect-[4/5] w-20 overflow-hidden rounded-xl bg-navy/10 ring-2 ring-gold/60 transition-all duration-300 group-hover:scale-105 group-hover:ring-gold sm:w-24">
                          {leader.photoUrl ? (
                            <CmsImage
                              src={leader.photoUrl}
                              alt={leader.name}
                              width={192}
                              height={240}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                              className={`h-full w-full ${focalObjectClass("top", "contain")}`}
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-display text-sm font-bold text-navy">
                              {initials(leader.name)}
                            </span>
                          )}
                        </div>
                        <span className="text-center text-xs font-medium text-navy">{leader.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommitteeSection;
