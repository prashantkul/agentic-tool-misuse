"""Tests for Pydantic data models."""

import json
from pathlib import Path

import pytest

from tool_misuse_detector.models import (
  AnalysisResult,
  JudgeVerdict,
  MisuseCategory,
  RuleVerdict,
  Severity,
  ToolCall,
  Trace,
)

TRACES_DIR = Path(__file__).parent.parent / "traces"


def test_tool_call_round_trip():
  tc = ToolCall(
    tool_call_id="tc-001",
    tool_name="file_read",
    input={"path": "src/main.py"},
    output="print('hello')",
    reasoning="Reading the main file",
  )
  data = tc.model_dump(mode="json")
  restored = ToolCall.model_validate(data)
  assert restored.tool_call_id == tc.tool_call_id
  assert restored.tool_name == tc.tool_name
  assert restored.input == tc.input


def test_trace_round_trip():
  trace = Trace(
    trace_id="t-001",
    agent_id="agent-1",
    task_description="Write hello world",
    tool_calls=[
      ToolCall(
        tool_call_id="tc-001",
        tool_name="file_write",
        input={"path": "main.py", "content": "print('hello')"},
      )
    ],
  )
  data = trace.model_dump(mode="json")
  restored = Trace.model_validate(data)
  assert restored.trace_id == trace.trace_id
  assert len(restored.tool_calls) == 1


def test_judge_verdict_confidence_bounds():
  with pytest.raises(ValueError):
    JudgeVerdict(
      is_misuse=True,
      category=MisuseCategory.NONE,
      severity=Severity.NONE,
      confidence=1.5,
      explanation="test",
      recommended_action="allow",
    )


def test_judge_verdict_valid():
  jv = JudgeVerdict(
    is_misuse=True,
    category=MisuseCategory.DATA_EXFILTRATION,
    severity=Severity.CRITICAL,
    confidence=0.95,
    explanation="Exfiltration detected",
    evidence=["tc-001", "tc-002"],
    recommended_action="block",
  )
  assert jv.confidence == 0.95
  assert jv.is_misuse is True


@pytest.mark.parametrize(
  "subdir",
  ["benign", "malicious"],
)
def test_sample_traces_parse(subdir: str):
  trace_dir = TRACES_DIR / subdir
  if not trace_dir.exists():
    pytest.skip(f"Trace directory {trace_dir} not found")
  files = sorted(trace_dir.glob("*.json"))
  assert len(files) > 0, f"No JSON files in {trace_dir}"
  for f in files:
    data = json.loads(f.read_text())
    trace = Trace.model_validate(data)
    assert trace.trace_id
    assert len(trace.tool_calls) > 0


def test_analysis_result_serialization():
  result = AnalysisResult(
    trace_id="t-001",
    rule_verdicts=[
      RuleVerdict(
        rule_name="test_rule",
        triggered=True,
        category=MisuseCategory.DESTRUCTIVE_COMMAND,
        severity=Severity.HIGH,
        details="test detail",
      )
    ],
    final_decision="warn",
  )
  data = result.model_dump(mode="json")
  assert data["final_decision"] == "warn"
  assert len(data["rule_verdicts"]) == 1
