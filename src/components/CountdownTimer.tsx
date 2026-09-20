import { useState, useEffect } from "react";

interface Props {
  targetDate: string;
}

const CountdownTimer = ({ targetDate }: Props) => {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-3 md:gap-5">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-navy/10 bg-white/80 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <span className="font-display text-xl font-bold text-navy sm:text-2xl md:text-3xl">
              {String(u.value).padStart(2, "0")}
            </span>
          </div>
          <span className="mt-2 text-xs uppercase tracking-wide text-navy/60">{u.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
