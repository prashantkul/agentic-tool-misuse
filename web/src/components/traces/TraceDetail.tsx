import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTraceSummary } from "../../api/client";
import LoadingSpinner from "../shared/LoadingSpinner";
import VerdictBadge from "../shared/VerdictBadge";
import TraceSummary from "./TraceSummary";
import RuleAlertsTable from "./RuleAlertsTable";
import JudgeVerdictPanel from "./JudgeVerdictPanel";

interface Props {
  traceId: string;
  onClose?: () => void;
}

export default function TraceDetail({ traceId, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [taskExpanded, setTaskExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["trace-summary", traceId],
    queryFn: () => getTraceSummary(traceId),
  });

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 200);
  };

  if (onClose) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={handleClose}
        />
        <div
          className={`fixed top-0 right-0 w-[600px] h-full bg-slate-50 shadow-xl border-l border-gray-200 overflow-y-auto z-50 transition-transform duration-200 ${
            visible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <PanelContent
            data={data}
            isLoading={isLoading}
            traceId={traceId}
            taskExpanded={taskExpanded}
            setTaskExpanded={setTaskExpanded}
            onClose={handleClose}
          />
        </div>
      </>
    );
  }

  return (
    <div className="max-w-3xl">
      <PanelContent
        data={data}
        isLoading={isLoading}
        traceId={traceId}
        taskExpanded={taskExpanded}
        setTaskExpanded={setTaskExpanded}
      />
    </div>
  );
}

interface PanelContentProps {
  data: ReturnType<typeof useQuery<Awaited<ReturnType<typeof getTraceSummary>>>>["data"];
  isLoading: boolean;
  traceId: string;
  taskExpanded: boolean;
  setTaskExpanded: (v: boolean) => void;
  onClose?: () => void;
}

function PanelContent({
  data,
  isLoading,
  traceId,
  taskExpanded,
  setTaskExpanded,
  onClose,
}: PanelContentProps) {
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <p className="p-6 text-gray-500">Trace not found.</p>;

  const taskDescription = data.trace.task_description;
  const isLongTask = taskDescription.length > 200;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-mono text-sm text-gray-500 break-all">
            {traceId}
          </h2>
          <div className="mt-2">
            <VerdictBadge decision={data.analysis.final_decision} size="lg" />
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="glass-card rounded-xl p-4 border border-gray-100">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">Metadata</h3>
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Agent:</span> {data.trace.agent_id}
        </p>
        <div className="mt-2">
          <span className="text-sm text-gray-400">Task:</span>
          <p className="text-sm text-gray-600 mt-0.5">
            {isLongTask && !taskExpanded
              ? `${taskDescription.slice(0, 200)}...`
              : taskDescription}
          </p>
          {isLongTask && (
            <button
              onClick={() => setTaskExpanded(!taskExpanded)}
              className="text-xs text-cyan-600 hover:text-cyan-700 mt-1 font-medium transition-colors"
            >
              {taskExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      <TraceSummary summary={data.summary} />

      <div className="glass-card rounded-xl p-4 border border-gray-100">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">
          Rule Alerts
        </h3>
        <RuleAlertsTable verdicts={data.analysis.rule_verdicts} />
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3">
          Judge Verdict
        </h3>
        <JudgeVerdictPanel verdict={data.analysis.judge_verdict} />
      </div>
    </div>
  );
}
