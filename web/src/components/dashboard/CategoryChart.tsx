import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  categories: Record<string, number>;
}

const categoryColorMap: Record<string, string> = {
  data_exfiltration: "#ef4444",
  unauthorized_file_access: "#f97316",
  destructive_command: "#e11d48",
  prompt_injection_compliance: "#8b5cf6",
  obfuscated_exfiltration: "#ec4899",
  privilege_escalation: "#f59e0b",
};

const categoryLabelMap: Record<string, string> = {
  data_exfiltration: "Data Exfiltration",
  unauthorized_file_access: "Unauthorized Access",
  destructive_command: "Destructive Command",
  prompt_injection_compliance: "Prompt Injection",
  obfuscated_exfiltration: "Obfuscated Exfil",
  privilege_escalation: "Privilege Escalation",
};

export default function CategoryChart({ categories }: Props) {
  const filtered = Object.entries(categories).filter(
    ([key, count]) => key !== "none" && count > 0,
  );

  const labels = filtered.map(
    ([key]) => categoryLabelMap[key] ?? key,
  );
  const values = filtered.map(([, count]) => count);
  const colors = filtered.map(
    ([key]) => categoryColorMap[key] ?? "#6b7280",
  );

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Categories</h3>
      {filtered.length > 0 ? (
        <Bar data={data} options={options} />
      ) : (
        <p className="text-gray-400 text-sm">No categories detected.</p>
      )}
    </div>
  );
}
