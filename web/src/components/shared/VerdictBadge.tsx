import type { Decision } from "../../types";

interface VerdictBadgeProps {
  decision: Decision;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<Decision, string> = {
  allow: "bg-green-100 text-green-800",
  warn: "bg-yellow-100 text-yellow-800",
  block: "bg-red-100 text-red-800",
};

const sizeMap: Record<string, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export default function VerdictBadge({ decision, size = "md" }: VerdictBadgeProps) {
  return (
    <span
      className={`rounded-full font-medium ${colorMap[decision]} ${sizeMap[size]}`}
    >
      {decision.toUpperCase()}
    </span>
  );
}
