import type { Severity } from "../../types";

interface SeverityBadgeProps {
  severity: Severity;
}

const colorMap: Record<Severity, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-blue-100 text-blue-800",
  none: "bg-gray-100 text-gray-600",
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`rounded-full text-xs px-2 py-0.5 font-medium ${colorMap[severity]}`}
    >
      {capitalize(severity)}
    </span>
  );
}
