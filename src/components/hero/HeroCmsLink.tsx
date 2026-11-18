import { Link } from "react-router-dom";
import { useInvolvement } from "@/components/InvolvementDialogs";

type HeroCmsLinkProps = {
  label: string;
  href: string;
  className?: string;
  variant?: "button" | "link";
};

/** Resolves CMS-configured hero CTAs (give/pray shortcuts, routes, hashes, external). */
export function HeroCmsLink({ label, href, className }: HeroCmsLinkProps) {
  const { open } = useInvolvement();
  const text = label.trim();
  const trimmed = href.trim();
  if (!text) return null;

  const lower = trimmed.toLowerCase();

  if (lower === "give" || lower.startsWith("/give")) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => open("give", { mode: lower.includes("campaign") ? "campaign" : "general" })}
      >
        {text}
      </button>
    );
  }

  if (lower === "pray" || lower === "#pray") {
    return (
      <button type="button" className={className} onClick={() => open("pray")}>
        {text}
      </button>
    );
  }

  if (!trimmed) {
    return (
      <span className={className} aria-disabled="true">
        {text}
      </span>
    );
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return (
      <a href={trimmed} className={className} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    );
  }

  if (trimmed.startsWith("#")) {
    return (
      <a href={trimmed} className={className}>
        {text}
      </a>
    );
  }

  return (
    <Link to={trimmed.startsWith("/") ? trimmed : `/${trimmed}`} className={className}>
      {text}
    </Link>
  );
}

export default HeroCmsLink;
