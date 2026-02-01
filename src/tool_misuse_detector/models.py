"""Data models for tool call traces, verdicts, and analysis results."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class MisuseCategory(str, Enum):
  DATA_EXFILTRATION = "data_exfiltration"
  UNAUTHORIZED_FILE_ACCESS = "unauthorized_file_access"
  DESTRUCTIVE_COMMAND = "destructive_command"
  PROMPT_INJECTION_COMPLIANCE = "prompt_injection_compliance"
  OBFUSCATED_EXFILTRATION = "obfuscated_exfiltration"
  PRIVILEGE_ESCALATION = "privilege_escalation"
  NONE = "none"


class Severity(str, Enum):
  CRITICAL = "critical"
  HIGH = "high"
  MEDIUM = "medium"
  LOW = "low"
  NONE = "none"


class ToolCall(BaseModel):
  """A single tool invocation within a trace."""

  model_config = ConfigDict(frozen=True)

  tool_call_id: str = Field(description="Unique identifier for this tool call")
  tool_name: str = Field(description="Name of the tool invoked")
  input: dict[str, Any] = Field(description="Arguments passed to the tool")
  output: str | None = Field(
    default=None,
    description="Tool execution result (None if not yet executed)",
  )
  timestamp: datetime = Field(
    default_factory=datetime.utcnow,
    description="When the tool call was made",
  )
  reasoning: str | None = Field(
    default=None,
    description="The agent's stated reasoning for making this call",
  )


class Trace(BaseModel):
  """A sequence of tool calls from an agent session."""

  model_config = ConfigDict(frozen=True)

  trace_id: str
  agent_id: str = Field(default="unknown")
  task_description: str = Field(
    default="",
    description="The original user task the agent was given",
  )
  tool_calls: list[ToolCall]
  metadata: dict[str, Any] = Field(default_factory=dict)


class RuleVerdict(BaseModel):
  """Result from a fast heuristic rule check."""

  rule_name: str
  triggered: bool
  category: MisuseCategory
  severity: Severity
  details: str


class JudgeVerdict(BaseModel):
  """Result from the LLM-as-judge evaluation."""

  is_misuse: bool
  category: MisuseCategory
  severity: Severity
  confidence: float = Field(ge=0.0, le=1.0)
  explanation: str
  evidence: list[str] = Field(
    default_factory=list,
    description="Specific tool calls or patterns that triggered the verdict",
  )
  recommended_action: str = Field(
    default="allow",
    description="One of: allow, warn, block",
  )


class AnalysisResult(BaseModel):
  """Combined result from rules + judge."""

  trace_id: str
  rule_verdicts: list[RuleVerdict]
  judge_verdict: JudgeVerdict | None = None
  final_decision: str = Field(description="allow | warn | block")
  analyzed_at: datetime = Field(default_factory=datetime.utcnow)


# --- Request/Response models for the API ---


class InterceptRequest(BaseModel):
  """Request to evaluate a tool call before execution."""

  session_id: str
  tool_call: ToolCall
  task_description: str = ""
  previous_calls: list[ToolCall] = Field(default_factory=list)


class InterceptResponse(BaseModel):
  """Response to an interception request."""

  decision: str = Field(description="allow | warn | block")
  reason: str = ""
  rule_alerts: list[RuleVerdict] = Field(default_factory=list)
  judge_verdict: JudgeVerdict | None = None


class StartSessionRequest(BaseModel):
  agent_id: str = "unknown"
  task_description: str = ""


class SessionResponse(BaseModel):
  session_id: str
  created_at: datetime


# --- Dashboard API models ---


class CollectionAnalyzeRequest(BaseModel):
  """Request to trigger background analysis of a Docent collection."""

  limit: int | None = None
  rules_only: bool = False


class TraceResult(BaseModel):
  """Enriched analysis result for the dashboard."""

  trace_id: str
  agent_id: str = "unknown"
  task_description: str = ""
  rule_verdicts: list[RuleVerdict] = Field(default_factory=list)
  judge_verdict: JudgeVerdict | None = None
  final_decision: str = "allow"
  analyzed_at: datetime = Field(default_factory=datetime.utcnow)
  tool_call_count: int = 0


class CollectionAnalysisState(BaseModel):
  """Tracks analysis progress for a collection."""

  collection_id: str
  status: str = "pending"  # pending | running | completed | failed
  total_count: int = 0
  analyzed_count: int = 0
  results: list[TraceResult] = Field(default_factory=list)
  traces: list[Trace] = Field(default_factory=list)
  error: str | None = None
  started_at: datetime | None = None
  completed_at: datetime | None = None
