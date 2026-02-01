import type { StatsData } from "../../types";

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
      percentage: null,
      color: "text-gray-800",
    },
    {
      label: "Blocked",
      value: decisions.block,
      percentage: pct(decisions.block),
      color: "text-red-600",
    },
    {
      label: "Warned",
      value: decisions.warn,
      percentage: pct(decisions.warn),
      color: "text-yellow-600",
    },
    {
      label: "Allowed",
      value: decisions.allow,
      percentage: pct(decisions.allow),
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className={`text-3xl font-bold ${card.color}`}>
            {card.value}
            {card.percentage !== null && (
              <span className="text-sm font-normal text-gray-400 ml-1">
                ({card.percentage}%)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
