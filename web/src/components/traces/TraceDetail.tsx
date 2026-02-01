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
          className="fixed inset-0 bg-black/20 z-40"
          onClick={handleClose}
        />
        <div
          className={`fixed top-0 right-0 w-[600px] h-full bg-white shadow-xl border-l overflow-y-auto z-50 transition-transform duration-200 ${
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
          <h2 className="font-mono text-sm text-gray-600 break-all">
            {traceId}
          </h2>
          <div className="mt-2">
            <VerdictBadge decision={data.analysis.final_decision} size="lg" />
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">Metadata</h3>
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Agent:</span> {data.trace.agent_id}
        </p>
        <div className="mt-1">
          <span className="text-sm text-gray-400">Task:</span>
          <p className="text-sm text-gray-600 mt-0.5">
            {isLongTask && !taskExpanded
              ? `${taskDescription.slice(0, 200)}...`
              : taskDescription}
          </p>
          {isLongTask && (
            <button
              onClick={() => setTaskExpanded(!taskExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              {taskExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>

      <TraceSummary summary={data.summary} />

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Rule Alerts
        </h3>
        <RuleAlertsTable verdicts={data.analysis.rule_verdicts} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Judge Verdict
        </h3>
        <JudgeVerdictPanel verdict={data.analysis.judge_verdict} />
      </div>
    </div>
  );
}
