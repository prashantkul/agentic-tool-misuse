"""Wrapper around the Docent SDK for fetching agent trajectories."""

from __future__ import annotations

from datetime import datetime

from docent import Docent
from docent.data_models.agent_run import AgentRun
from docent.data_models.chat.message import AssistantMessage, ToolMessage, UserMessage
from docent.data_models.transcript import Transcript

from .models import ToolCall, Trace
from .settings import settings


def _make_docent_client(api_key: str | None = None) -> Docent:
  key = api_key or settings.docent_api_key
  if not key:
    raise ValueError("DOCENT_API_KEY is required. Set it in .env or pass explicitly.")
  return Docent(api_key=key)


def list_collections(api_key: str | None = None) -> list[dict]:
  """List all available collections in Docent."""
  client = _make_docent_client(api_key)
  return client.list_collections()


def _extract_tool_calls_from_transcript(transcript: Transcript) -> list[ToolCall]:
  """Extract tool calls from a Docent Transcript's message list."""
  tool_calls: list[ToolCall] = []
  tool_output_map: dict[str, str] = {}

  # First pass: collect all tool outputs by tool_call_id
  for msg in transcript.messages:
    if isinstance(msg, ToolMessage) and msg.tool_call_id:
      content = msg.content
      if isinstance(content, str):
        tool_output_map[msg.tool_call_id] = content
      elif isinstance(content, list):
        texts = []
        for block in content:
          if hasattr(block, "text"):
            texts.append(block.text)
        tool_output_map[msg.tool_call_id] = "\n".join(texts)

  # Second pass: extract tool calls from assistant messages
  for msg in transcript.messages:
    if isinstance(msg, AssistantMessage) and msg.tool_calls:
      # Extract reasoning from assistant content if available
      reasoning = None
      if isinstance(msg.content, str) and msg.content:
        reasoning = msg.content[:500]
      elif isinstance(msg.content, list):
        for block in msg.content:
          if hasattr(block, "text") and block.text:
            reasoning = block.text[:500]
            break

      for tc in msg.tool_calls:
        output = tool_output_map.get(tc.id)
        tool_calls.append(
          ToolCall(
            tool_call_id=tc.id,
            tool_name=tc.function,
            input=tc.arguments,
            output=output,
            reasoning=reasoning,
            timestamp=transcript.created_at or datetime.utcnow(),
          )
        )

  return tool_calls


def _extract_task_from_transcript(transcript: Transcript) -> str:
  """Extract task description from the first UserMessage in a transcript.

  Docent traces from Inspect evals typically have the task in the
  first UserMessage, not in metadata. Truncate to keep it manageable.
  """
  for msg in transcript.messages:
    if isinstance(msg, UserMessage):
      content = msg.content
      if isinstance(content, str):
        text = content
      elif isinstance(content, list):
        texts = []
        for block in content:
          if hasattr(block, "text"):
            texts.append(block.text)
        text = "\n".join(texts)
      else:
        continue
      # Truncate to first 3000 chars — needs to capture endpoint URLs in task
      return text[:3000]
  return ""


def agent_run_to_traces(run: AgentRun) -> list[Trace]:
  """Convert a Docent AgentRun into one or more Trace objects.

  An AgentRun may have multiple transcripts (e.g., multi-turn conversations).
  Each transcript becomes a separate Trace.
  """
  traces: list[Trace] = []
  task_desc = run.metadata.get("task", run.metadata.get("task_description", ""))
  model = run.metadata.get("model", "unknown")

  for transcript in run.transcripts:
    tool_calls = _extract_tool_calls_from_transcript(transcript)
    if not tool_calls:
      continue

    # Use task from metadata; fall back to first UserMessage in transcript
    effective_task = task_desc or _extract_task_from_transcript(transcript)

    traces.append(
      Trace(
        trace_id=f"{run.id}:{transcript.id}",
        agent_id=model,
        task_description=effective_task,
        tool_calls=tool_calls,
        metadata={
          "agent_run_id": run.id,
          "transcript_id": transcript.id,
          "transcript_name": transcript.name or "",
          **{
            k: v for k, v in run.metadata.items() if k not in ("task", "task_description", "model")
          },
        },
      )
    )

  # If no transcripts had tool calls, still create an empty trace for visibility
  if not traces:
    traces.append(
      Trace(
        trace_id=run.id,
        agent_id=model,
        task_description=task_desc,
        tool_calls=[],
        metadata=run.metadata,
      )
    )

  return traces


def fetch_traces(
  collection_id: str,
  api_key: str | None = None,
  limit: int | None = None,
) -> list[Trace]:
  """Fetch agent runs from a Docent collection and convert to Traces."""
  client = _make_docent_client(api_key)
  run_ids = client.list_agent_run_ids(collection_id)

  if limit:
    run_ids = run_ids[:limit]

  traces: list[Trace] = []
  for run_id in run_ids:
    run = client.get_agent_run(collection_id, run_id)
    if run:
      traces.extend(agent_run_to_traces(run))

  return traces
