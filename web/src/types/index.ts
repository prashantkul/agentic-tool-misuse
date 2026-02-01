export type MisuseCategory =
  | "data_exfiltration"
  | "unauthorized_file_access"
  | "destructive_command"
  | "prompt_injection_compliance"
  | "obfuscated_exfiltration"
  | "privilege_escalation"
  | "none";

export type Severity = "critical" | "high" | "medium" | "low" | "none";
export type Decision = "allow" | "warn" | "block";

export interface ToolCall {
  tool_call_id: string;
  tool_name: string;
  input: Record<string, unknown>;
  output: string | null;
  timestamp: string;
  reasoning: string | null;
}

export interface Trace {
  trace_id: string;
  agent_id: string;
  task_description: string;
  tool_calls: ToolCall[];
  metadata: Record<string, unknown>;
}

export interface RuleVerdict {
  rule_name: string;
  triggered: boolean;
  category: MisuseCategory;
  severity: Severity;
  details: string;
}

export interface JudgeVerdict {
  is_misuse: boolean;
  category: MisuseCategory;
  severity: Severity;
  confidence: number;
  explanation: string;
  evidence: string[];
  recommended_action: string;
}

export interface AnalysisResult {
  trace_id: string;
  rule_verdicts: RuleVerdict[];
  judge_verdict: JudgeVerdict | null;
  final_decision: Decision;
  analyzed_at: string;
}

export interface TraceResult extends AnalysisResult {
  agent_id: string;
  task_description: string;
  tool_call_count: number;
}

export interface CollectionInfo {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  agent_run_count?: number;
}

export interface CollectionResults {
  collection_id: string;
  status: "pending" | "running" | "completed" | "failed";
  total_count: number;
  analyzed_count: number;
  results: TraceResult[];
  error: string | null;
}

export interface StatsData {
  total_traces: number;
  decisions: { allow: number; warn: number; block: number };
  categories: Record<string, number>;
  severities: Record<string, number>;
  avg_confidence: number | null;
  collections_analyzed: number;
  recent_analyses: Array<{
    trace_id: string;
    agent_id: string;
    final_decision: Decision;
    analyzed_at: string;
    category: string | null;
  }>;
}

export interface TraceSummaryData {
  trace_id: string;
  summary: string;
  trace: Trace;
  analysis: AnalysisResult;
}

export interface FilterState {
  decisions: Decision[];
  categories: MisuseCategory[];
  severities: Severity[];
  search: string;
}
