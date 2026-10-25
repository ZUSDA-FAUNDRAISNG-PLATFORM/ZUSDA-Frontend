export const progressHue = (percent: number) =>
  Math.round((Math.max(0, Math.min(100, percent)) / 100) * 120);
