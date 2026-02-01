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
  warn: "border-yellow-500",
  allow: "border-green-500",
};

export default function TraceCard({ result, selected, onClick }: Props) {
  const triggeredCount = result.rule_verdicts.filter(
    (rv) => rv.triggered,
  ).length;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all border-l-4 ${
        borderColorMap[result.final_decision]
      } ${selected ? "ring-2 ring-blue-500" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-mono text-sm text-gray-800 truncate max-w-[200px]">
          {result.trace_id.length > 30
            ? `${result.trace_id.slice(0, 30)}...`
            : result.trace_id}
        </p>
        <VerdictBadge decision={result.final_decision} />
      </div>

      <p className="text-xs text-gray-500 mb-2">{result.agent_id}</p>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{triggeredCount} rule{triggeredCount !== 1 ? "s" : ""} triggered</span>
        <span>{result.tool_call_count} tool calls</span>
      </div>

      {result.judge_verdict && (
        <div className="mt-2">
          <ConfidenceBar confidence={result.judge_verdict.confidence} />
        </div>
      )}
    </div>
  );
}
