export default function DaysToGo({ days }: { days: number }) {
  if (days < 0) return null;

  const urgent = days <= 7;
  const text = days === 0 ? "It starts today!" : urgent ? `Only ${days} day${days > 1 ? "s" : ""} left!` : `${days} days to go`;

  return (
    <div className="mb-6 flex justify-center">
      <span
        className={`rounded-full px-5 py-1.5 text-sm font-bold tracking-wide ${
          urgent ? "animate-pulse bg-red-600 text-white" : "border border-white/50 bg-navy/75 text-white shadow-sm"
        }`}
      >
        {text}
      </span>
    </div>
  );
}
