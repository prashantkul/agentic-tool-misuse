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
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">No rules triggered.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-500">
            <th className="px-4 py-2 font-medium">Rule Name</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Severity</th>
            <th className="px-4 py-2 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {triggered.map((verdict, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-2 font-medium text-gray-800">
                {verdict.rule_name}
              </td>
              <td className="px-4 py-2">
                <CategoryBadge category={verdict.category} />
              </td>
              <td className="px-4 py-2">
                <SeverityBadge severity={verdict.severity} />
              </td>
              <td className="px-4 py-2 text-sm text-gray-600" title={verdict.details}>
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
