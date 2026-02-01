import type { RuleVerdict } from "../../types";
import CategoryBadge from "../shared/CategoryBadge";
import SeverityBadge from "../shared/SeverityBadge";

interface Props {
  verdicts: RuleVerdict[];
}

export default function RuleAlertsTable({ verdicts }: Props) {
  const triggered = verdicts.filter((v) => v.triggered);

  if (triggered.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-sm font-medium text-emerald-700">No rules triggered.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold">Rule Name</th>
            <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold">Category</th>
            <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold">Severity</th>
            <th className="px-4 py-2.5 text-left text-xs uppercase tracking-wider text-gray-400 font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
          {triggered.map((verdict, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-2.5 font-medium text-gray-800">
                {verdict.rule_name}
              </td>
              <td className="px-4 py-2.5">
                <CategoryBadge category={verdict.category} />
              </td>
              <td className="px-4 py-2.5">
                <SeverityBadge severity={verdict.severity} />
              </td>
              <td className="px-4 py-2.5 text-sm text-gray-600" title={verdict.details}>
                {verdict.details.length > 100
                  ? `${verdict.details.slice(0, 100)}...`
                  : verdict.details}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
