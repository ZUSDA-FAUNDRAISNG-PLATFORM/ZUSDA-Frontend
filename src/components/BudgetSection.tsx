import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Copy,
  Loader2,
  Target,
  HandCoins,
  ArrowRight,
  HeartHandshake,
  Clock3,
  BadgeCheck,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";
import { useInvolvement } from "./InvolvementDialogs";
import { useEventCollections } from "@/hooks/useEventCollections";
import { useCms, usePublished } from "@/cms/CmsProvider";
import { useLiveViewers } from "@/hooks/useLiveViewers";
import { apiGet } from "@/api/client";
import { getRecentContributions } from "@/api/contributions";
import {
  addLocalContribution,
  donorHash,
  loadLocalContributions,
  sumLocalContributions,
  type LocalContribution,
} from "@/lib/localContributions";

interface ProjectSummary {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
}

interface RecentContribution {
  id: number;
  hash: string;
  amount: number;
  created_at: string;
}

const MILESTONE_STEPS = [25, 50, 75, 100];

const CountUpValue = ({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let cancelled = false;
    const startValue = displayValue;
    const startTime = performance.now();
    const duration = 900;

    const tick = (currentTime: number) => {
      if (cancelled) return;
      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [value]);

  return <span className={className}>{`${prefix}${displayValue.toLocaleString("en-KE")}`}</span>;
};

function mergeRecent(apiItems: RecentContribution[], localItems: LocalContribution[]): RecentContribution[] {
  const merged = [...localItems, ...apiItems];
  const seen = new Set<number>();
  return merged
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);
}

const BudgetSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { open } = useInvolvement();
  const { state } = useCms();
  const posters = usePublished("posters");
  const featured = posters.find((item) => item.featured) ?? posters[0];
  const { activeCollection } = useEventCollections();
  const selectedProjectId = featured?.projectId ?? activeCollection?.projectId ?? null;
  const [apiRaised, setApiRaised] = useState(0);
  const [recent, setRecent] = useState<RecentContribution[]>(() => loadLocalContributions().slice(0, 3));
  const [loading, setLoading] = useState(true);
  const [pulseAmount, setPulseAmount] = useState<number | null>(null);
  const liveErrorToastRef = useRef(false);
  const previousIdsRef = useRef<Set<number>>(new Set(loadLocalContributions().map((item) => item.id)));
  const selectedProjectIdRef = useRef<number | null>(selectedProjectId);
  const viewerCount = useLiveViewers();
  selectedProjectIdRef.current = selectedProjectId;

  const target = Number(state.site.budgetGoal) > 0 ? Number(state.site.budgetGoal) : 416000;
  const paybill = state.site.paybill || "247247";
  const account = state.site.paybillAccount || "593021";
  const wordOfFaith = state.site.wordOfFaith || "Every shilling contributed is a seed sown in the Kingdom of God.";

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const refreshData = async () => {
    try {
      const projectId = selectedProjectIdRef.current;
      const [projectData, recentData] = await Promise.all([
        apiGet<ProjectSummary[]>("/projects/"),
        getRecentContributions({ projectId: projectId ?? undefined, limit: 3 }),
      ]);

      const projects = Array.isArray(projectData) ? projectData : [];
      const activeProject =
        (projectId ? projects.find((item) => item.id === projectId) : undefined) ?? projects[0] ?? null;
      const apiRecent = (recentData || []).map((item) => ({
        id: item.id,
        hash: donorHash(`${item.id}:${item.created_at}`),
        amount: item.amount,
        created_at: item.created_at,
      }));
      const nextRecent = mergeRecent(apiRecent, loadLocalContributions());
      const incoming = nextRecent.filter((item) => !previousIdsRef.current.has(item.id));

      if (incoming.length > 0 && previousIdsRef.current.size > 0) {
        const newest = incoming[0];
        setPulseAmount(newest.amount);
      }

      previousIdsRef.current = new Set(nextRecent.map((item) => item.id));
      setApiRaised(activeProject?.current_amount ?? 0);
      setRecent(nextRecent);
    } catch {
      setRecent(loadLocalContributions().slice(0, 3));
      if (!liveErrorToastRef.current) {
        liveErrorToastRef.current = true;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshData();
    const interval = window.setInterval(() => void refreshData(), 4000);
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ amount?: number; seed?: string }>).detail;
      const amount = Number(detail?.amount);
      if (amount > 0) {
        const gift = addLocalContribution(amount, detail?.seed);
        setRecent((current) => mergeRecent(current, [gift]));
        setPulseAmount(amount);
      }
      void refreshData();
    };

    window.addEventListener("zusda:contribution", handler);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("zusda:contribution", handler);
    };
  }, []);

  useEffect(() => {
    void refreshData();
  }, [selectedProjectId]);

  const raised = Math.max(apiRaised, sumLocalContributions());
  const remaining = Math.max(target - raised, 0);
  const progressPercent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const milestonePercent = MILESTONE_STEPS.find((step) => progressPercent < step) ?? 100;
  const milestoneAmount = Math.max(target * (milestonePercent / 100) - raised, 0);
  const targetLabel = useMemo(() => `KSH ${target.toLocaleString("en-KE")}`, [target]);
  const causeName = featured?.title || activeCollection?.name || "the Mission";

  return (
    <section id="budget" className="relative scroll-mt-28 bg-navy py-16 sm:py-20">
      <div className="container relative z-10 mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-gold">
              <TrendingUp size={14} />
              Live Mission Budget
            </div>
            <h2 className="mb-3 mt-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Loading
                </span>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-gold">KSH</span>
                  <CountUpValue value={raised} />
                  {pulseAmount ? (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold"
                    >
                      +KSH {pulseAmount.toLocaleString("en-KE")}
                    </motion.span>
                  ) : null}
                </div>
              )}
            </h2>
            <p className="text-lg text-primary-foreground/70">
              {progressPercent}% of the {targetLabel} target has already been covered
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gold">Campaign Progress</p>
                  <p className="mt-2 text-sm text-primary-foreground/70">Updates automatically as gifts come in and as the goal changes.</p>
                </div>
                <div className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-medium text-gold">Live</div>
              </div>

              <div className="relative mt-6 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gold"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-primary-foreground/70">
                <span className="font-semibold text-gold">{progressPercent}% funded</span>
                <span>KSH {remaining.toLocaleString("en-KE")} remaining</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {[0, ...MILESTONE_STEPS].map((step) => (
                  <span
                    key={step}
                    className={`rounded-md px-3 py-1 text-[11px] font-medium ${progressPercent >= step ? "border border-gold/30 bg-gold/10 text-gold" : "border border-white/10 text-white/50"}`}
                  >
                    {step}%
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-navy/30 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <HandCoins size={16} />
                    <span className="text-[11px] font-medium">Raised</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold text-primary-foreground">
                    <CountUpValue value={raised} prefix="KSH " />
                  </p>
                </div>
                <div className="rounded-xl border border-gold/15 bg-navy/30 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Target size={16} />
                    <span className="text-[11px] font-medium">Goal</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold text-primary-foreground">{targetLabel}</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-left"
              >
                <p className="mb-4 text-xs font-medium text-gold">Payment Details</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => copy(paybill, "Paybill")}
                    className="group rounded-xl border border-white/10 bg-navy/30 p-4 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Paybill</p>
                      <Copy className="text-gold/60 group-hover:text-gold" size={14} />
                    </div>
                    <p className="break-all font-display text-2xl font-bold text-primary-foreground">{paybill}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(account, "Account number")}
                    className="group rounded-xl border border-white/10 bg-navy/30 p-4 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Account No.</p>
                      <Copy className="text-gold/60 group-hover:text-gold" size={14} />
                    </div>
                    <p className="break-all font-display text-2xl font-bold text-primary-foreground">{account}</p>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => open("give", { projectId: selectedProjectId, causeName })}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-3 font-semibold text-navy transition-colors hover:bg-gold-light"
                >
                  Give Now
                  <ArrowRight size={16} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gold">Next Milestone</p>
                  <BadgeCheck className="text-gold" size={16} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-navy/30 text-xl font-semibold text-gold">
                    {milestonePercent}%
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-primary-foreground">
                      {progressPercent >= 100 ? "Goal reached" : `${milestonePercent}% of target`}
                    </p>
                    <p className="mt-1 text-sm text-primary-foreground/70">
                      {progressPercent >= 100
                        ? "Thank you. The mission goal has been met."
                        : `KSH ${milestoneAmount.toLocaleString("en-KE")} to the next milestone.`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-medium text-gold">Recent Contributions</p>
                <span className="rounded-md border border-white/10 px-3 py-1 text-[11px] font-medium text-gold">Live</span>
              </div>
              {recent.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {recent.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.85, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`rounded-xl border py-4 pl-5 pr-4 ${index === 0 ? "border-gold/30 bg-gold/5" : "border-white/10 bg-navy/30"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-sm text-gold">{item.hash}</p>
                          <p className="font-display text-lg font-bold text-primary-foreground">
                            KSH {item.amount.toLocaleString("en-KE")}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <p className="text-sm text-primary-foreground/70">Be the first to make a kingdom impact today.</p>
              )}
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="flex items-center gap-2 text-gold">
                  <HeartHandshake size={16} />
                  <p className="text-xs font-medium">A Word of Faith</p>
                </div>
                <p className="mt-4 font-display text-2xl leading-relaxed text-primary-foreground">“{wordOfFaith}”</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                className="rounded-xl border border-white/10 bg-navy/60 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gold">Live viewers</p>
                    <motion.p
                      key={viewerCount}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="mt-2 text-3xl font-semibold text-primary-foreground"
                    >
                      {viewerCount}
                    </motion.p>
                  </div>
                  <div className="rounded-full border border-gold/20 bg-gold/10 p-3 text-gold">
                    <Globe2 size={18} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/70">
                  <Clock3 size={14} className="text-gold" />
                  <span>People currently on this site</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BudgetSection;
