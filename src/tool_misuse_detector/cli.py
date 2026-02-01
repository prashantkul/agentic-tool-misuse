"""CLI for post-hoc trace analysis and server management."""

from __future__ import annotations

import json
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from .analyzer import TraceAnalyzer
from .docent_client import fetch_traces
from .models import AnalysisResult, Trace

app = typer.Typer(
  name="tool-misuse-detector",
  help="Detect tool misuse in LLM agent traces.",
)
console = Console()


def _load_trace(path: Path) -> Trace:
  data = json.loads(path.read_text())
  return Trace.model_validate(data)


def _render_result(result: AnalysisResult) -> None:
  triggered = [rv for rv in result.rule_verdicts if rv.triggered]
  decision_color = {"allow": "green", "warn": "yellow", "block": "red"}.get(
    result.final_decision, "white"
  )

  console.print()
  console.print(
    Panel(
      f"[bold]Trace:[/bold] {result.trace_id}\n"
      f"[bold]Decision:[/bold] "
      f"[{decision_color}]{result.final_decision.upper()}[/{decision_color}]",
      title="Analysis Result",
      border_style=decision_color,
    )
  )

  if triggered:
    table = Table(title="Rule Alerts")
    table.add_column("Rule", style="cyan")
    table.add_column("Category", style="magenta")
    table.add_column("Severity", style="red")
    table.add_column("Details")
    for rv in triggered:
      table.add_row(rv.rule_name, rv.category.value, rv.severity.value, rv.details)
    console.print(table)

  if result.judge_verdict:
    jv = result.judge_verdict
    console.print()
    console.print("[bold]LLM Judge Verdict[/bold]")
    console.print(f"  Misuse: {'YES' if jv.is_misuse else 'NO'}")
    console.print(f"  Category: {jv.category.value}")
    console.print(f"  Severity: {jv.severity.value}")
    console.print(f"  Confidence: {jv.confidence:.0%}")
    console.print(f"  Action: {jv.recommended_action.upper()}")
    console.print(f"  Explanation: {jv.explanation}")
    if jv.evidence:
      console.print("  Evidence:")
      for ev in jv.evidence:
        console.print(f"    - {ev}")


@app.command()
def analyze(
  path: Path = typer.Argument(
    ...,
    help="Path to a trace JSON file or directory of trace files",
    exists=True,
  ),
  rules_only: bool = typer.Option(
    False,
    "--rules-only",
    help="Skip LLM judge, use only heuristic rules (no API cost)",
  ),
  output: Path | None = typer.Option(
    None,
    "--output",
    "-o",
    help="Write results to JSON file",
  ),
):
  """Analyze local trace files for tool misuse."""
  analyzer = TraceAnalyzer(skip_judge=rules_only)
  files = sorted(path.glob("**/*.json")) if path.is_dir() else [path]
  if not files:
    console.print("[red]No JSON trace files found.[/red]")
    raise typer.Exit(code=1)

  results: list[AnalysisResult] = []
  for file in files:
    console.print(f"[dim]Analyzing {file.name}...[/dim]")
    trace = _load_trace(file)
    result = analyzer.analyze(trace)
    results.append(result)
    _render_result(result)

  if output:
    output.write_text(json.dumps([r.model_dump(mode="json") for r in results], indent=2))
    console.print(f"\n[green]Results written to {output}[/green]")

  # Summary
  console.print()
  blocked = sum(1 for r in results if r.final_decision == "block")
  warned = sum(1 for r in results if r.final_decision == "warn")
  allowed = sum(1 for r in results if r.final_decision == "allow")
  console.print(
    f"[bold]Summary:[/bold] {len(results)} traces analyzed — "
    f"[red]{blocked} blocked[/red], "
    f"[yellow]{warned} warned[/yellow], "
    f"[green]{allowed} allowed[/green]"
  )


@app.command("analyze-collection")
def analyze_collection(
  collection_id: str = typer.Argument(..., help="Docent collection ID"),
  rules_only: bool = typer.Option(False, "--rules-only", help="Skip LLM judge"),
  limit: int | None = typer.Option(None, "--limit", "-n", help="Max agent runs to fetch"),
  output: Path | None = typer.Option(None, "--output", "-o", help="Write results to JSON"),
):
  """Pull traces from Docent and analyze for tool misuse."""
  console.print(f"[dim]Fetching traces from Docent collection {collection_id}...[/dim]")
  traces = fetch_traces(collection_id, limit=limit)
  if not traces:
    console.print("[red]No traces found in collection.[/red]")
    raise typer.Exit(code=1)

  console.print(f"[dim]Found {len(traces)} agent runs.[/dim]")
  analyzer = TraceAnalyzer(skip_judge=rules_only)
  results: list[AnalysisResult] = []
  for trace in traces:
    result = analyzer.analyze(trace)
    results.append(result)
    _render_result(result)

  if output:
    output.write_text(json.dumps([r.model_dump(mode="json") for r in results], indent=2))
    console.print(f"\n[green]Results written to {output}[/green]")

  console.print()
  blocked = sum(1 for r in results if r.final_decision == "block")
  warned = sum(1 for r in results if r.final_decision == "warn")
  allowed = sum(1 for r in results if r.final_decision == "allow")
  console.print(
    f"[bold]Summary:[/bold] {len(results)} traces analyzed — "
    f"[red]{blocked} blocked[/red], "
    f"[yellow]{warned} warned[/yellow], "
    f"[green]{allowed} allowed[/green]"
  )


@app.command()
def serve(
  host: str = typer.Option("0.0.0.0", help="Bind address"),
  port: int = typer.Option(8000, help="Port number"),
  reload: bool = typer.Option(False, help="Enable auto-reload for development"),
):
  """Start the real-time monitoring server."""
  import uvicorn

  console.print(f"[bold]Starting Tool Misuse Detector server on {host}:{port}[/bold]")
  uvicorn.run(
    "tool_misuse_detector.server:app",
    host=host,
    port=port,
    reload=reload,
  )


if __name__ == "__main__":
  app()
