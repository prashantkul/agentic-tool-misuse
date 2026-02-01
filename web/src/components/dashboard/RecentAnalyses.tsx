import { Link } from "react-router-dom";
import type { StatsData } from "../../types";
import VerdictBadge from "../shared/VerdictBadge";

interface Props {
  analyses: StatsData["recent_analyses"];
}

export default function RecentAnalyses({ analyses }: Props) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-cyan-600 inline-flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Recent Analyses
        </h3>
        <p className="text-gray-400 text-sm">No analyses yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded bg-gradient-to-br from-cyan-500 to-cyan-600 inline-flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        Recent Analyses
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Trace ID</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Agent</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Decision</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Category</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-gray-400 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr
                key={analysis.trace_id}
                className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3">
                  <Link
                    to={`/traces/${encodeURIComponent(analysis.trace_id)}`}
                    className="font-mono text-blue-600 hover:text-blue-800"
                  >
                    {analysis.trace_id.length > 20
                      ? `${analysis.trace_id.slice(0, 20)}...`
                      : analysis.trace_id}
                  </Link>
                </td>
                <td className="py-3 text-gray-700">{analysis.agent_id}</td>
                <td className="py-3">
                  <VerdictBadge decision={analysis.final_decision} />
                </td>
                <td className="py-3 text-gray-600">
                  {analysis.category ?? "N/A"}
                </td>
                <td className="py-3 text-gray-500">
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
