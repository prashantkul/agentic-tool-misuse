"""Orchestrates heuristic rules and LLM judge for trace analysis."""

from __future__ import annotations

from .judge import MisuseJudge
from .models import AnalysisResult, JudgeVerdict, RuleVerdict, Trace
from .rules import run_all_rules


class TraceAnalyzer:
  def __init__(
    self,
    judge: MisuseJudge | None = None,
    skip_judge: bool = False,
    judge_threshold: int = 0,
  ):
    self._judge = judge
    self.skip_judge = skip_judge
    self.judge_threshold = judge_threshold

  @property
  def judge(self) -> MisuseJudge:
    if self._judge is None:
      self._judge = MisuseJudge()
    return self._judge

  def analyze(self, trace: Trace) -> AnalysisResult:
    rule_verdicts = run_all_rules(trace)
    triggered = [rv for rv in rule_verdicts if rv.triggered]

    judge_verdict: JudgeVerdict | None = None
    if not self.skip_judge and len(triggered) >= self.judge_threshold:
      judge_verdict = self.judge.evaluate(trace, rule_verdicts)

    final_decision = _decide(triggered, judge_verdict)

    return AnalysisResult(
      trace_id=trace.trace_id,
      rule_verdicts=rule_verdicts,
      judge_verdict=judge_verdict,
      final_decision=final_decision,
    )


def _decide(
  triggered_rules: list[RuleVerdict],
  judge_verdict: JudgeVerdict | None,
) -> str:
  if judge_verdict is not None:
    if judge_verdict.confidence >= 0.8 and judge_verdict.is_misuse:
      return "block"
    if judge_verdict.is_misuse:
      return "warn"
    if any(rv.severity.value in ("critical", "high") for rv in triggered_rules):
      return "warn"
    return "allow"

  critical = [rv for rv in triggered_rules if rv.severity.value == "critical"]
  if critical:
    return "block"
  if triggered_rules:
    return "warn"
  return "allow"
