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
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Decision Distribution</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
}
