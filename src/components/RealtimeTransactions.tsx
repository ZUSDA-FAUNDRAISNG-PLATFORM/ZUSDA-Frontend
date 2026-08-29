import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Clock3,
  Coins,
  Eye,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { getRecentContributions, type ContributionDTO } from "@/api/contributions";
import { ApiError } from "@/api/client";

type FeedStatus = "loading" | "ready" | "error";

type FeedState = {
  transactions: ContributionDTO[];
  status: FeedStatus;
  message: string;
  lastSyncedAt: string;
  retryCount: number;
};

type NotificationItem = {
  id: number;
  donorName: string;
  amount: number;
  createdAt: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  tone: "gold" | "emerald" | "sky";
};

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const GOAL_AMOUNT = 50000;

const getTimeLeft = () => {
  const target = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000 + 21 * 60 * 1000);
  const diffMs = target.getTime() - Date.now();
  const safeDiff = Math.max(0, diffMs);

  return {
    days: Math.floor(safeDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safeDiff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safeDiff / (1000 * 60)) % 60),
  };
};

const formatTime = (timestamp: string | null | undefined) => {
  if (!timestamp) {
    return "Just now";
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - parsed.getTime();
  const seconds = Math.max(0, Math.floor(diffMs / 1000));

  if (seconds < 10) {
    return "Just now";
  }
  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
};

const getInitials = (name?: string | null) => {
  if (!name) {
    return "AN";
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "AN";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getStatusTone = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("pending")) {
    return "border-amber-400/30 bg-amber-400/10 text-amber-200";
  }

  if (normalized.includes("process")) {
    return "border-sky-400/30 bg-sky-400/10 text-sky-200";
  }

  if (normalized.includes("fail") || normalized.includes("decline")) {
    return "border-red-400/30 bg-red-400/10 text-red-200";
  }

  return "border-emerald-400/30 bg-emerald-400/10 text-emerald-200";
};

const getStatusLabel = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("pending")) {
    return "Pending";
  }

  if (normalized.includes("process")) {
    return "Processing";
  }

  if (normalized.includes("fail") || normalized.includes("decline")) {
    return "Failed";
  }

  return "Confirmed";
};

type CountUpValueProps = {
  value: number;
  formatter?: Intl.NumberFormat;
  duration?: number;
  className?: string;
};

const CountUpValue = ({ value, formatter, duration = 900, className }: CountUpValueProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let animationFrame = 0;
    const from = 0;
    const startTime = performance.now();

    const tick = (currentTime: number) => {
      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(from + (value - from) * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, value]);

  return <span className={className}>{formatter ? formatter.format(displayValue) : displayValue.toLocaleString()}</span>;
};

const POLL_INTERVAL_MS = 4000;
const MAX_RETRY_ATTEMPTS = 4;

const RealtimeTransactions = () => {
  const [feedState, setFeedState] = useState<FeedState>({
    transactions: [],
    status: "loading",
    message: "Connecting to the live giving feed...",
    lastSyncedAt: new Date().toISOString(),
    retryCount: 0,
  });
  const [displayRaised, setDisplayRaised] = useState(0);
  const [visitorCount, setVisitorCount] = useState(18);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(getTimeLeft);
  const [copied, setCopied] = useState(false);
  const knownIdsRef = useRef<Set<number>>(new Set());
  const newArrivalIdsRef = useRef<Set<number>>(new Set());
  const previousRaisedRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let pollTimer: number | undefined;
    let retryTimer: number | undefined;

    const loadTransactions = async (attempt = 0) => {
      try {
        const data = await getRecentContributions({ limit: 5 });

        if (!isMounted) {
          return;
        }

        const sortedData = [...data].sort(
          (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
        );

        const seenIds = new Set(sortedData.map((item) => item.id));
        const newlyArrivedIds = sortedData.filter((item) => !knownIdsRef.current.has(item.id)).map((item) => item.id);
        const newTransactions = sortedData.filter((item) => newlyArrivedIds.includes(item.id));
        const nextRaised = sortedData.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        const nextProgress = Math.min(100, Math.round((nextRaised / GOAL_AMOUNT) * 100));
        const lastMilestone = previousRaisedRef.current === 0 ? 0 : Math.round((previousRaisedRef.current / GOAL_AMOUNT) * 100);

        knownIdsRef.current = seenIds;
        newArrivalIdsRef.current = new Set(newlyArrivedIds);
        previousRaisedRef.current = nextRaised;

        const nextActivityItems: ActivityItem[] = [];

        if (newTransactions.length > 0) {
          setNotifications((current) => [
            ...newTransactions.map((transaction) => ({
              id: transaction.id,
              donorName: transaction.donor_name?.trim() || "Anonymous donor",
              amount: Number(transaction.amount),
              createdAt: transaction.created_at,
            })),
            ...current,
          ].slice(0, 3));

          setVisitorCount((current) => current + newTransactions.length);

          nextActivityItems.push(
            ...newTransactions.slice(0, 2).map((transaction) => ({
              id: `txn-${transaction.id}`,
              title: `${transaction.donor_name?.trim() || "Anonymous donor"} donated`,
              detail: `${currencyFormatter.format(Number(transaction.amount))} • ${transaction.status}`,
              timestamp: transaction.created_at,
              tone: "emerald" as const,
            })),
          );

          const milestoneThresholds = [25, 50, 75, 100];
          const crossed = milestoneThresholds.find((threshold) => {
            const previousMilestone = lastMilestone;
            const currentMilestone = nextProgress;
            return previousMilestone < threshold && currentMilestone >= threshold;
          });

          if (crossed) {
            nextActivityItems.push({
              id: `milestone-${crossed}`,
              title: `${crossed}% milestone reached`,
              detail: "Momentum is building",
              timestamp: new Date().toISOString(),
              tone: "gold" as const,
            });
            setCelebration(`${crossed}% milestone reached`);
            window.setTimeout(() => setCelebration(null), 2500);
          }
        }

        setActivityFeed((current) => {
          const merged = [...nextActivityItems, ...current];
          return merged.slice(0, 6);
        });

        setFeedState((current) => ({
          ...current,
          transactions: sortedData,
          status: "ready",
          lastSyncedAt: new Date().toISOString(),
          retryCount: 0,
          message: newlyArrivedIds.length > 0 ? `A new transaction just arrived${newlyArrivedIds.length > 1 ? "s" : ""}.` : "Live updates are active. Refreshing every 4 seconds.",
        }));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const nextRetryCount = attempt + 1;
        const retryDelayMs = Math.min(2000 * nextRetryCount, 10000);
        const errorMessage = error instanceof ApiError ? error.message : "Unable to load live updates.";

        setFeedState((current) => ({
          ...current,
          status: "error",
          message: nextRetryCount >= MAX_RETRY_ATTEMPTS ? `${errorMessage} Reconnect attempts exhausted.` : `${errorMessage} Retrying in ${retryDelayMs / 1000}s...`,
          retryCount: nextRetryCount,
        }));

        if (nextRetryCount < MAX_RETRY_ATTEMPTS) {
          retryTimer = window.setTimeout(() => {
            void loadTransactions(nextRetryCount);
          }, retryDelayMs);
        }
      }
    };

    void loadTransactions();

    pollTimer = window.setInterval(() => {
      if (!isMounted) {
        return;
      }
      void loadTransactions();
    }, POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      if (pollTimer !== undefined) {
        window.clearInterval(pollTimer);
      }
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getTimeLeft());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const nextRaised = feedState.transactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    if (nextRaised === displayRaised) {
      return;
    }

    let animationFrame = 0;
    const from = displayRaised;
    const to = nextRaised;
    const startTime = performance.now();
    const duration = 900;

    const tick = (currentTime: number) => {
      const progress = Math.min(1, (currentTime - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(from + (to - from) * eased);
      setDisplayRaised(currentValue);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [displayRaised, feedState.transactions]);

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const timers = notifications.map((notification) =>
      window.setTimeout(() => {
        setNotifications((current) => current.filter((item) => item.id !== notification.id));
      }, 5000),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [notifications]);

  const sortedTransactions = useMemo(() => {
    return [...feedState.transactions].sort(
      (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    );
  }, [feedState.transactions]);

  const totalRaised = useMemo(() => {
    return sortedTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  }, [sortedTransactions]);

  const latestGift = sortedTransactions[0];
  const totalDonationsToday = sortedTransactions.length;
  const averageDonation = totalDonationsToday > 0 ? Math.round(totalRaised / totalDonationsToday) : 0;
  const largestDonation = sortedTransactions.reduce((largest, transaction) => {
    const current = Number(transaction.amount);
    return current > largest ? current : largest;
  }, 0);
  const progressPercent = Math.min(100, Math.round((totalRaised / GOAL_AMOUNT) * 100));
  const supporters = useMemo(() => {
    const grouped = new Map<string, { name: string; count: number; amount: number }>();

    sortedTransactions.forEach((transaction) => {
      const donorName = transaction.donor_name?.trim() || "Anonymous donor";
      const existing = grouped.get(donorName);

      if (existing) {
        existing.count += 1;
        existing.amount += Number(transaction.amount);
        return;
      }

      grouped.set(donorName, {
        name: donorName,
        count: 1,
        amount: Number(transaction.amount),
      });
    });

    return Array.from(grouped.values())
      .sort((left, right) => right.amount - left.amount || right.count - left.count)
      .slice(0, 6);
  }, [sortedTransactions]);

  const chartPoints = useMemo(() => {
    const values = sortedTransactions.length > 0 ? sortedTransactions.map((transaction) => Number(transaction.amount)) : [0, 0, 0, 0, 0];
    const maxValue = Math.max(...values, 1);
    return values
      .map((value, index) => {
        const x = 8 + index * 18;
        const y = 80 - (value / maxValue) * 60;
        return `${x},${y}`;
      })
      .join(" ");
  }, [sortedTransactions]);

  const summaryCards = useMemo(() => {
    return [
      {
        label: "Total raised",
        value: currencyFormatter.format(displayRaised),
        detail: latestGift ? `${latestGift.donor_name?.trim() || "Anonymous supporter"} just contributed` : "Awaiting first gift",
      },
      {
        label: "Today",
        value: currencyFormatter.format(totalRaised),
        detail: `${totalDonationsToday} live contributions in view`,
      },
      {
        label: "Last synced",
        value: formatTime(feedState.lastSyncedAt),
        detail: feedState.status === "error" ? `Retrying ${feedState.retryCount}/${MAX_RETRY_ATTEMPTS}` : "Live data is being refreshed",
      },
    ];
  }, [displayRaised, feedState.lastSyncedAt, feedState.retryCount, feedState.status, latestGift, totalDonationsToday, totalRaised]);

  const remainingGoal = Math.max(GOAL_AMOUNT - totalRaised, 0);

  const handleCopyPaybill = async () => {
    try {
      await navigator.clipboard.writeText("247247");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  const confettiPieces = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    left: `${8 + (index % 6) * 14}%`,
    color: index % 2 === 0 ? "#f5c559" : "#fde68a",
    delay: index * 0.04,
  }));

  return (
    <section className="bg-primary-foreground/5 py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-navy p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,197,89,0.18),transparent_40%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-gold">
                <Activity className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Live transaction updates</p>
              </div>
              <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
                Real-time updates from the mission fund
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/70">
                Every new support gift is reflected here as soon as it lands in the system.
              </p>
              <div className="mt-4 rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold">
                Thank you for every act of generosity—your support is helping this mission move forward.
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-gold/20 bg-primary-foreground/5 px-4 py-2 text-sm text-primary-foreground/70">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-semibold text-gold">LIVE</span>
              <span>{feedState.message}</span>
            </div>
          </div>

          <div className="relative mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-gold/30 bg-gradient-to-br from-gold/20 via-navy/80 to-primary-foreground/5 p-6 shadow-2xl shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Mission goal</p>
                  <div className="mt-3 flex items-end gap-2">
                    <p className="text-4xl font-semibold text-primary-foreground">
                      <CountUpValue value={displayRaised} formatter={currencyFormatter} />
                    </p>
                    <span className="mb-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      +{currencyFormatter.format(Math.max(totalRaised - 10000, 0))} today
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-primary-foreground/70">{Math.round((displayRaised / GOAL_AMOUNT) * 100)}% complete</p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-primary-foreground/5 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Remaining</p>
                  <p className="mt-1 text-xl font-semibold text-gold">{currencyFormatter.format(remainingGoal)}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1">
              {summaryCards.map((card) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-gold/20 bg-navy/80 p-4 shadow-lg shadow-black/10"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">{card.label}</p>
                  <p className="mt-3 text-xl font-semibold text-primary-foreground">{card.value}</p>
                  <p className="mt-1 text-sm text-primary-foreground/60">{card.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 24, y: -12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 24, y: -12 }}
                className="absolute right-4 top-28 z-10 w-64 rounded-2xl border border-gold/20 bg-navy/95 p-4 shadow-2xl shadow-black/30"
              >
                <div className="flex items-center gap-2 text-gold">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">New donation</p>
                </div>
                <p className="mt-3 text-lg font-semibold text-primary-foreground">{notification.donorName}</p>
                <p className="mt-1 text-sm text-primary-foreground/70">{currencyFormatter.format(notification.amount)}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-primary-foreground/50">{formatTime(notification.createdAt)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Mission progress</p>
                  <h3 className="mt-2 text-2xl font-semibold text-primary-foreground">Goal journey</h3>
                </div>
                <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  {progressPercent}% funded
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                <div className="flex items-center justify-between text-sm text-primary-foreground/60">
                  <span>Raised</span>
                  <span>{currencyFormatter.format(displayRaised)} of {currencyFormatter.format(GOAL_AMOUNT)}</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-primary-foreground/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-gold via-gold-light to-emerald-400"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-primary-foreground/50">
                  {[0, 25, 50, 75, 100].map((step) => (
                    <span key={step} className={step <= progressPercent ? "text-gold" : ""}>
                      {step}%
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-2xl border border-gold/10 bg-navy/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Raised</p>
                    <p className="mt-1 font-semibold text-primary-foreground">{currencyFormatter.format(displayRaised)}</p>
                  </div>
                  <div className="rounded-2xl border border-gold/10 bg-navy/60 p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">Remaining</p>
                    <p className="mt-1 font-semibold text-gold">{currencyFormatter.format(remainingGoal)}</p>
                  </div>
                </div>
              </div>

              {celebration && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="relative mt-4 overflow-hidden rounded-2xl border border-gold/20 bg-gold/10 px-4 py-3 text-sm text-gold"
                >
                  <div className="pointer-events-none absolute inset-0">
                    {confettiPieces.map((piece) => (
                      <motion.span
                        key={piece.id}
                        initial={{ opacity: 0, y: -10, scale: 0.7 }}
                        animate={{ opacity: [0, 1, 0], y: [0, 110], x: [0, piece.id % 2 === 0 ? 48 : -48], rotate: [0, 360] }}
                        transition={{ duration: 1.1, delay: piece.delay, ease: "easeOut" }}
                        className="absolute top-0 h-2.5 w-2.5 rounded-full"
                        style={{ left: piece.left, backgroundColor: piece.color }}
                      />
                    ))}
                  </div>
                  <div className="relative">{celebration}</div>
                </motion.div>
              )}
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-primary-foreground">Live donations</h3>
                  <p className="mt-1 text-sm text-primary-foreground/60">Newest gifts appear at the top with a golden glow.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-sm text-gold">
                  <Zap className="h-4 w-4" />
                  Live
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {feedState.status === "loading" ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="animate-pulse rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                        <div className="h-4 w-24 rounded bg-primary-foreground/10" />
                        <div className="mt-3 h-3 w-32 rounded bg-primary-foreground/10" />
                      </div>
                    ))}
                  </div>
                ) : sortedTransactions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gold/20 bg-primary-foreground/5 p-6 text-center text-primary-foreground/70">
                    No donations have arrived yet. The stream will light up once support is submitted.
                  </div>
                ) : (
                  sortedTransactions.map((transaction, index) => {
                    const isNewArrival = newArrivalIdsRef.current.has(transaction.id);
                    const isLatest = index === 0;

                    return (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:border-gold/30 hover:bg-primary-foreground/10 ${isLatest ? "border-gold/40 bg-gold/10 shadow-lg shadow-gold/10" : "border-gold/10 bg-primary-foreground/5"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-navy/70 text-sm font-semibold text-gold">
                              {getInitials(transaction.donor_name)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-primary-foreground">
                                  {transaction.donor_name?.trim() || "Anonymous donor"}
                                </p>
                                <AnimatePresence mode="wait">
                                  {isNewArrival && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.9 }}
                                      className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold"
                                    >
                                      New
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                              <p className="mt-1 text-sm text-primary-foreground/60">{formatTime(transaction.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gold">{currencyFormatter.format(Number(transaction.amount))}</p>
                            <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusTone(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-gold/15 to-primary-foreground/5 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-3 text-gold">
                <HeartHandshake className="h-5 w-5" />
                <h3 className="text-xl font-semibold text-primary-foreground">Today’s pulse</h3>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Coins className="h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Raised today</p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-primary-foreground">{currencyFormatter.format(totalRaised)}</p>
                </div>
                <div className="rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <Users className="h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Donations</p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-primary-foreground">{totalDonationsToday}</p>
                </div>
                <div className="rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <TrendingUp className="h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Average</p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-primary-foreground">{currencyFormatter.format(averageDonation)}</p>
                </div>
                <div className="rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                  <div className="flex items-center gap-2 text-gold">
                    <BadgeCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold uppercase tracking-[0.2em]">Largest</p>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-primary-foreground">{currencyFormatter.format(largestDonation)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-primary-foreground">Live visitors</h3>
                  <p className="mt-1 text-sm text-primary-foreground/60">The page feels active while donors arrive.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-sm text-gold">
                  <Eye className="h-4 w-4" />
                  {visitorCount}
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-gold/10 bg-primary-foreground/5 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-sm text-primary-foreground/60">Watching now</p>
                    <p className="mt-2 text-3xl font-semibold text-primary-foreground">{visitorCount}</p>
                  </div>
                  <div className="text-right text-sm text-primary-foreground/60">
                    <p>+{sortedTransactions.length} new</p>
                    <p className="mt-1 text-gold">Momentum is building</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-primary-foreground/70">
                  <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-300">{Math.max(totalDonationsToday, 1)} gifts today</span>
                  <span className="rounded-full bg-gold/10 px-2 py-1 text-gold">⏱ avg every {Math.max(6, 12 - totalDonationsToday)} mins</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-gold">
                <Clock3 className="h-4 w-4" />
                <h3 className="text-xl font-semibold text-primary-foreground">Mission ends</h3>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Mins", value: countdown.minutes },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-gold/10 bg-primary-foreground/5 p-3">
                    <p className="text-xl font-semibold text-primary-foreground">{item.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-gold">
                <Activity className="h-4 w-4" />
                <h3 className="text-xl font-semibold text-primary-foreground">Live activity</h3>
              </div>
              <div className="mt-5 space-y-2">
                {activityFeed.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gold/20 bg-primary-foreground/5 px-3 py-4 text-sm text-primary-foreground/70">
                    Activity will appear here as the campaign moves.
                  </div>
                ) : (
                  activityFeed.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gold/10 bg-primary-foreground/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-primary-foreground">{item.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${item.tone === "gold" ? "border-gold/30 bg-gold/10 text-gold" : item.tone === "sky" ? "border-sky-400/30 bg-sky-400/10 text-sky-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"}`}>
                          Live
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-primary-foreground/60">{item.detail}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/50">{formatTime(item.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-gold">
                <Clock3 className="h-4 w-4" />
                <h3 className="text-xl font-semibold text-primary-foreground">Supporters wall</h3>
              </div>
              <div className="mt-5 overflow-x-auto pb-2">
                {supporters.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gold/20 bg-primary-foreground/5 px-3 py-4 text-sm text-primary-foreground/70">
                    The first supporters will appear here as gifts come in.
                  </div>
                ) : (
                  <div className="flex min-w-max gap-3">
                    {supporters.map((supporter, index) => (
                      <div
                        key={`${supporter.name}-${index}`}
                        className="w-36 shrink-0 rounded-2xl border border-gold/10 bg-primary-foreground/5 p-3 text-center text-sm text-primary-foreground/70 transition-all hover:border-gold/30 hover:bg-gold/10"
                      >
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-navy/70 text-sm font-semibold text-gold">
                          {getInitials(supporter.name)}
                        </div>
                        <p className="mt-3 font-semibold text-primary-foreground">{supporter.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
                          {supporter.count > 1 ? `${supporter.count} gifts` : "First gift"}
                        </p>
                        <p className="mt-2 font-semibold text-gold">{currencyFormatter.format(supporter.amount)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-gold/20 bg-navy/85 p-6 shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-gold">
                <TrendingUp className="h-4 w-4" />
                <h3 className="text-xl font-semibold text-primary-foreground">Trend</h3>
              </div>
              <svg viewBox="0 0 100 90" className="mt-5 h-32 w-full">
                <line x1="8" y1="80" x2="92" y2="80" stroke="rgba(245,197,89,0.25)" strokeWidth="1" />
                <polyline
                  fill="none"
                  stroke="#f5c559"
                  strokeWidth="2.5"
                  points={chartPoints}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
        <button
          onClick={handleCopyPaybill}
          className="flex w-full items-center justify-between rounded-2xl border border-gold/30 bg-navy/95 px-4 py-3 text-left shadow-2xl shadow-black/30"
        >
          <div>
            <p className="text-sm font-semibold text-primary-foreground">Donate now</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Paybill 247247 • Account 593021</p>
          </div>
          <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
            {copied ? "Copied" : "Copy"}
          </span>
        </button>
      </div>
    </section>
  );
};

export default RealtimeTransactions;