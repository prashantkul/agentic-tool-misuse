import type { Decision } from "../../types";

interface VerdictBadgeProps {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<Decision, string> = {
  allow: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  warn: "bg-amber-100 text-amber-700 border border-amber-200",
  block: "bg-red-100 text-red-700 border border-red-200",
};

const sizeMap: Record<string, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export default function VerdictBadge({ decision, size = "md" }: VerdictBadgeProps) {
  return (
    <span
      className={`rounded-full font-semibold ${colorMap[decision]} ${sizeMap[size]}`}
    >
      {decision.toUpperCase()}
    </span>
  );
}
