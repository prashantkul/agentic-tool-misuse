import type { TraceResult } from "../../types";
import VerdictBadge from "../shared/VerdictBadge";
import ConfidenceBar from "../shared/ConfidenceBar";

interface Props {
  result: TraceResult;
  selected: boolean;
  onClick: () => void;
}

const borderColorMap = {
  block: "border-red-500",
  warn: "border-amber-500",
  allow: "border-emerald-500",
};

export default function TraceCard({ result, selected, onClick }: Props) {
  const triggeredCount = result.rule_verdicts.filter(
    (rv) => rv.triggered,
  ).length;

  return (
    <div
      onClick={onClick}
      className={`glass-card card-hover rounded-2xl p-5 cursor-pointer border-l-4 ${
        borderColorMap[result.final_decision]
      } ${selected ? "ring-2 ring-cyan-500 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="font-mono text-sm text-gray-800 truncate max-w-[200px]">
          {result.trace_id.length > 30
            ? `${result.trace_id.slice(0, 30)}...`
            : result.trace_id}
        </p>
        <VerdictBadge decision={result.final_decision} />
      </div>

      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
        {result.agent_id}
      </span>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{triggeredCount} rule{triggeredCount !== 1 ? "s" : ""} triggered</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span>{result.tool_call_count} tool calls</span>
      </div>

      {result.judge_verdict && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <ConfidenceBar confidence={result.judge_verdict.confidence} />
        </div>
      )}
    </div>
  );
}
