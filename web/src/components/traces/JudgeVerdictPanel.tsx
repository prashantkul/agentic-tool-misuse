import type { JudgeVerdict } from "../../types";
import CategoryBadge from "../shared/CategoryBadge";
import SeverityBadge from "../shared/SeverityBadge";
import ConfidenceBar from "../shared/ConfidenceBar";

interface Props {
  verdict: JudgeVerdict | null;
}

const actionStyles: Record<string, string> = {
  block: "bg-red-100 text-red-700 border border-red-200",
  warn: "bg-amber-100 text-amber-700 border border-amber-200",
  allow: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  review: "bg-blue-100 text-blue-700 border border-blue-200",
};

export default function JudgeVerdictPanel({ verdict }: Props) {
  if (!verdict) {
    return (
      <div className="glass-card rounded-xl p-5 border border-gray-200">
        <p className="text-sm text-gray-500">Judge not invoked.</p>
      </div>
    );
  }

  const actionColor =
    actionStyles[verdict.recommended_action.toLowerCase()] ??
    "bg-gray-100 text-gray-700 border border-gray-200";

  return (
    <div className="glass-card rounded-xl p-5 border-2 border-violet-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-violet-900">
          AI Judge Verdict
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Misuse:</span>
          {verdict.is_misuse ? (
            <span className="text-red-600 font-bold text-sm">YES</span>
          ) : (
            <span className="text-emerald-600 font-bold text-sm">NO</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <CategoryBadge category={verdict.category} />
          <SeverityBadge severity={verdict.severity} />
        </div>

        <div className="bg-slate-50 rounded-lg p-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-2">Confidence</span>
          <ConfidenceBar confidence={verdict.confidence} />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-1">Explanation</span>
          <p className="text-sm text-gray-700 leading-relaxed">{verdict.explanation}</p>
        </div>

        {verdict.evidence.length > 0 && (
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-1">Evidence</span>
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
          <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 block mb-1">
            Recommended Action
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${actionColor}`}
          >
            {verdict.recommended_action}
          </span>
        </div>
      </div>
    </div>
  );
}
