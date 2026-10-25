import { useEffect, useState } from "react";

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateCountdown(targetDate: string): CountdownTime {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

export function useCountdown(targetDate: string): CountdownTime {
  const [time, setTime] = useState(() => calculateCountdown(targetDate));

  useEffect(() => {
    setTime(calculateCountdown(targetDate));
    const id = setInterval(() => setTime(calculateCountdown(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}
