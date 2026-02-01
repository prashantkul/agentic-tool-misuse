import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  decisions: { allow: number; warn: number; block: number };
}

export default function DecisionChart({ decisions }: Props) {
  const data = {
    labels: ["Allow", "Warn", "Block"],
    datasets: [
      {
        data: [decisions.allow, decisions.warn, decisions.block],
        backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-violet-600 inline-flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </span>
        Decision Distribution
      </h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}
