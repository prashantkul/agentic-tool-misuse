# Agentic ToolWatch

Detect and analyze tool misuse in LLM coding agents. Combines heuristic rules with an LLM-as-judge (Claude) to classify agent tool call sequences as **ALLOW**, **WARN**, or **BLOCK**.

Pulls agent trajectories from [Docent (Transluce)](https://transluce.org/docent), analyzes tool call patterns for data exfiltration, privilege escalation, destructive commands, and other misuse categories.

## Architecture

```
┌──────────────────┐     ┌──────────────────────────────┐
│  React Dashboard │────>│  FastAPI Server (:8000)       │
│  (Vite :5173)    │     │                               │
│  - TanStack Query│     │  POST /analyze                │
│  - Chart.js      │     │  POST /intercept              │    ┌────────┐
│  - Tailwind CSS  │     │  GET  /api/collections        │───>│ Docent │
│                  │     │  POST /api/collections/{}/     │    └────────┘
│                  │     │       analyze                  │
│                  │     │  GET  /api/collections/{}/     │    ┌───────────┐
│                  │     │       results                  │───>│ Anthropic │
│                  │     │  GET  /api/traces/{}/summary   │    │ (Judge)   │
│                  │     │  GET  /api/stats               │    └───────────┘
└──────────────────┘     └──────────────────────────────┘
                         ┌──────────────────────────────┐
                         │  CLI                          │
                         │  analyze <path>               │
                         │  analyze-collection <id>      │
                         │  serve                        │
                         └──────────────────────────────┘
```

## Detection Pipeline

1. **Heuristic Rules** — pattern-matching rules that detect:
   - Sensitive file access (SSH keys, `.env`, credentials)
   - Destructive commands (`rm -rf`, `DROP TABLE`)
   - Privilege escalation (`sudo`, `chmod 777`)
   - Data exfiltration sequences (read sensitive data → send to external URL)
   - Obfuscated commands (base64 + curl/wget)
   - Prompt injection in tool outputs
   - Dangerous git operations (force push to main)

2. **Trace Summarizer** — annotates tool calls with task context, endpoint analysis, and IP classification

3. **LLM Judge** (Claude) — evaluates the full trajectory and returns structured verdicts with category, severity, confidence, evidence, and explanation

4. **Decision Logic**:
   - **BLOCK**: Judge says misuse with >=80% confidence, or critical-severity rules triggered without judge
   - **WARN**: Judge says misuse with <80% confidence, or no-misuse verdict but critical rules fired
   - **ALLOW**: No misuse detected, no critical rules

## Quick Start

### Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js 18+ (for the dashboard)

### Setup

```bash
# Clone and install
git clone git@github.com:prashantkul/agentic-tool-misuse.git
cd agentic-tool-misuse
uv sync

# Configure API keys
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY and DOCENT_API_KEY
```

### CLI Usage

```bash
# Analyze local trace files (rules only, no API cost)
uv run tool-misuse-detector analyze traces/malicious/ --rules-only

# Analyze with LLM judge
uv run tool-misuse-detector analyze traces/malicious/

# Pull and analyze a Docent collection
uv run tool-misuse-detector analyze-collection <collection-id> --limit 5

# Start the API server
uv run tool-misuse-detector serve --reload
```

### Dashboard

```bash
# Install frontend dependencies
cd web && npm install

# Development (with hot reload)
npm run dev        # → http://localhost:5173

# Make sure the backend is running in another terminal:
uv run uvicorn tool_misuse_detector.server:app --reload

# Production build (served directly from FastAPI)
cd web && npm run build
uv run uvicorn tool_misuse_detector.server:app  # → http://localhost:8000
```

The dashboard lets you:
- Browse Docent collections and trigger batch analysis
- View aggregate statistics (decisions, categories, confidence)
- Filter results by decision, category, severity, and search
- Drill into individual traces with rule alerts, judge verdicts, and trace summaries

### Running Tests

```bash
uv run pytest tests/ -v
```

## Project Structure

```
├── src/tool_misuse_detector/
│   ├── models.py          # Pydantic models (Trace, ToolCall, verdicts)
│   ├── rules.py           # Heuristic rule definitions
│   ├── analyzer.py        # Orchestrates rules + judge
│   ├── judge.py           # LLM-as-judge (Claude API)
│   ├── prompts.py         # Judge system prompt
│   ├── summarizer.py      # Trace summarizer with endpoint/IP analysis
│   ├── docent_client.py   # Docent SDK wrapper
│   ├── server.py          # FastAPI server (interception + dashboard APIs)
│   ├── cli.py             # Typer CLI
│   └── settings.py        # Environment config
├── web/                   # React dashboard
│   └── src/
│       ├── api/client.ts
│       ├── types/index.ts
│       ├── pages/         # Dashboard, Collections, CollectionResults, TraceDetail
│       └── components/    # Charts, cards, filters, badges, panels
├── tests/                 # 34 tests (rules, analyzer, judge, server, CLI)
└── traces/                # Sample trace files (benign + malicious)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze` | POST | Analyze a complete trace (post-hoc) |
| `/intercept` | POST | Real-time tool call interception |
| `/session/start` | POST | Start a monitoring session |
| `/session/{id}/append` | POST | Append tool call to session |
| `/session/{id}/status` | GET | Get session analysis status |
| `/api/collections` | GET | List Docent collections |
| `/api/collections/{id}/analyze` | POST | Trigger batch analysis (async) |
| `/api/collections/{id}/results` | GET | Get analysis results (with filters) |
| `/api/traces/{id}/summary` | GET | Trace detail with summary |
| `/api/stats` | GET | Aggregate statistics |

## Misuse Categories

| Category | Description |
|----------|-------------|
| `data_exfiltration` | Reading sensitive data and sending it externally |
| `destructive_action` | Deleting files, dropping databases |
| `privilege_escalation` | Unauthorized elevation of permissions |
| `prompt_injection` | Injected instructions in tool outputs |
| `unauthorized_access` | Accessing files/systems beyond scope |
| `obfuscation` | Encoding commands to hide intent |

## License

MIT
