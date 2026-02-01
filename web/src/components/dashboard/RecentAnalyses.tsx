import { Link } from "react-router-dom";
import type { StatsData } from "../../types";
import VerdictBadge from "../shared/VerdictBadge";

interface Props {
  analyses: StatsData["recent_analyses"];
}

export default function RecentAnalyses({ analyses }: Props) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
        <p className="text-gray-400 text-sm">No analyses yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="pb-2 font-medium">Trace ID</th>
              <th className="pb-2 font-medium">Agent</th>
              <th className="pb-2 font-medium">Decision</th>
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr
                key={analysis.trace_id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-2">
                  <Link
                    to={`/traces/${encodeURIComponent(analysis.trace_id)}`}
                    className="font-mono text-blue-600 hover:text-blue-800"
                  >
                    {analysis.trace_id.length > 20
                      ? `${analysis.trace_id.slice(0, 20)}...`
                      : analysis.trace_id}
                  </Link>
                </td>
                <td className="py-2 text-gray-700">{analysis.agent_id}</td>
                <td className="py-2">
                  <VerdictBadge decision={analysis.final_decision} />
                </td>
                <td className="py-2 text-gray-600">
                  {analysis.category ?? "N/A"}
                </td>
                <td className="py-2 text-gray-500">
                  {new Date(analysis.analyzed_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
