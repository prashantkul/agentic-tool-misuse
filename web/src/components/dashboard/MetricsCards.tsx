import type { StatsData } from "../../types";
import { metricCardTooltips } from "../../constants/tooltips";
import Tooltip from "../shared/Tooltip";

interface Props {
  stats: StatsData;
}

export default function MetricsCards({ stats }: Props) {
  const { total_traces, decisions } = stats;

  const pct = (value: number) =>
    total_traces > 0 ? Math.round((value / total_traces) * 100) : 0;

  const cards = [
    {
      label: "Total Traces",
      value: total_traces,
      percentage: null as number | null,
      borderColor: "border-blue-200",
      iconGradient: "from-blue-500 to-blue-600",
      valueColor: "text-blue-700",
      pillBg: "bg-blue-100 text-blue-700",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Blocked",
      value: decisions.block,
      percentage: pct(decisions.block),
      borderColor: "border-red-200",
      iconGradient: "from-red-500 to-red-600",
      valueColor: "text-red-600",
      pillBg: "bg-red-100 text-red-700",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Warned",
      value: decisions.warn,
      percentage: pct(decisions.warn),
      borderColor: "border-amber-200",
      iconGradient: "from-amber-500 to-amber-600",
      valueColor: "text-amber-600",
      pillBg: "bg-amber-100 text-amber-700",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      label: "Allowed",
      value: decisions.allow,
      percentage: pct(decisions.allow),
      borderColor: "border-emerald-200",
      iconGradient: "from-emerald-500 to-emerald-600",
      valueColor: "text-emerald-600",
      pillBg: "bg-emerald-100 text-emerald-700",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`glass-card card-hover rounded-2xl p-6 border-2 ${card.borderColor}`}
        >
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.iconGradient} flex items-center justify-center mb-4`}>
            {card.icon}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-4xl font-bold ${card.valueColor}`}>
              {card.value}
            </span>
            {card.percentage !== null && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.pillBg}`}>
                {card.percentage}%
              </span>
            )}
          </div>
          <Tooltip text={metricCardTooltips[card.label]} position="bottom">
            <span className="text-sm text-gray-500 mt-1 cursor-help border-b border-dashed border-gray-300">
              {card.label}
            </span>
          </Tooltip>
        </div>
      ))}
    </div>
  );
}
