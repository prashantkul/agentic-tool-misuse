import type { JudgeVerdict } from "../../types";
import CategoryBadge from "../shared/CategoryBadge";
import SeverityBadge from "../shared/SeverityBadge";
import ConfidenceBar from "../shared/ConfidenceBar";

interface Props {
  verdict: JudgeVerdict | null;
}

const actionStyles: Record<string, string> = {
  block: "bg-red-100 text-red-700",
  warn: "bg-yellow-100 text-yellow-700",
  allow: "bg-green-100 text-green-700",
  review: "bg-blue-100 text-blue-700",
};

export default function JudgeVerdictPanel({ verdict }: Props) {
  if (!verdict) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500">Judge not invoked.</p>
      </div>
    );
  }

  const actionColor =
    actionStyles[verdict.recommended_action.toLowerCase()] ??
    "bg-gray-100 text-gray-700";

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-purple-200">
        <h3 className="text-lg font-semibold text-purple-900">
          LLM Judge Verdict
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Misuse:</span>
          {verdict.is_misuse ? (
            <span className="text-red-600 font-bold">YES</span>
          ) : (
            <span className="text-green-600 font-bold">NO</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CategoryBadge category={verdict.category} />
          <SeverityBadge severity={verdict.severity} />
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1">Confidence</span>
          <ConfidenceBar confidence={verdict.confidence} />
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1">Explanation</span>
          <p className="text-sm text-gray-700">{verdict.explanation}</p>
        </div>

        {verdict.evidence.length > 0 && (
          <div>
            <span className="text-xs text-gray-500 block mb-1">Evidence</span>
            <ul className="list-disc list-inside space-y-1">
              {verdict.evidence.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-600">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <span className="text-xs text-gray-500 block mb-1">
            Recommended Action
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${actionColor}`}
          >
            {verdict.recommended_action}
          </span>
        </div>
      </div>
    </div>
  );
}
