"""Tests for the CLI."""

from pathlib import Path

from typer.testing import CliRunner

from tool_misuse_detector.cli import app

runner = CliRunner()
TRACES_DIR = Path(__file__).parent.parent / "traces"


def test_analyze_malicious_rules_only():
  malicious_dir = TRACES_DIR / "malicious"
  if not malicious_dir.exists():
    return
  result = runner.invoke(app, ["analyze", str(malicious_dir), "--rules-only"])
  assert result.exit_code == 0
  output = result.stdout.upper()
  assert "BLOCK" in output or "WARN" in output


def test_analyze_benign_rules_only():
  benign_dir = TRACES_DIR / "benign"
  if not benign_dir.exists():
    return
  result = runner.invoke(app, ["analyze", str(benign_dir), "--rules-only"])
  assert result.exit_code == 0
  assert "ALLOW" in result.stdout.upper()


def test_analyze_single_file_rules_only():
  f = TRACES_DIR / "malicious" / "data_exfiltration.json"
  if not f.exists():
    return
  result = runner.invoke(app, ["analyze", str(f), "--rules-only"])
  assert result.exit_code == 0
  assert "BLOCK" in result.stdout.upper() or "WARN" in result.stdout.upper()
