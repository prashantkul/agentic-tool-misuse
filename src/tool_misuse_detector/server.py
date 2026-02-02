"""FastAPI server for real-time tool call interception and analysis."""

from __future__ import annotations

import asyncio
import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .analyzer import TraceAnalyzer
from .cache import AnalysisCache
from .docent_client import fetch_traces, list_collections
from .models import (
  AnalysisResult,
  CollectionAnalysisState,
  CollectionAnalyzeRequest,
  InterceptRequest,
  InterceptResponse,
  SessionResponse,
  StartSessionRequest,
  ToolCall,
  Trace,
  TraceResult,
)
from .settings import settings
from .summarizer import summarize_trace

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
  app.state.analyzer = TraceAnalyzer(skip_judge=False)
  app.state.sessions: dict[str, dict] = {}
  app.state.analysis_tasks: dict[str, asyncio.Task] = {}

  # Initialize disk cache and restore previous analysis results
  disk_cache = AnalysisCache(settings.cache_dir)
  app.state.disk_cache = disk_cache
  app.state.analysis_cache: dict[str, CollectionAnalysisState] = disk_cache.load_all_states()
  logger.info("Restored %d analysis results from disk cache", len(app.state.analysis_cache))

  yield

  disk_cache.close()


app = FastAPI(
  title="Agentic ToolWatch",
  version="0.1.0",
  description="Real-time detection of tool misuse in LLM coding agents",
  lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Existing endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health():
  return {"status": "ok"}


@app.post("/session/start", response_model=SessionResponse)
async def start_session(request: StartSessionRequest):
  session_id = str(uuid.uuid4())
  app.state.sessions[session_id] = {
    "agent_id": request.agent_id,
    "task_description": request.task_description,
    "tool_calls": [],
    "created_at": datetime.utcnow(),
  }
  return SessionResponse(
    session_id=session_id,
    created_at=app.state.sessions[session_id]["created_at"],
  )


@app.post("/session/{session_id}/append")
async def append_tool_call(session_id: str, tool_call: ToolCall):
  if session_id not in app.state.sessions:
    raise HTTPException(status_code=404, detail="Session not found")
  app.state.sessions[session_id]["tool_calls"].append(tool_call)
  return {"status": "appended", "total_calls": len(app.state.sessions[session_id]["tool_calls"])}


@app.get("/session/{session_id}/status", response_model=AnalysisResult)
async def session_status(session_id: str):
  if session_id not in app.state.sessions:
    raise HTTPException(status_code=404, detail="Session not found")
  session = app.state.sessions[session_id]
  trace = Trace(
    trace_id=session_id,
    agent_id=session["agent_id"],
    task_description=session["task_description"],
    tool_calls=session["tool_calls"],
  )
  analyzer: TraceAnalyzer = app.state.analyzer
  return analyzer.analyze(trace)


@app.post("/intercept", response_model=InterceptResponse)
async def intercept_tool_call(request: InterceptRequest):
  """Evaluate a tool call in context of previous calls. Returns allow/warn/block."""
  all_calls = list(request.previous_calls) + [request.tool_call]
  trace = Trace(
    trace_id=request.session_id,
    task_description=request.task_description,
    tool_calls=all_calls,
  )
  analyzer: TraceAnalyzer = app.state.analyzer
  result = analyzer.analyze(trace)
  return InterceptResponse(
    decision=result.final_decision,
    reason=result.judge_verdict.explanation if result.judge_verdict else "",
    rule_alerts=[rv for rv in result.rule_verdicts if rv.triggered],
    judge_verdict=result.judge_verdict,
  )


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_trace(trace: Trace):
  """Analyze a complete trace (post-hoc via API)."""
  analyzer: TraceAnalyzer = app.state.analyzer
  return analyzer.analyze(trace)


# ---------------------------------------------------------------------------
# Dashboard API endpoints
# ---------------------------------------------------------------------------


@app.get("/api/collections")
async def api_list_collections():
  """List all available Docent collections."""
  try:
    collections = list_collections()
    return collections
  except Exception as exc:
    raise HTTPException(status_code=503, detail=f"Docent unavailable: {exc}") from exc


@app.post("/api/collections/{collection_id}/analyze", status_code=202)
async def api_analyze_collection(
  collection_id: str,
  request: CollectionAnalyzeRequest,
):
  """Trigger background analysis of a Docent collection."""
  # Check if already running
  existing = app.state.analysis_cache.get(collection_id)
  if existing and existing.status == "running":
    return {"collection_id": collection_id, "status": "already_running"}

  # Initialize state
  state = CollectionAnalysisState(
    collection_id=collection_id,
    status="running",
    started_at=datetime.utcnow(),
  )
  app.state.analysis_cache[collection_id] = state

  # Launch background task
  task = asyncio.create_task(
    _run_collection_analysis(collection_id, request.limit, request.rules_only)
  )
  app.state.analysis_tasks[collection_id] = task

  return {"collection_id": collection_id, "status": "started"}


async def _run_collection_analysis(
  collection_id: str,
  limit: int | None,
  rules_only: bool,
) -> None:
  """Background task: fetch traces from Docent and analyze each one."""
  state = app.state.analysis_cache[collection_id]
  analyzer: TraceAnalyzer = app.state.analyzer
  disk_cache: AnalysisCache = app.state.disk_cache

  try:
    # Fetch traces (blocking I/O — run in thread pool)
    traces = await asyncio.to_thread(fetch_traces, collection_id, None, limit)
    state.total_count = len(traces)
    state.traces = traces

    for trace in traces:
      # Run analysis (may call LLM judge — blocking I/O)
      if rules_only:
        result = await asyncio.to_thread(TraceAnalyzer(skip_judge=True).analyze, trace)
      else:
        result = await asyncio.to_thread(analyzer.analyze, trace)

      trace_result = TraceResult(
        trace_id=result.trace_id,
        agent_id=trace.agent_id,
        task_description=trace.task_description[:500],
        rule_verdicts=result.rule_verdicts,
        judge_verdict=result.judge_verdict,
        final_decision=result.final_decision,
        analyzed_at=result.analyzed_at,
        tool_call_count=len(trace.tool_calls),
      )
      state.results.append(trace_result)
      state.analyzed_count += 1

      # Persist incrementally after each trace
      disk_cache.save_state(collection_id, state)

    state.status = "completed"
    state.completed_at = datetime.utcnow()

    # Final persist: state + traces
    disk_cache.save_state(collection_id, state)
    disk_cache.save_traces(collection_id, state.traces)

  except Exception as exc:
    logger.exception("Collection analysis failed for %s", collection_id)
    state.status = "failed"
    state.error = str(exc)
    state.completed_at = datetime.utcnow()
    disk_cache.save_state(collection_id, state)


@app.get("/api/collections/{collection_id}/results")
async def api_collection_results(
  collection_id: str,
  decision: str | None = Query(default=None),
  category: str | None = Query(default=None),
  severity: str | None = Query(default=None),
):
  """Get cached analysis results for a collection, with optional filters."""
  state = app.state.analysis_cache.get(collection_id)
  if not state:
    # Try loading from disk cache
    disk_cache: AnalysisCache = app.state.disk_cache
    state = disk_cache.load_state(collection_id)
    if state:
      app.state.analysis_cache[collection_id] = state
    else:
      raise HTTPException(status_code=404, detail="No analysis found for this collection")

  results = state.results

  # Apply filters
  if decision:
    results = [r for r in results if r.final_decision == decision]
  if category:
    results = [
      r
      for r in results
      if (r.judge_verdict and r.judge_verdict.category.value == category)
      or any(rv.triggered and rv.category.value == category for rv in r.rule_verdicts)
    ]
  if severity:
    results = [
      r
      for r in results
      if (r.judge_verdict and r.judge_verdict.severity.value == severity)
      or any(rv.triggered and rv.severity.value == severity for rv in r.rule_verdicts)
    ]

  return {
    "collection_id": state.collection_id,
    "status": state.status,
    "total_count": state.total_count,
    "analyzed_count": state.analyzed_count,
    "results": [r.model_dump(mode="json") for r in results],
    "error": state.error,
  }


@app.get("/api/traces/{trace_id:path}/summary")
async def api_trace_summary(trace_id: str):
  """Get trace summary and full analysis for the detail view."""
  disk_cache: AnalysisCache = app.state.disk_cache

  # Search across all cached collections
  for state in app.state.analysis_cache.values():
    for result in state.results:
      if result.trace_id == trace_id:
        # Find the matching trace (check memory first, then disk)
        trace = None
        for t in state.traces:
          if t.trace_id == trace_id:
            trace = t
            break

        if not trace:
          # Try loading traces from disk
          disk_traces = disk_cache.load_traces(state.collection_id)
          for t in disk_traces:
            if t.trace_id == trace_id:
              trace = t
              break

        if not trace:
          raise HTTPException(status_code=404, detail="Trace data not found")

        summary = summarize_trace(trace)
        return {
          "trace_id": trace_id,
          "summary": summary,
          "trace": trace.model_dump(mode="json"),
          "analysis": result.model_dump(mode="json"),
        }

  raise HTTPException(status_code=404, detail="Trace not found in any analyzed collection")


@app.get("/api/stats")
async def api_stats():
  """Aggregate statistics across all cached analysis results."""
  decisions = {"allow": 0, "warn": 0, "block": 0}
  categories: dict[str, int] = {}
  severities: dict[str, int] = {}
  confidences: list[float] = []
  recent: list[dict] = []

  for state in app.state.analysis_cache.values():
    if state.status not in ("completed", "running"):
      continue
    for result in state.results:
      decisions[result.final_decision] = decisions.get(result.final_decision, 0) + 1

      # Determine primary category
      cat = "none"
      if result.judge_verdict and result.judge_verdict.category.value != "none":
        cat = result.judge_verdict.category.value
      else:
        for rv in result.rule_verdicts:
          if rv.triggered and rv.category.value != "none":
            cat = rv.category.value
            break
      categories[cat] = categories.get(cat, 0) + 1

      # Determine severity
      sev = "none"
      if result.judge_verdict and result.judge_verdict.severity.value != "none":
        sev = result.judge_verdict.severity.value
      else:
        for rv in result.rule_verdicts:
          if rv.triggered and rv.severity.value != "none":
            sev = rv.severity.value
            break
      severities[sev] = severities.get(sev, 0) + 1

      # Collect confidence
      if result.judge_verdict:
        confidences.append(result.judge_verdict.confidence)

      recent.append(
        {
          "trace_id": result.trace_id,
          "agent_id": result.agent_id,
          "final_decision": result.final_decision,
          "analyzed_at": result.analyzed_at.isoformat(),
          "category": cat if cat != "none" else None,
        }
      )

  # Sort recent by analyzed_at descending, take top 10
  recent.sort(key=lambda x: x["analyzed_at"], reverse=True)
  recent = recent[:10]

  total = sum(decisions.values())
  collections_analyzed = sum(
    1 for s in app.state.analysis_cache.values() if s.status == "completed"
  )

  return {
    "total_traces": total,
    "decisions": decisions,
    "categories": categories,
    "severities": severities,
    "avg_confidence": (sum(confidences) / len(confidences)) if confidences else None,
    "collections_analyzed": collections_analyzed,
    "recent_analyses": recent,
  }


# ---------------------------------------------------------------------------
# Static file serving (production build)
# ---------------------------------------------------------------------------

DIST_DIR = Path(__file__).resolve().parent.parent.parent / "web" / "dist"

if DIST_DIR.is_dir():
  # Serve static assets (JS, CSS, images)
  app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="static")

  @app.get("/{full_path:path}")
  async def serve_spa(full_path: str):
    """Serve the React SPA for any unmatched route."""
    file_path = DIST_DIR / full_path
    if file_path.is_file():
      return FileResponse(file_path)
    return FileResponse(DIST_DIR / "index.html")
