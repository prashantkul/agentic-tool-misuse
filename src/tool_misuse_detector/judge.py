"""LLM-as-judge for evaluating tool call traces."""

from __future__ import annotations

import anthropic

from .models import JudgeVerdict, RuleVerdict, Trace
from .prompts import JUDGE_SYSTEM_PROMPT, VERDICT_TOOL, build_judge_messages
from .settings import settings


class MisuseJudge:
  def __init__(
    self,
    model: str | None = None,
    max_tokens: int | None = None,
    api_key: str | None = None,
  ):
    key = api_key or settings.anthropic_api_key
    self.client = anthropic.Anthropic(api_key=key) if key else anthropic.Anthropic()
    self.model = model or settings.judge_model
    self.max_tokens = max_tokens or settings.judge_max_tokens

  def evaluate(
    self,
    trace: Trace,
    rule_verdicts: list[RuleVerdict] | None = None,
  ) -> JudgeVerdict:
    """Evaluate a trace for tool misuse using Claude as judge."""
    messages = build_judge_messages(trace, rule_verdicts)

    response = self.client.messages.create(
      model=self.model,
      max_tokens=self.max_tokens,
      system=JUDGE_SYSTEM_PROMPT,
      messages=messages,
      tools=[VERDICT_TOOL],
      tool_choice={"type": "tool", "name": "submit_verdict"},
    )

    for block in response.content:
      if block.type == "tool_use" and block.name == "submit_verdict":
        return JudgeVerdict.model_validate(block.input)

    raise ValueError("Judge did not return a structured verdict")
