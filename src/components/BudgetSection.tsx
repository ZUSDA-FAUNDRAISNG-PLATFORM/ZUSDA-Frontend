import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TrendingUp,
  Copy,
  Loader2,
  Target,
  HandCoins,
  ArrowRight,
  Sparkles,
  Users,
  HeartHandshake,
  Clock3,
  BadgeCheck,
  Globe2,
} from "lucide-react";
import { toast } from "sonner";
import { useInvolvement } from "./InvolvementDialogs";
import { apiGet } from "@/api/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProjectSummary {
  id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  progress_percent: number;
}

interface RecentContribution {
  id: number;
  donor_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface LiveNotification {
  id: number;
  donorName: string;
  amount: number;
  createdAt: string;
}

const DEFAULT_TARGET = 416000;
const VIEWER_PRESENCE_KEY = "zusda:viewers";
const VIEWER_TTL_MS = 12000;

const formatRelativeTime = (timestamp: string) => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
};

const CountUpValue = ({ value, prefix = "", className = "" }: { value: number; prefix?: string; className?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let cancelled = false;
    const startValue = displayValue;
    const startTime = performance.now();
    const duration = 900;

    const tick = (currentTime: number) => {
      if (cancelled) {
        return;
      }

      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (value - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }, [value]);

  return <span className={className}>{`${prefix}${displayValue.toLocaleString("en-KE")}`}</span>;
};

const BudgetSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { open } = useInvolvement();
  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [recent, setRecent] = useState<RecentContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveNotifications, setLiveNotifications] = useState<LiveNotification[]>([]);
  const [viewerCount, setViewerCount] = useState(30);
  const [pulseAmount, setPulseAmount] = useState<number | null>(null);
  const viewerIdRef = useRef<string | null>(null);
  const previousIdsRef = useRef<Set<number>>(new Set());
  const initialLoadRef = useRef(true);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const refreshData = async () => {
    try {
      const [projectData, recentData] = await Promise.all([
        apiGet<ProjectSummary[]>("/projects/"),
        apiGet<RecentContribution[]>("/contributions/recent?limit=6"),
      ]);

      const activeProject = Array.isArray(projectData) && projectData[0] ? projectData[0] : null;
      const nextRecent = recentData || [];
      const incoming = nextRecent.filter((item) => !previousIdsRef.current.has(item.id));

      if (!initialLoadRef.current && incoming.length > 0) {
        const newest = incoming[0];
        setLiveNotifications((current) => [
          {
            id: newest.id,
            donorName: newest.donor_name?.trim() || "Anonymous donor",
            amount: newest.amount,
            createdAt: newest.created_at,
          },
          ...current,
        ].slice(0, 3));
        setPulseAmount(newest.amount);
        setViewerCount((current) => current + 1);
        toast.success(`${newest.donor_name?.trim() || "Anonymous donor"} just donated KSH ${newest.amount.toLocaleString("en-KE")}`);
      }

      initialLoadRef.current = false;
      previousIdsRef.current = new Set(nextRecent.map((item) => item.id));
      setProject(activeProject);
      setRecent(nextRecent);
    } catch {
      toast.error("Could not load live contribution data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = window.setInterval(refreshData, 8000);
    const handler = () => {
      refreshData();
    };

    const syncViewerPresence = () => {
      const now = Date.now();
      const entry = { id: viewerIdRef.current || `${now}-${Math.random().toString(36).slice(2)}`, updatedAt: now };
      viewerIdRef.current = entry.id;

      const raw = window.localStorage.getItem(VIEWER_PRESENCE_KEY);
      const existing = raw ? (JSON.parse(raw) as Array<{ id: string; updatedAt: number }>) : [];
      const filtered = existing.filter((item) => item.id !== entry.id && now - item.updatedAt < VIEWER_TTL_MS);
      filtered.push(entry);
      window.localStorage.setItem(VIEWER_PRESENCE_KEY, JSON.stringify(filtered));
      setViewerCount(filtered.length);
    };

    syncViewerPresence();
    const presenceInterval = window.setInterval(syncViewerPresence, 4000);
    const cleanupPresence = () => {
      const raw = window.localStorage.getItem(VIEWER_PRESENCE_KEY);
      if (!raw || !viewerIdRef.current) {
        return;
      }

      const existing = JSON.parse(raw) as Array<{ id: string; updatedAt: number }>;
      const filtered = existing.filter((item) => item.id !== viewerIdRef.current);
      window.localStorage.setItem(VIEWER_PRESENCE_KEY, JSON.stringify(filtered));
    };

    window.addEventListener("zusda:contribution", handler);
    window.addEventListener("beforeunload", cleanupPresence);
    return () => {
      window.clearInterval(interval);
      window.clearInterval(presenceInterval);
      cleanupPresence();
      window.removeEventListener("zusda:contribution", handler);
      window.removeEventListener("beforeunload", cleanupPresence);
    };
  }, []);

  const amountLabel = useMemo(() => {
    const value = project?.current_amount ?? 0;
    return `KSH ${value.toLocaleString("en-KE")}`;
  }, [project]);

  const targetLabel = useMemo(() => {
    return `KSH ${((project?.target_amount ?? DEFAULT_TARGET)).toLocaleString("en-KE")}`;
  }, [project]);

  const raised = project?.current_amount ?? 0;
  const target = project?.target_amount ?? DEFAULT_TARGET;
  const remaining = Math.max(target - raised, 0);
  const progressPercent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;
  const milestonePercent = 25;
  const milestoneAmount = Math.max(target * (milestonePercent / 100) - raised, 0);
  const contributorCount = useMemo(() => {
    const uniqueDonors = new Set(recent.map((item) => item.donor_name?.trim()).filter(Boolean));
    return uniqueDonors.size > 0 ? uniqueDonors.size : 1;
  }, [recent]);
  const contributorDetail = useMemo(() => {
    if (recent.length === 0) {
      return "Be the first to join the mission";
    }

    const uniqueDonors = new Set(recent.map((item) => item.donor_name?.trim()).filter(Boolean));
    const count = uniqueDonors.size > 0 ? uniqueDonors.size : recent.length;
    return `${count} ${count === 1 ? "supporter" : "supporters"} in the latest activity`;
  }, [recent]);
  const averageDonation = recent.length > 0 ? Math.round(raised / recent.length) : 0;
  const largestDonation = recent.reduce((max, item) => Math.max(max, item.amount), 0);
  const supportWall = useMemo(() => recent.slice(0, 6).map((item) => item.donor_name?.trim() || "Anonymous donor"), [recent]);
  const getAppreciationMessage = (name: string) => {
    const isAnonymous = name === "Anonymous donor";
    return isAnonymous
      ? "Thank you for helping advance this mission."
      : "Thank you for your faithful support of this mission.";
  };
  const milestoneSteps = [0, 25, 50, 75, 100];

  return (
    <section className="relative overflow-hidden bg-navy py-20">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute left-1/4 top-1/2 h-72 w-72 rounded-full bg-gold blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
      </div>
      <div className="container relative z-10 mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <TrendingUp size={14} />
              Live Mission Budget
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground/60">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span>Realtime giving pulse</span>
            </div>
            <h2 className="mb-3 mt-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Loading
                </span>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-gold">KSH</span>
                  <CountUpValue value={raised} prefix="" className="" />
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
              {project ? `${project.progress_percent}% of the ${targetLabel} target has already been covered` : "Every contribution is an investment in eternity."}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-gold/20 bg-gradient-to-br from-primary-foreground/10 to-primary-foreground/5 p-6 shadow-2xl shadow-black/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Campaign Progress</p>
                  <p className="mt-2 text-sm text-primary-foreground/70">A faithful community is building this mission together.</p>
                </div>
                <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Live
                </div>
              </div>

              <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-primary-foreground/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="h-3 rounded-full bg-gradient-gold"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-primary-foreground/70">
                <span>{progressPercent}% funded</span>
                <span>{remaining.toLocaleString("en-KE")} remaining</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {milestoneSteps.map((step) => (
                  <span
                    key={step}
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${progressPercent >= step ? "border border-gold/30 bg-gold/10 text-gold" : "border border-gold/10 bg-primary-foreground/5 text-primary-foreground/50"}`}
                  >
                    {step}%
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gold/15 bg-navy/30 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <HandCoins size={16} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Raised</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold text-primary-foreground">{amountLabel}</p>
                </div>
                <div className="rounded-2xl border border-gold/15 bg-navy/30 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Target size={16} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Goal</span>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold text-primary-foreground">{targetLabel}</p>
                </div>
                <div className="rounded-2xl border border-gold/15 bg-navy/30 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Users size={16} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">Contributors</span>
                  </div>
                  <motion.p
                    key={contributorCount}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 font-display text-xl font-semibold text-primary-foreground"
                  >
                    {contributorCount}
                  </motion.p>
                  <p className="mt-1 text-sm text-primary-foreground/60">{contributorDetail}</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 }}
                className="rounded-3xl border border-gold/20 bg-primary-foreground/5 p-6 text-left"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Payment Details</p>
                  <Sparkles className="text-gold" size={16} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <button
                    onClick={() => copy("247247", "Paybill")}
                    className="group rounded-2xl border border-gold/20 bg-navy/30 p-4 text-left transition-all hover:-translate-y-1 hover:bg-primary-foreground/10"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Paybill</p>
                      <Copy className="text-gold/60 group-hover:text-gold" size={14} />
                    </div>
                    <p className="font-display text-2xl font-bold text-primary-foreground">247247</p>
                  </button>
                  <button
                    onClick={() => copy("593021", "Account number")}
                    className="group rounded-2xl border border-gold/20 bg-navy/30 p-4 text-left transition-all hover:-translate-y-1 hover:bg-primary-foreground/10"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Account No.</p>
                      <Copy className="text-gold/60 group-hover:text-gold" size={14} />
                    </div>
                    <p className="font-display text-2xl font-bold text-primary-foreground">593021</p>
                  </button>
                </div>
                <button
                  onClick={() => open("give")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold px-4 py-3 font-semibold text-secondary-foreground transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-gold/20"
                >
                  Give Now
                  <ArrowRight size={16} />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-6"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Next Milestone</p>
                  <BadgeCheck className="text-gold" size={16} />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-navy/30 text-xl font-semibold text-gold">
                    {milestonePercent}%
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-primary-foreground">{milestonePercent}% of target</p>
                    <p className="mt-1 text-sm text-primary-foreground/70">
                      {milestoneAmount > 0 ? `Only KSH ${milestoneAmount.toLocaleString("en-KE")} remains.` : "The next milestone has already been reached."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {recent.length > 0 ? (
              <div className="rounded-3xl border border-gold/20 bg-primary-foreground/5 p-4 text-left shadow-lg shadow-black/10">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Recent Contributions</p>
                  <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Live</span>
                </div>
                <div className="space-y-2">
                  {recent.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm text-primary-foreground/80 ${index === 0 ? "border-gold/30 bg-gold/10 shadow-lg shadow-gold/10" : "border-gold/10 bg-navy/30"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 bg-navy/60 text-[11px] font-semibold text-gold">
                          {item.donor_name?.trim() ? item.donor_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() : "AN"}
                        </span>
                        <div>
                          <p className="font-medium text-primary-foreground">{item.donor_name}</p>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">{formatRelativeTime(item.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gold">KSH {item.amount.toLocaleString("en-KE")}</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">{item.status}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-gold/20 bg-primary-foreground/5 p-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Recent Contributions</p>
                <p className="mt-3 text-sm text-primary-foreground/70">Be the first to make a kingdom impact today.</p>
              </div>
            )}

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.25 }}
                className="rounded-3xl border border-gold/20 bg-primary-foreground/5 p-6"
              >
                <div className="flex items-center gap-2 text-gold">
                  <HeartHandshake size={16} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">A Word of Faith</p>
                </div>
                <p className="mt-4 font-display text-2xl leading-relaxed text-primary-foreground">
                  “Every shilling contributed is a seed sown in the Kingdom of God.”
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-gold/20 bg-navy/60 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Live viewers</p>
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
                  <span>Momentum is building in real time</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.35 }}
                className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/10 to-transparent p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Support wall</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {supportWall.length === 0 ? (
                    <p className="text-sm text-primary-foreground/60">
                      Be the first to leave your mark on the support wall.
                    </p>
                  ) : (
                    supportWall.map((supporter, index) => (
                      <div
                        key={`${supporter}-${index}`}
                        className="flex flex-col rounded-2xl border border-gold/20 bg-primary-foreground/5 px-3 py-2"
                      >
                        <span className="text-sm font-medium text-primary-foreground/90">{supporter}</span>
                        <span className="mt-0.5 text-xs text-primary-foreground/60">{getAppreciationMessage(supporter)}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {liveNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 28, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 28, y: -10 }}
                className="fixed right-4 top-4 z-50 w-72 rounded-2xl border border-gold/20 bg-navy/95 p-4 shadow-2xl shadow-black/30"
              >
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles size={14} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em]">New donation</p>
                </div>
                <p className="mt-3 font-semibold text-primary-foreground">{notification.donorName}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">KSH {notification.amount.toLocaleString("en-KE")}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-primary-foreground/50">{formatRelativeTime(notification.createdAt)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default BudgetSection;
