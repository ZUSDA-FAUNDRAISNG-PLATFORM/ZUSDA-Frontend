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
    <div className="flex justify-center gap-3 md:gap-6">
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <div className="bg-navy/5 backdrop-blur-sm border border-gold/30 rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
            <span className="font-display text-2xl md:text-3xl font-bold text-navy">
              {String(u.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-navy/60 mt-2 uppercase tracking-wider">{u.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
