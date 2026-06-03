# App Compiler — Natural Language → Structured App Config

<div align="center">

![App Compiler](https://img.shields.io/badge/App%20Compiler-AI%20System%20Design-7c3aed?style=for-the-badge&logo=lightning&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?style=for-the-badge&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![OpenRouter](https://img.shields.io/badge/OpenRouter-GPT--4o--mini-orange?style=for-the-badge)
![Pydantic](https://img.shields.io/badge/Pydantic-v2-red?style=for-the-badge)

**A multi-stage AI pipeline that works like a compiler — takes a plain English app description as input and produces a complete, validated, executable app configuration as output.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [How It Works](#-how-it-works)
- [Features](#-features)
- [Architecture](#-architecture)
- [Pipeline Stages](#-pipeline-stages)
- [Compilation Modes](#-compilation-modes)
- [Validation & Repair Engine](#-validation--repair-engine)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Output Schema](#-output-schema)
- [Evaluation Framework](#-evaluation-framework)
- [Cost vs Quality Tradeoffs](#-cost-vs-quality-tradeoffs)
- [Deployment](#-deployment)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)

---

## 🧠 Overview

**App Compiler** is a system that behaves like a compiler for software generation. Instead of compiling source code into machine code, it compiles natural language instructions into a structured, validated, and directly usable application configuration.

A user types something like:

> *"Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics."*

And the system produces a complete, cross-validated JSON configuration covering:

- **UI Schema** — pages, routes, components, role access
- **API Schema** — endpoints, methods, request/response shapes, auth
- **Database Schema** — tables, columns, types, constraints, foreign keys
- **Auth Config** — strategy, roles, role hierarchy, protected routes
- **Business Logic** — who can do what, premium gating, role permissions

This is not prompt engineering. It is a **system design + reliability + control problem** — the pipeline ensures output is always valid JSON, always cross-layer consistent, and always directly usable.

---

## ⚙️ How It Works

```
User types a plain English app description
               │
               ▼
┌──────────────────────────────┐
│  Stage 1 — Intent Extractor  │  Parses the prompt into structured intent
│  (stage1_intent.py)          │  → app name, type, features, roles, flags
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Stage 2 — System Designer   │  Converts intent → full app architecture
│  (stage2_design.py)          │  → entities, flows, roles, permissions
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Stage 3 — Schema Generator  │  Generates all 4 schemas simultaneously
│  (stage3_schema.py)          │  → UI config, API config, DB schema, Auth
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Stage 4 — Refinement Layer  │  Cross-validates all layers, fixes issues
│  (stage4_refine.py)          │  → detects mismatches, repairs, re-checks
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Static Validator            │  Rule-based checks (no LLM needed)
│  (repair.py)                 │  → checks roles, IDs, FK consistency
└──────────────┬───────────────┘
               │
               ▼
      Final Validated JSON Output
  (intent + system_design + schema + metadata)
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Multi-Stage Pipeline** | 4 distinct stages modeled after a compiler — not a single prompt |
| ⚡ **Two Compilation Modes** | `fast` (single unified LLM call) and `deep` (4 sequential calls) |
| 🔧 **Validation + Repair Engine** | Detects and fixes broken JSON, missing keys, hallucinated fields |
| 🔗 **Cross-Layer Consistency** | Ensures UI, API, DB, and Auth all agree with each other |
| 📐 **Strict Schema Enforcement** | Pydantic v2 models enforce type safety on every output |
| 🧪 **Evaluation Framework** | 20 test prompts (10 real + 10 edge cases) with tracked metrics |
| 📥 **JSON Download** | Full output downloadable as `app-config.json` |
| 🌐 **REST API** | Clean FastAPI backend with `/generate`, `/health` endpoints |
| 📊 **Generation Metadata** | Latency, model, stage count, issues found — all tracked per request |
| 🎨 **Minimal Dark UI** | Next.js frontend with collapsible JSON sections per pipeline stage |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                        │
│                                                             │
│   Prompt Input → Compile App Button → Stage Progress Bar    │
│   Collapsible JSON Sections (Stage 1 / 2 / 3 / 4)           │
│   Download Full JSON  |  Metadata Bar                       │
└──────────────────────────┬──────────────────────────────────┘
                           │  POST /generate
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Stage 1  │→ │ Stage 2  │→ │ Stage 3  │→ │ Stage 4  │     │
│  │ Intent   │  │ Design   │  │ Schema   │  │ Refine   │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                    │                        │
│              ┌─────────────────────┘                        │
│              ▼                                              │
│  ┌──────────────────────────────────┐                       │
│  │  Static Validator + Repair       │                       │
│  │  (validator/repair.py)           │                       │
│  └──────────────────────────────────┘                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                 OpenRouter API (GPT-4o-mini)
```

---

## 🔬 Pipeline Stages

### Stage 1 — Intent Extractor (`stage1_intent.py`)

Takes the raw user prompt and extracts structured intent. Forces the LLM into `json_object` response format and keeps temperature at `0.2` for consistency.

**Output:**
```json
{
  "app_name": "CRM System",
  "app_type": "CRM",
  "core_features": ["login", "contacts management", "dashboard with analytics"],
  "user_roles": ["admin", "sales rep"],
  "auth_required": true,
  "payment_required": true,
  "assumptions": []
}
```

If the user was vague, the LLM lists its assumptions under `assumptions` rather than silently guessing.

---

### Stage 2 — System Designer (`stage2_design.py`)

Takes the intent and designs the full system architecture — entities, flows, roles, and permission mapping.

**Rules enforced:**
- Every entity must have `id` (uuid) and `created_at` (timestamp)
- Permissions must cover ALL roles listed
- All data types must be from a fixed allowed set: `uuid, string, text, integer, float, boolean, timestamp, json`

**Output includes:**
- Entities with typed fields and relations
- User flows with sequential steps
- Role → allowed actions mapping

---

### Stage 3 — Schema Generator (`stage3_schema.py`)

The heaviest stage. Takes both Stage 1 and Stage 2 outputs and generates all four schemas in one LLM call:

| Schema | What's generated |
|--------|-----------------|
| `ui` | Pages, routes, role access, components (form/table/card/chart) |
| `api` | Endpoints, HTTP methods, request/response shapes, auth flags |
| `database` | Tables, typed columns, PKs, FKs, constraints |
| `auth` | JWT strategy, roles, role hierarchy, protected routes |

---

### Stage 4 — Refinement Layer (`stage4_refine.py`)

Acts as a strict validator + fixer. Receives all prior stage outputs, finds inconsistencies across layers, and returns a corrected schema. Temperature is set to `0.1` — lowest in the pipeline — to ensure deterministic fixes.

**Examples of what it catches and fixes:**
- API endpoint referencing a DB table that doesn't exist
- A role appearing in UI `accessible_by` but missing from `auth.roles`
- Protected routes not covering all role-restricted pages
- Wrong HTTP method for an endpoint (e.g. POST used for fetching data)

---

## ⚡ Compilation Modes

The system supports two modes, switchable via `mode` in the API request:

### `deep` Mode (4 Stages)
- Runs all 4 stages sequentially
- Each stage gets focused, targeted instructions
- Better output quality with more detailed cross-layer validation
- Average latency: **~53 seconds**

### `fast` Mode (Unified Single Call)
- Runs a single unified LLM call via `pipeline/unified.py`
- Generates all schemas (intent + design + schema) in one shot
- Runs static validation after and triggers Stage 4 only if issues found
- Significantly faster — Average latency: **~20 seconds**
- Slightly less detailed than deep mode but good for quick testing

---

## 🛡️ Validation & Repair Engine

Located in `validator/repair.py`, this is the most important part of the system.

### JSON Repair Flow

```
Raw LLM Output
      │
      ▼
clean_json_string()     ← strips markdown fences, whitespace
      │
      ▼
try_parse_json()        ← attempts direct JSON parse
      │
   ✅ success → return dict
   ❌ fail
      │
      ▼
repair_json_with_llm()  ← sends broken JSON to LLM with targeted repair prompt
      │                    temperature=0.0, response_format=json_object
      ▼
try_parse_json()        ← parse repair output
      │
   ✅ success → return dict
   ❌ fail → retry up to max_attempts → raise ValueError
```

### Static Cross-Layer Checks (no LLM needed)

The `check_cross_layer_consistency()` function runs rule-based checks:

| Check | What it catches |
|-------|----------------|
| DB ID check | Every table must have an `id` column |
| UI role check | `accessible_by` roles must exist in `auth.roles` |
| API role check | `roles_allowed` must exist in `auth.roles` |
| Hierarchy check | `role_hierarchy` must cover all defined roles |

These checks are fast and don't consume any API tokens.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11, FastAPI, Uvicorn |
| **Data Validation** | Pydantic v2 |
| **LLM** | OpenRouter API → GPT-4o-mini |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Fonts** | JetBrains Mono (Google Fonts) |
| **Icons** | Lucide React |
| **Backend Deploy** | Render.com |
| **Frontend Deploy** | Vercel |

---

## 📁 Project Structure

```
app-compiler/
│
├── backend/
│   ├── main.py                    ← FastAPI server, route handlers, mode switcher
│   │
│   ├── pipeline/
│   │   ├── stage1_intent.py       ← Intent extraction (Stage 1)
│   │   ├── stage2_design.py       ← System design (Stage 2)
│   │   ├── stage3_schema.py       ← Schema generation (Stage 3)
│   │   ├── stage4_refine.py       ← Refinement + validation (Stage 4)
│   │   └── unified.py             ← Fast mode: single unified LLM call
│   │
│   ├── schemas/
│   │   └── models.py              ← All Pydantic models for every stage
│   │
│   ├── validator/
│   │   └── repair.py              ← JSON repair + static cross-layer checks
│   │
│   ├── evaluator/
│   │   └── eval.py                ← Evaluation framework (20 test cases)
│   │
│   ├── Dockerfile                 ← Backend Docker image config
│   ├── .dockerignore              ← Files excluded from Docker build
│   ├── requirements.txt           ← Pinned Python dependencies
│   ├── render.yml                 ← Render.com deploy config
│   ├── .env                       ← API keys (not committed)
│   └── .env.example               ← Template for .env setup
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx               ← Main UI (prompt input + JSON viewer)
│   │   ├── layout.tsx             ← Root layout with JetBrains Mono font
│   │   └── globals.css            ← Dark theme + custom scrollbar
│   │
│   ├── Dockerfile                 ← Frontend Docker image config
│   ├── .dockerignore              ← Files excluded from Docker build
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── .env.local                 ← Backend URL (not committed)
│   └── .env.local.example         ← Template for .env.local setup
│
├── docker-compose.yml             ← One-command full-stack setup
├── .gitignore                     ← Git ignore rules
├── LICENSE                        ← MIT License
├── eval_results.json              ← Saved evaluation results
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- An [OpenRouter](https://openrouter.ai) API key

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/adhipatya3552/app-compiler.git
cd app-compiler/backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Start the server
uvicorn main:app --reload
```

Server runs at: `http://localhost:8000`

### Frontend Setup

```bash
cd app-compiler/frontend

# Install dependencies
npm install

# Create env file with backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key from openrouter.ai |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL of the FastAPI backend (local or deployed) |

---

## 📡 API Reference

### `POST /generate`

Runs the full compilation pipeline on a user prompt.

**Request Body:**
```json
{
  "prompt": "Build a CRM with login, contacts, dashboard, role-based access...",
  "mode": "fast"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ | App description (min 10 characters) |
| `mode` | string | ❌ | `"fast"` (default) or `"deep"` |

**Response:**
```json
{
  "success": true,
  "output": {
    "intent": { ... },
    "system_design": { ... },
    "schema": { "ui": [...], "api": [...], "database": [...], "auth": {...} },
    "validation_issues": [],
    "generation_metadata": {
      "model": "openai/gpt-4o-mini",
      "stages_completed": 4,
      "static_issues_found": 0,
      "llm_issues_found": 0,
      "latency_ms": 53041.12,
      "compiler_mode": "deep"
    }
  },
  "retries": 0,
  "latency_ms": 53041.12
}
```

### `GET /health`

```json
{ "status": "healthy", "api_key_set": true }
```

---

## 📐 Output Schema

### `intent`
| Field | Type | Description |
|-------|------|-------------|
| `app_name` | string | Inferred name of the app |
| `app_type` | string | CRM, E-commerce, SaaS, etc. |
| `core_features` | string[] | Specific actionable features |
| `user_roles` | string[] | All roles in the system |
| `auth_required` | boolean | Whether login is needed |
| `payment_required` | boolean | Whether payments are needed |
| `assumptions` | string[] | What was assumed when prompt was vague |

### `schema.database` (per table)
| Field | Type | Description |
|-------|------|-------------|
| `table_name` | string | SQL table name |
| `columns` | object | col_name → type + constraints |
| `primary_key` | string | Always `"id"` |
| `foreign_keys` | string[] | FK references |

### `schema.auth`
| Field | Type | Description |
|-------|------|-------------|
| `strategy` | string | JWT / session / OAuth |
| `roles` | string[] | All defined roles |
| `role_hierarchy` | object | role → numeric access level |
| `protected_routes` | string[] | All routes requiring auth |

---

## 🧪 Evaluation Framework

Run all 20 test cases with:

```bash
cd backend
python evaluator/eval.py
```

Results are saved to `eval_results.json`.

### Test Dataset

| Category | Count | Description |
|----------|-------|-------------|
| Real prompts | 10 | Well-defined, production-style app descriptions |
| Edge cases | 10 | Vague, conflicting, underspecified, or contradictory prompts |

**Edge cases include:**
- `"Build an app."` — extremely vague
- `"Build a free app with premium features but no login required and also admin access."` — contradictory
- `"Build something like Netflix but better."` — underspecified
- `"Build a real-time chat app that also works offline without any backend."` — technically conflicting

### Evaluation Results

| Mode | Success Rate | Avg Latency |
|------|-------------|-------------|
| `fast` | **16/16 (100%)** | ~20,678ms |
| `deep` | **16/16 (100%)** | ~53,041ms |

Metrics tracked per run: success/fail, stages completed, issues found, latency in ms, failure reason.

---

## ⚖️ Cost vs Quality Tradeoffs

The system exposes a clear tradeoff via the `mode` parameter:

| | `fast` Mode | `deep` Mode |
|--|-------------|-------------|
| LLM calls | 1 | 4 |
| Avg latency | ~20 seconds | ~53 seconds |
| Output detail | Good | Better |
| Cross-layer validation | Static only (unless issues found) | LLM + Static |
| Best for | Quick testing / demos | Production use |
| API cost | ~1x | ~4x |

**Decision logic in `fast` mode:**
- Generates everything in one shot
- Runs static validation
- If 0 issues found → returns immediately (no extra LLM call)
- If issues found → triggers Stage 4 refinement (costs one more LLM call)

This makes `fast` mode adaptive — it only pays for extra validation when actually needed.

---

## 🌐 Deployment

### Backend → Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `OPENROUTER_API_KEY` → your key
7. Deploy → copy the live URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Import repo
2. Set root directory to `frontend/`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL
4. Deploy → get your live frontend URL

---

## ⚠️ Known Limitations

- **Latency** — deep mode takes ~53 seconds due to 4 sequential LLM calls. This is a deliberate quality-vs-speed tradeoff, not a bug.
- **No persistent storage** — generated configs are not saved server-side. Users must download the JSON manually.
- **Single model** — currently only uses `openai/gpt-4o-mini` via OpenRouter. Swapping to a larger model (e.g. GPT-4o) would improve output quality but increase cost.
- **No real runtime** — the system generates app configs but does not yet spin up actual working apps from the output. Output is structured to be directly usable by a runtime layer.
- **Determinism** — temperatures are set low (0.1–0.2) but not zero, so there is minor variance across runs on the same prompt.

---

## 🗺️ Roadmap

- [ ] Add a runtime layer that reads the JSON output and scaffolds a real working app
- [ ] Support switching models via request parameter (GPT-4o, Claude, Llama)
- [ ] Add config history — save past generations to a database
- [ ] Support iterative refinement — allow users to tweak specific sections and re-validate
- [ ] Add TypeScript / OpenAPI type generation from the DB and API schemas
- [ ] Add cost tracking — show estimated token cost per generation
- [ ] Docker support for local one-command setup
