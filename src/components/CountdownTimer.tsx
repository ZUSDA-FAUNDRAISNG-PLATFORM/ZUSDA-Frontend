import type { CountdownTime } from "@/hooks/useCountdown";

const CountdownTimer = ({ time }: { time: CountdownTime }) => {
  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="grid grid-cols-4 justify-items-center gap-1.5 sm:flex sm:justify-center sm:gap-3 md:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/30 bg-white/90 min-[390px]:h-14 min-[390px]:w-14 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <span className="font-display text-lg font-bold text-navy min-[390px]:text-xl sm:text-2xl md:text-3xl">
              {String(u.value).padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-white/90">{u.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
