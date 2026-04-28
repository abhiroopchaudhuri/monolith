# Monolith v3.3 — Implementation Plan: Performance Optimization

> **Date:** 2026-04-28  
> **Based on:** `MONOLITH-PERFORMANCE-ISSUES.md` + `MONOLITH-PERFORMANCE-SOLUTIONS.md` + Claude Opus 4.7 harness-optimized review  
> **Goal:** 80%+ runtime reduction without quality loss via harness-native, IDE-integrated architecture  
> **Estimated Implementation:** 3–4 weeks (1 engineer full-time)

---

## How to Read This Document

Each issue links to:
- **My original solution** (from `MONOLITH-PERFORMANCE-SOLUTIONS.md`)
- **Opus 4.7 rating** (score + critique)
- **Final adopted approach** — the merged best-of-both solution
- **Implementation tasks** — concrete, assignable work units with deliverables

**Legend:**
- 🔴 **P0** — Blocks everything else, do first
- 🟡 **P1** — Major wins, do in Phase 2
- 🟢 **P2** — Medium wins, do in Phase 3
- ⚪ **P3** — Polish, do in Phase 4

---

## Phase 0: Foundation — Tooling Infrastructure

### P0-1: Skill Root Package Setup
**Issue:** #20 — No `package.json` or `tsconfig.json`  
**Original Solution:** S20 — Add tooling infrastructure (Score: 10/10)  
**Opus Rating:** 10/10 — "Fundamental requirement"  
**Final Approach:** Add complete Node.js project setup at skill root

**Tasks:**

#### T0-1.1: Create `package.json`
```json
{
  "name": "monolith-skill",
  "version": "3.3.0",
  "private": true,
  "type": "module",
  "scripts": {
    "index-ds-repo": "tsx scripts/index-ds-repo.ts",
    "index-ds-mcp": "tsx scripts/index-ds-mcp.ts",
    "scaffold": "tsx scripts/scaffold-app.ts",
    "validate": "tsx scripts/validate-generated.ts",
    "axe": "tsx scripts/axe-run.ts",
    "runtime": "tsx scripts/runtime-sweep.ts",
    "visual-smoke": "tsx scripts/visual-smoke.ts",
    "start-dev": "tsx scripts/start-dev-server.ts",
    "stop-dev": "tsx scripts/stop-dev-server.ts",
    "delta-map": "tsx scripts/delta-map.ts",
    "build-embeddings": "tsx scripts/build-embeddings.ts",
    "sync-skills": "node sync-skills.js"
  },
  "dependencies": {
    "ts-morph": "^23.0.0",
    "cheerio": "^1.0.0",
    "handlebars": "^4.7.8",
    "zod": "^3.23.0",
    "playwright": "^1.44.0",
    "@playwright/test": "^1.44.0",
    "axe-core": "^4.9.0",
    "jsdom": "^24.0.0",
    "better-sqlite3": "^11.0.0",
    "tree-kill": "^1.2.2",
    "tsx": "^4.11.0",
    "typescript": "^5.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jsdom": "^21.0.0"
  }
}
```

**Deliverable:** `package.json` committed to repo root
**ETA:** 30 minutes

#### T0-1.2: Create `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": ".",
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["scripts/**/*", "guidelines-schema/**/*"],
  "exclude": ["node_modules", "dist", "**/*.hbs"]
}
```

**Deliverable:** `tsconfig.json` committed
**ETA:** 15 minutes

#### T0-1.3: Create `.gitignore`
```
node_modules/
dist/
.monolith-cache/
.monolith-runs/
.monolith-memory/
*.log
.DS_Store
```

**Deliverable:** `.gitignore` committed
**ETA:** 10 minutes

#### T0-1.4: Install dependencies and verify
```bash
npm install
npx tsc --noEmit
```

**Deliverable:** Clean TypeScript compilation, lockfile committed
**ETA:** 10 minutes

---

## Phase 1: Core Script Implementation (P0 — Unblocks Everything)

### P0-2: Implement 14 Deterministic Scripts
**Issue:** #6 — All scripts are stubs  
**Original Solution:** S2 — Full script implementation (Score: 10/10)  
**Opus Rating:** 10/10 — "There is absolutely no substitute for this"  
**Final Approach:** Implement every stub as deterministic TypeScript with `zod` validation

**Tasks:**

#### T1-1: `scripts/index-ds-repo.ts`
**Purpose:** Parse DS repo via ts-morph, emit component-index.json + tokens.json + icons.json

**Subtasks:**
- T1-1.1: Read adapter JSON to get `componentsGlob`, `tokenFiles`, `iconPackage`
- T1-1.2: Walk `componentsGlob` with `ts-morph`, parse each TSX/TS file
- T1-1.3: Extract props from `InterfaceDeclaration` or `TypeAliasDeclaration`
- T1-1.4: Extract variants from union types or JSDoc `@variant`
- T1-1.5: Extract slots from `children` prop or render-prop patterns
- T1-1.6: Grep component styles for token references (CSS var, theme object)
- T1-1.7: Parse sibling `.stories.tsx` / `.mdx` for examples
- T1-1.8: Collect aria-* prop names for a11y metadata
- T1-1.9: Write `component-index.json`, `tokens.json`, `icons.json` with zod validation
- T1-1.10: Add cache key computation (`hash(adapterMtime + repoHead)`)
- T1-1.11: Add `--cache-dir` and `--force-rebuild` flags

**Deliverable:** Working script + unit tests
**ETA:** 2–3 days

#### T1-2: `scripts/index-ds-mcp.ts`
**Purpose:** Query DS MCP, normalize output to same schema as repo indexer

**Subtasks:**
- T1-2.1: Accept `--mcp-name` argument
- T1-2.2: Call MCP tool `list_components` (or equivalent)
- T1-2.3: Call MCP tool `list_tokens` (or equivalent)
- T1-2.4: Call MCP tool `list_icons` (or equivalent)
- T1-2.5: Normalize MCP response shape to `component-index.schema.json`
- T1-2.6: Handle MCP missing category (emit `{}` + warning)
- T1-2.7: Write same output files as T1-1

**Deliverable:** Working script
**ETA:** 1 day

#### T1-3: `scripts/scaffold-app.ts`
**Purpose:** Generate Vite app skeleton from build_specs + theme-spec

**Subtasks:**
- T1-3.1: Parse `--plan` (build_specs.md) and `--specs` (design_decisions.md)
- T1-3.2: Read `--theme` (theme-spec.json) for bridge block
- T1-3.3: Read `--adapter` for DS-specific config
- T1-3.4: Render `package.json` from template with real dependency names
- T1-3.5: Render `vite.config.ts`, `tsconfig.json`, `index.html`
- T1-3.6: Render theme file based on `bridge.kind` (css-vars / mui / chakra / mantine / ds-specific)
- T1-3.7: Render `src/main.tsx`, `src/App.tsx`, `src/routes.tsx`
- T1-3.8: Create empty dirs: `src/screens/`, `src/fixtures/`, `src/custom/`, `src/components/ui/`
- T1-3.9: Write `.gitignore`, `README.md` with run instructions
- T1-3.10: Validate all rendered files with zod schemas

**Deliverable:** Working script that produces a runnable Vite skeleton
**ETA:** 2 days

#### T1-4: `scripts/validate-generated.ts`
**Purpose:** Static analysis gate — tsc, imports, props, DS_FIRST, ANTI_GENERIC

**Subtasks:**
- T1-4.1: Run `tsc --noEmit` in appRoot, capture errors
- T1-4.2: Cross-check DS imports against `component-index.json`
- T1-4.3: AST-walk props usage against component-index prop definitions
- T1-4.4: Verify icon names against `icons.json.names`
- T1-4.5: DS_FIRST scan — regex for raw `<button>`, `<dialog>`, `<select>`
- T1-4.6: ANTI_GENERIC scan — regex probes from `ai-generic-anti-patterns.md §Part 5`
- T1-4.7: Import `constraints.bannedPrimaryHexes` from `theme-spec.json`
- T1-4.8: Token coverage scan — flag hardcoded hex/spacing literals
- T1-4.9: Emit structured `dev_qa_issues.json` per self-healing-loop schema
- T1-4.10: Emit human-readable `dev_qa_report.md`

**Deliverable:** Working script that replaces dev-qa's static gates
**ETA:** 2 days

#### T1-5: `scripts/axe-run.ts`
**Purpose:** Accessibility audit per route

**Subtasks:**
- T1-5.1: Accept `--app-root`, `--port`, `--routes` arguments
- T1-5.2: Boot dev server (or connect to existing)
- T1-5.3: For each route: visit with Playwright, run `axe-core`
- T1-5.4: Filter for critical violations only (configurable threshold)
- T1-5.5: Emit `a11y_report.json` with per-route violations
- T1-5.6: Support `--affected-routes` flag for delta mode

**Deliverable:** Working script
**ETA:** 1 day

#### T1-6: `scripts/runtime-sweep.ts`
**Purpose:** Headless browser verification — routes, interactions, scroll, modals, forms, responsive

**Subtasks:**
- T1-6.1: Accept `--app-root`, `--port`, `--ia-path`, `--out-dir`
- T1-6.2: Phase A — Route sweep: visit each route, assert 200, no console errors, screenshot at 4 viewports
- T1-6.3: Phase B — Nav invariant: assert exactly one `aria-current="page"` per route
- T1-6.4: Phase C — Interactive sweep: click every interactable, assert DOM change
- T1-6.5: Phase D — Scroll & overflow: scroll to bottom, expand all collapsibles, assert no clipping
- T1-6.6: Phase E — Modal lifecycle: focus trap, Escape, close button, backdrop
- T1-6.7: Phase F — Form lifecycle: empty submit → validation, filled submit → success
- T1-6.8: Phase G — Responsive sweep: 4 viewports, no horizontal scroll
- T1-6.9: Emit `runtime-report.json` + `runtime-report.md` + screenshots/
- T1-6.10: Support `--affected-routes` and `--affected-checks` flags for delta mode

**Deliverable:** Working script
**ETA:** 2–3 days

#### T1-7: `scripts/start-dev-server.ts`
**Purpose:** Boot Vite dev server, return URL + PID

**Subtasks:**
- T1-7.1: Accept `--app-root` and optional `--timeout` (default 60s)
- T1-7.2: Spawn `npm run dev` with detached process group
- T1-7.3: Parse stdout for `Local:` URL
- T1-7.4: Healthcheck: retry `curl localhost:<port>` up to timeout
- T1-7.5: Write PID to `<runRoot>/server.pid`
- T1-7.6: Return `{ url, pid }` as JSON
- T1-7.7: If timeout → kill process, emit stderr, exit 1

**Deliverable:** Working script
**ETA:** 4 hours

#### T1-8: `scripts/stop-dev-server.ts`
**Purpose:** Gracefully kill dev server by PID

**Subtasks:**
- T1-8.1: Accept `--pid` or read from `<runRoot>/server.pid`
- T1-8.2: Use `tree-kill` to kill process tree (prevents orphaned Node processes)
- T1-8.3: Verify process terminated, clean up PID file
- T1-8.4: Accept `--force` for SIGKILL fallback

**Deliverable:** Working script
**ETA:** 2 hours

#### T1-9: `scripts/visual-smoke.ts`
**Purpose:** Screenshot comparison per route

**Subtasks:**
- T1-9.1: Accept `--url`, `--routes`, `--out-dir`
- T1-9.2: Capture screenshots at 4 viewports per route
- T1-9.3: Compare against baseline (if exists) or just capture
- T1-9.4: Emit screenshot manifest

**Deliverable:** Working script
**ETA:** 4 hours

#### T1-10: `scripts/delta-map.ts`
**Purpose:** Map changed files to affected QA gates

**Subtasks:**
- T1-10.1: Accept `--app-root`, `--checkpoint-dir`, `--prev-checkpoint` arguments
- T1-10.2: Compute git diff or file mtime diff against previous iteration
- T1-10.3: Load affected-graph from `affected-graph.json` (built by T1-11)
- T1-10.4: Map changed files to affected gates:
  - `*.css` / tailwind classes → design-qa + visual-smoke only
  - Single screen → that route + interactions + forms + modals
  - Layout component → ALL routes + nav-state
  - Router config → ALL routes + nav-state
  - Form component → ALL forms
  - Modal component → ALL modals
- T1-10.5: Emit `delta-map.json` with `affected_gates[]` + `affected_routes[]` + `affected_checks[]`
- T1-10.6: Conservative fallback: if ambiguous → mark ALL gates affected

**Deliverable:** Working script
**ETA:** 1 day

#### T1-11: `scripts/build-affected-graph.ts`
**Purpose:** Build route→file→check dependency graph

**Subtasks:**
- T1-11.1: Parse all `src/screens/**/*.tsx` imports
- T1-11.2: Parse `src/routes.tsx` for route→screen mapping
- T1-11.3: Parse `src/components/layout/**/*.tsx` for layout→route mapping
- T1-11.4: Parse `src/components/ui/**/*.tsx` for DS component usage
- T1-11.5: Build graph: `file → routes[] → checks[]`
- T1-11.6: Write `affected-graph.json` to `<runRoot>/`

**Deliverable:** Working script
**ETA:** 1 day

#### T1-12: `scripts/install-deps.ts`
**Purpose:** `npm install` in appRoot with error handling

**Subtasks:**
- T1-12.1: Accept `--app-root` argument
- T1-12.2: Run `npm install` with `--legacy-peer-deps` fallback
- T1-12.3: Handle network errors, peer dep conflicts
- T1-12.4: Return exit code + timing

**Deliverable:** Working script
**ETA:** 2 hours

#### T1-13: `scripts/fetch-guidelines-web.ts`
**Purpose:** Crawl guidelines website

**Subtasks:**
- T1-13.1: Accept `--url`, `--out-dir`
- T1-13.2: Use `node-fetch` + `cheerio` to scrape
- T1-13.3: Classify paragraphs into 7 topics (brand, voice, ux-principles, accessibility, content, motion, layout)
- T1-13.4: Emit 7 `.md` files + confidence scores

**Deliverable:** Working script
**ETA:** 1 day

#### T1-14: `scripts/parse-guidelines-repo.ts`
**Purpose:** Parse inline docs from DS repo

**Subtasks:**
- T1-14.1: Accept `--repo-root`, `--out-dir`
- T1-14.2: Walk `docs/`, `guidelines/`, `brand/`, `*.mdx`, `README.md`, `CONTRIBUTING.md`
- T1-14.3: Classify paragraphs into 7 topics
- T1-14.4: Emit 7 `.md` files

**Deliverable:** Working script
**ETA:** 1 day

#### T1-15: `scripts/generate-guidelines-fallback.ts`
**Purpose:** Infer guidelines from component index

**Subtasks:**
- T1-15.1: Accept `--index`, `--tokens`, `--out-dir`
- T1-15.2: Use heuristics to infer brand colors, voice tone, layout spacing from tokens
- T1-15.3: Every claim cites a component/token/source snippet
- T1-15.4: Emit 7 `.md` files with `inferred: true` frontmatter

**Deliverable:** Working script
**ETA:** 1 day

#### T1-16: `scripts/extract-tokens.ts` + `scripts/extract-icons.ts`
**Purpose:** Normalize tokens and icons from adapter

**Subtasks:**
- T1-16.1: `extract-tokens.ts` — read adapter.tokenFiles, normalize to `tokens.json` schema
- T1-16.2: `extract-icons.ts` — read adapter.iconPackage, enumerate icon names

**Deliverable:** Working scripts
**ETA:** 4 hours

---

## Phase 2: SQLite State Store (P0 — Replaces File-Based Checkpoints)

### P0-3: SQLite Database for State Management
**Issue:** #11 — 21 checkpoint files  
**Original Solution:** S14 — Append-only JSONL log (Score: 8/10)  
**Opus Rating:** 8/10 — "Better: Local SQLite Database via MCP. Agents can execute SQL via tools. Query exactly what they need."  
**Final Approach:** SQLite at `.monolith/state.db` with MCP-compatible SQL interface

**Tasks:**

#### T2-1: Design SQLite Schema
```sql
-- Runs table
CREATE TABLE runs (
  run_id TEXT PRIMARY KEY,
  brief TEXT NOT NULL,
  app_name TEXT NOT NULL,
  status TEXT CHECK(status IN ('active','completed','aborted')),
  created_at INTEGER,
  completed_at INTEGER
);

-- Checkpoints table (replaces 21 JSON files)
CREATE TABLE checkpoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  attempt INTEGER DEFAULT 1,
  summary_json TEXT NOT NULL,
  produced_at INTEGER,
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

-- Artifacts table (replaces 16+ markdown files — stores structured JSON)
CREATE TABLE artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  content_md TEXT, -- rendered markdown (lazy)
  version INTEGER DEFAULT 1,
  created_at INTEGER,
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

-- Issues table (for self-healing loops)
CREATE TABLE issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  gate TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  severity TEXT CHECK(severity IN ('blocker','major','minor')),
  category TEXT,
  location_file TEXT,
  location_line INTEGER,
  observation TEXT,
  suggested_fix TEXT,
  status TEXT CHECK(status IN ('open','fixed','waived')) DEFAULT 'open',
  FOREIGN KEY (run_id) REFERENCES runs(run_id)
);

-- Fingerprints table (for stage skipping)
CREATE TABLE fingerprints (
  run_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_hash TEXT,
  skipped BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (run_id, phase)
);

-- Patterns table (append-only log)
CREATE TABLE patterns (
  slug TEXT PRIMARY KEY,
  content_json TEXT NOT NULL,
  content_md TEXT,
  created_at INTEGER,
  created_by_run TEXT,
  reused_count INTEGER DEFAULT 0,
  last_reused_run TEXT
);

-- Cache table (content-addressable)
CREATE TABLE cache (
  cache_key TEXT PRIMARY KEY,
  cache_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at INTEGER,
  accessed_at INTEGER,
  access_count INTEGER DEFAULT 0
);

-- Server state table (for persistent dev server tracking)
CREATE TABLE server_state (
  run_id TEXT PRIMARY KEY,
  pid INTEGER,
  url TEXT,
  status TEXT CHECK(status IN ('running','stopped','crashed')),
  started_at INTEGER
);
```

**Deliverable:** `scripts/init-db.ts` that creates schema
**ETA:** 1 day

#### T2-2: Implement `scripts/db-client.ts`
**Purpose:** Unified database client for all scripts and agents

**Subtasks:**
- T2-2.1: Wrap `better-sqlite3` with typed interface
- T2-2.2: Methods: `getCheckpoint(runId, phase)`, `setCheckpoint(...)`, `getArtifact(...)`, `setArtifact(...)`, `getIssues(...)`, `addIssue(...)`, `getFingerprint(...)`, `setFingerprint(...)`
- T2-2.3: Auto-migrate on version change
- T2-2.4: Connection pooling (SQLite is single-writer, but we can queue)

**Deliverable:** Working client module
**ETA:** 1 day

#### T2-3: Migrate agent specs to use DB instead of files
**Subtasks:**
- T2-3.1: Update `checkpoint-discipline.md` — Rule 23 now references DB, not JSON files
- T2-3.2: Update `orchestrator.md` — orchestrator reads/writes checkpoints via DB client
- T2-3.3: Update all agent frontmatter `reads:` / `writes:` to use DB paths or keep file paths as secondary
- T2-3.4: Add `scripts/render-artifact.ts` — converts DB JSON to `.md` for human review at G2/G3

**Deliverable:** Updated rules + orchestrator + agents
**ETA:** 2 days

---

## Phase 3: Parallel Planning + Unified QA (P1 — Biggest Wins)

### P1-4: Unified Orchestrator with Parallel Tool Calling
**Issue:** #1 — 25+ agents sequential  
**Original Solution:** S1 — Three-track DAG parallel planning (Score: 8/10)  
**Opus Rating:** 8/10 — "Better: Unified Orchestrator with Parallel Tool Calling. Single Planning Director agent with async tools. Harness handles concurrency limits."  
**Final Approach:** Single orchestrator that invokes parallel tool calls, not parallel agent spawns

**Tasks:**

#### T3-1: Redesign orchestrator as "Planning Director"
**Subtasks:**
- T3-1.1: Rewrite `orchestrator.md` — it no longer "invokes agents" but "orchestrates tool calls"
- T3-1.2: Define tool schema:
  - `run_research_track(brief, guidelines, market_research) → research.md`
  - `run_pm_track(research, guidelines) → prd.md`
  - `run_ux_strategy_track(research, prd, market_research) → differentiation-map.md`
  - `run_architecture_track(prd, differentiation_map, guidelines) → IA + user_flow`
  - `run_design_track(IA, differentiation_map, guidelines, ds_knowledge) → design_decisions`
  - `run_critique_track(design_decisions, differentiation_map) → critique + audit`
  - `run_specs_track(design_decisions, IA, guidelines) → build_specs`
- T3-1.3: Track A (Discovery): `run_research_track` + `run_pm_track` + `run_ux_strategy_track` in parallel
- T3-1.4: Track B (Architecture): waits for Track A, then `run_architecture_track` + `run_design_track` in parallel (design can start early with IA draft)
- T3-1.5: Track C (Quality): waits for Track B, then `run_critique_track` in parallel with `run_specs_track`
- T3-1.6: Convergence check: verify all tracks have compatible outputs before G2
- T3-1.7: Add `convergence_errors[]` — if tracks conflict, surface at G2

**Deliverable:** Updated `orchestrator.md` + new tool definitions
**ETA:** 2 days

#### T3-2: Batch DS Extension Judging
**Issue:** #5 — Interleaved extension ruling  
**Original Solution:** S5 — Batch judging (Score: 10/10)  
**Opus Rating:** 10/10 — "Batch processing is significantly faster"  
**Final Approach:** Already optimal — implement as specified

**Subtasks:**
- T3-2.1: Update `lead-designer.md` — emit ALL extension requests in one `requests[]` array
- T3-2.2: Update `ds-extension-judge.md` — accept `requests[]`, emit `rulings[]`
- T3-2.3: Update `orchestrator.md` — invoke judge once per design round
- T3-2.4: `lead-designer` receives all rulings at once, revises all in one pass

**Deliverable:** Updated agent specs
**ETA:** 4 hours

#### T3-3: Parallel Design Critique
**Issue:** #5 — Sequential principal + aesthetic  
**Original Solution:** S6 — Parallel critique (Score: 10/10)  
**Opus Rating:** 10/10 — "Batch processing design rule checks is significantly faster"  
**Final Approach:** Already optimal — implement as specified

**Subtasks:**
- T3-3.1: Update `orchestrator.md` — invoke `design-principal` and `aesthetic-director` in parallel
- T3-3.2: Add `merge_critiques(critique, audit) → unified_revision_brief` tool
- T3-3.3: Round 2: both re-review in parallel

**Deliverable:** Updated orchestrator
**ETA:** 2 hours

### P1-5: Unified Smart QA with Delta-Testing
**Issue:** #2 — 5 sequential QA loops  
**Original Solution:** S3 — Unified loop + delta-testing (Score: 9/10)  
**Opus Rating:** 9/10 — "Better: Native Git Diff + Affected Graph Integration. Feed git diff into QA prompt. LLM inherently understands delta."  
**Final Approach:** Merge both — use delta-map.ts for machine-level routing, but ALSO feed git diff into self-healer for context

**Tasks:**

#### T3-4: Unified QA Loop Architecture
**Subtasks:**
- T3-4.1: Update `orchestrator.md` — QA stages are no longer sequential:
  ```
  Iteration 1 (FULL):
    dev-qa ‖ production-readiness ‖ runtime-inspector ‖ design-qa ‖ commercial-auditor
    → aggregate all issues[] → self-healer merges → ONE patch
  
  Iteration 2+ (DELTA):
    delta-map.ts computes affected gates
    → run only affected gates in parallel
    → aggregate → patch
  ```
- T3-4.2: Update `self-healer.md` — reads issues from ALL gates, groups by file+category, deduplicates, writes ONE brief
- T3-4.3: Update `developer.md` — patch mode now addresses issues from multiple gates simultaneously
- T3-4.4: Add `affected_gates` to checkpoint schema

**Deliverable:** Updated orchestrator + self-healer + developer
**ETA:** 2 days

#### T3-5: Delta-Testing Integration
**Subtasks:**
- T3-5.1: `delta-map.ts` (T1-10) runs after every patch
- T3-5.2: Feeds `git diff HEAD~1 --name-only` + `affected-graph.json` into routing logic
- T3-5.3: Emits `delta-map.json` with `affected_gates[]`
- T3-5.4: Orchestrator reads delta-map, skips unaffected gates
- T3-5.5: **NEW (Opus suggestion):** Self-healer ALSO receives `git diff` as context — LLM can spot semantic impacts the graph misses
- T3-5.6: Conservative fallback: if delta-map is ambiguous → run ALL gates

**Deliverable:** Working delta-testing system
**ETA:** 1 day

---

## Phase 4: Harness-Native Optimizations (P1 — IDE Integration)

### P1-6: Harness-Native Context & Search
**Issue:** #14 — Full context re-read per agent (30K–80K tokens)  
**Original Solution:** S8 — Summarization + RAG (Score: 5/10)  
**Opus Rating:** 5/10 — "Better: IDE Workspace Context Leverage. Cursor and Claude Code already index the workspace. Use @codebase or file-search tools."  
**Final Approach:** **Drop custom RAG entirely.** Use harness-native file search + compact summaries.

**Tasks:**

#### T4-1: Replace Custom RAG with Harness-Native Search
**Subtasks:**
- T4-1.1: **REMOVE** `scripts/build-embeddings.ts` from plan (custom RAG is overkill)
- T4-1.2: Update `phase-manifest-discipline.md` — agents use `search:` instead of `retrieve:`:
  ```yaml
  reads:
    summary:
      - checkpoint: 14-build-specs
      - checkpoint: 15-pattern-decisions
    search:
      - "screen components for /strategies"
      - "token applications accent color"
  ```
- T4-1.3: The harness (Cursor/Claude Code) handles the search using its native workspace index
- T4-1.4: Agents STILL get compact summaries (≤1K tokens) for structure, but rely on harness search for details
- T4-1.5: Remove all embedding model dependencies from `package.json`

**Deliverable:** Updated rules + agent specs
**ETA:** 1 day

### P1-7: Harness-Native Web Search
**Issue:** #10 — Market research web fetches  
**Original Solution:** S13 — Parallel fetch with streaming (Score: 8/10)  
**Opus Rating:** 8/10 — "Better: Harness-Native Web Search Tools. Cursor and Claude natively integrate with API-level search."  
**Final Approach:** **Prefer harness web search, fallback to custom fetch**

**Tasks:**

#### T4-2: Update `market-researcher.md` to Use Native Web Tools
**Subtasks:**
- T4-2.1: Rewrite market-researcher prompt: "Use web_search tool to find competitor landing pages, pricing, and product tours"
- T4-2.2: Add fallback: "If web_search is unavailable, invoke `scripts/fetch-competitor.ts`"
- T4-2.3: Remove `cheerio` from critical path (keep as fallback dependency)
- T4-2.4: Cache results in `.monolith-cache/web/` regardless of source

**Deliverable:** Updated `market-researcher.md`
**ETA:** 4 hours

### P1-8: Harness-Native Browser Tools (Replaces Playwright Management)
**Issue:** #3 — Playwright runtime sweep  
**Original Solution:** S10 — Incremental runtime testing (Score: 8/10)  
**Opus Rating:** 8/10 — "Better: Leverage Native MCP Browser Tools. Cursor and Claude support native Computer Use or MCP-backed browser tools."  
**Final Approach:** **Use MCP browser tools when available, fallback to Playwright**

**Tasks:**

#### T4-3: MCP Browser Integration
**Subtasks:**
- T4-3.1: Add MCP config `.cursor/mcp.json` or `.claude/mcp.json`:
  ```json
  {
    "mcpServers": {
      "browser": {
        "command": "npx",
        "args": ["@anthropic/mcp-browser"]
      }
    }
  }
  ```
- T4-3.2: Update `runtime-inspector.md` — "Use browser_navigate, browser_click, browser_screenshot tools when available"
- T4-3.3: Add fallback: "If MCP browser unavailable, use Playwright via `scripts/runtime-sweep.ts`"
- T4-3.4: Update `orchestrator.md` to detect MCP availability at start of run

**Deliverable:** MCP config + updated agent specs
**ETA:** 1 day

---

## Phase 5: Intelligent Caching + Stage Skipping (P1)

### P1-9: Content-Addressable Cache
**Issue:** #13 — No stage skipping  
**Original Solution:** S15 — Input fingerprinting (Score: 10/10)  
**Opus Rating:** 10/10 — "Mathematically correct way to handle idempotency"  
**Final Approach:** Already optimal — implement as specified, backed by SQLite cache table

**Tasks:**

#### T5-1: Implement Cache Layer
**Subtasks:**
- T5-1.1: `scripts/cache.ts` — unified cache client using SQLite `cache` table
- T5-1.2: `getCache(key) → filePath | null`
- T5-1.3: `setCache(key, type, filePath)`
- T5-1.4: `invalidateCache(type)`
- T5-1.5: LRU eviction — delete oldest entries when cache exceeds 1GB

**Deliverable:** Working cache module
**ETA:** 4 hours

#### T5-2: Implement Stage Fingerprinting
**Subtasks:**
- T5-2.1: `scripts/fingerprint.ts` — compute SHA-256 of stage inputs
- T5-2.2: Per-stage fingerprint functions:
  - `fingerprintTriage(brief, env, constraints)`
  - `fingerprintDsIndexer(inputManifest, adapter, repoHead)`
  - `fingerprintGuidelines(inputManifest, sourceFiles, urlContent)`
  - `fingerprintResearcher(brief, marketResearch, competitiveSynthesis, guidelines)`
  - `fingerprintTheming(inputManifest, dsKnowledge, themeInputs)`
- T5-2.3: Orchestrator checks fingerprint before invoking agent
- T5-2.4: If match → copy cached outputs, skip agent, log skip
- T5-2.5: If miss → run agent, store fingerprint + outputs

**Deliverable:** Working fingerprint system
**ETA:** 1 day

#### T5-3: Multi-Tier Cache Integration
**Subtasks:**
- T5-3.1: Tier 1 — DS Knowledge Cache: `hash(adapter + repoHead)`
- T5-3.2: Tier 2 — Guidelines Cache: `hash(sourceFiles + urlContent)`
- T5-3.3: Tier 3 — Research Cache: `hash(brief + domain)`, TTL 7 days
- T5-3.4: Tier 4 — Pattern Cache: always read from DB
- T5-3.5: Tier 5 — Build Cache: reuse Vite `.vite/cache`

**Deliverable:** All tiers working
**ETA:** 1 day

---

## Phase 6: Dev Server + Build Optimizations (P1)

### P1-10: Ephemeral Bound-Lifecycle Dev Server
**Issue:** #7 — Dev server boot on every patch  
**Original Solution:** S9 — Persistent dev server with HMR (Score: 7/10)  
**Opus Rating:** 7/10 — "Better: Ephemeral Bound-Lifecycle Servers. Bind PID to agent with tree-kill. Use Vite createServer() programmatically."  
**Final Approach:** **Use Vite programmatic API with aggressive in-memory caching**

**Tasks:**

#### T6-1: Rewrite `start-dev-server.ts` to Use Vite Programmatic API
**Subtasks:**
- T6-1.1: Use `import { createServer } from 'vite'` instead of spawning `npm run dev`
- T6-1.2: Create Vite server in-process:
  ```typescript
  import { createServer } from 'vite';
  const server = await createServer({ root: appRoot });
  await server.listen();
  const url = server.resolvedUrls?.local[0];
  ```
- T6-1.3: Bind server lifecycle to script process — when script exits, server dies automatically
- T6-1.4: Use `tree-kill` on the script PID to guarantee cleanup
- T6-1.5: Store server URL in SQLite `server_state` table
- T6-1.6: Healthcheck via `fetch(url)` with retry

**Deliverable:** Working script using programmatic Vite
**ETA:** 1 day

#### T6-2: Aggressive In-Memory Build Cache
**Subtasks:**
- T6-2.1: Configure Vite `cacheDir` to `<workspaceRoot>/.monolith-cache/vite/` (shared across runs)
- T6-2.2: Enable `optimizeDeps.force: false` (default)
- T6-2.3: Copy `.vite/cache` from previous run before first build
- T6-2.4: Vite's own HMR handles patch updates — no rebuild needed for dev-qa static checks

**Deliverable:** Fast subsequent builds
**ETA:** 4 hours

### P1-11: Lazy Playwright with System Browser
**Issue:** #8 — Playwright download per run  
**Original Solution:** S11 — Global cache + system browser (Score: 10/10)  
**Opus Rating:** 10/10 — "Standardizing on system Chromium is exactly how local dev should operate"  
**Final Approach:** Already optimal — implement as specified

**Tasks:**

#### T6-3: Implement Browser Resolution Strategy
**Subtasks:**
- T6-3.1: `scripts/resolve-browser.ts` — check in order:
  1. `PLAYWRIGHT_CHROMIUM_PATH` env var
  2. Global cache: `~/.cache/ms-playwright/chromium-*/chrome-linux/chrome`
  3. System Chrome: `which google-chrome || which chromium || which chromium-browser`
  4. System Edge: `which microsoft-edge`
  5. Fallback: `npx playwright install chromium --with-deps --only-shell`
- T6-3.2: If dev-qa BUILD/SERVER failed → skip Playwright entirely (runtime-inspector cannot run)
- T6-3.3: Export resolved path for `runtime-sweep.ts` and `axe-run.ts`

**Deliverable:** Working browser resolution
**ETA:** 4 hours

---

## Phase 7: Artifact & I/O Optimizations (P2)

### P2-12: Machine-First Artifacts with Lazy Render
**Issue:** #9 — 16+ large markdown artifacts  
**Original Solution:** S12 — Machine-first JSON + render layer (Score: 9/10)  
**Opus Rating:** 9/10 — "JSON uses fewer tokens. Better: Ephemeral/Virtual Artifacts. Don't write 16 files. Maintain state in SQLite. Only render markdown on explicit request."  
**Final Approach:** **SQLite as primary store, markdown rendered lazily**

**Tasks:**

#### T7-1: Artifact Storage in SQLite
**Subtasks:**
- T7-1.1: All planning artifacts stored as JSON in `artifacts` table
- T7-1.2: `artifact_type` enum: `research`, `prd`, `ia`, `user_flow`, `design_decisions`, `best_practices`, `critique`, `aesthetic_audit`, `ux_writing`, `build_specs`, `pattern_decisions`, `commercial_audit`, `delivery`
- T7-1.3: `content_json` is the source of truth
- T7-1.4: `content_md` is NULL by default (lazy render)

**Deliverable:** Artifacts stored in DB
**ETA:** 4 hours

#### T7-2: Lazy Markdown Render
**Subtasks:**
- T7-2.1: `scripts/render-artifact.ts --type <type> --run-id <id> --out <path>`
- T7-2.2: Reads JSON from DB, renders to pretty markdown using templates
- T7-2.3: Orchestrator calls render before G2 and G3 ONLY
- T7-2.4: User can request explicit export: `/monolith export research` → writes `research.md`

**Deliverable:** Working render script
**ETA:** 1 day

#### T7-3: Competitive Synthesis Inline
**Issue:** #18 — Redundant competitive-synthesizer  
**Original Solution:** S18 — Inline synthesis (Score: 10/10)  
**Opus Rating:** 10/10 — "Combining redundant synthesis steps is always optimal"  
**Final Approach:** Already optimal — implement as specified

**Subtasks:**
- T7-3.1: Remove `competitive-synthesizer.md` agent file
- T7-3.2: Update `market-researcher.md` — emit mandatory "Synthesis" appendix
- T7-3.3: Update downstream agents to read synthesis from `market-research.md § Synthesis`
- T7-3.4: Remove `docs/competitive-synthesis.md` from artifact list

**Deliverable:** Updated agent specs
**ETA:** 2 hours

---

## Phase 8: Human-in-the-Loop Optimizations (P2)

### P2-13: Optimistic Git Branching for Approval Gates
**Issue:** #4 — 3 blocking approval gates  
**Original Solution:** S7 — Async stream with auto-continue (Score: 6/10)  
**Opus Rating:** 6/10 — "Background threading in CLI is messy. Better: Optimistic Branching (Git-Flow). Commit plan, create feature branch, start coding. User reviews plan at leisure."  
**Final Approach:** **Git-based optimistic branching instead of background threading**

**Tasks:**

#### T8-1: Git Integration for G2
**Subtasks:**
- T8-1.1: At G2, orchestrator:
  1. Commits all planning docs to `main` (or current branch)
  2. Creates branch `monolith/<runId>/implementation`
  3. Checks out the new branch
  4. Starts `pattern-decider` → `developer` → QA loops on the branch
- T8-1.2: Shows user: "Plan committed to main. Implementation running on branch `monolith/<runId>/implementation`. Reply to approve, iterate, or abort."
- T8-1.3: User replies:
  - `"ok"` → merge branch to main, proceed to G3
  - `"iterate on prd"` → abort branch, user edits plan on main, re-run from PM
  - `"abort"` → delete branch, keep plan on main for reference
- T8-1.4: No background threading — the agent simply works on a branch

**Deliverable:** Updated `orchestrator.md` + `rules/approval-gate-rules.md`
**ETA:** 1 day

#### T8-2: Auto-Approve G3 with Opt-Out Window
**Subtasks:**
- T8-2.1: After QA converges, show DELIVERY.md summary
- T8-2.2: Auto-mark complete after 5-minute window unless user says "iterate"
- T8-2.3: Branch is merged to main automatically
- T8-2.4: Phase 2 handoff command printed

**Deliverable:** Updated approval gate rules
**ETA:** 4 hours

---

## Phase 9: Checkpoint & Pattern Optimizations (P2)

### P2-14: Checkpoint Compression
**Issue:** #11 — 21 checkpoint files  
**Original Solution:** S14 — Append-only JSONL (Score: 8/10)  
**Opus Rating:** 8/10 — "Better: SQLite."  
**Final Approach:** **Already solved by T2 (SQLite state store). Checkpoints live in `checkpoints` table.**

**No additional work needed — SQLite replaces all checkpoint I/O.**

### P2-15: Lazy Pattern Indexing
**Issue:** #17 — Pattern memory I/O  
**Original Solution:** S17 — Append-only log (Score: 10/10)  
**Opus Rating:** 10/10 — "Optimal path"  
**Final Approach:** Already optimal — implement as specified, backed by SQLite

**Tasks:**

#### T9-1: Pattern Storage in SQLite
**Subtasks:**
- T9-1.1: `patterns` table (already in T2 schema)
- T9-1.2: `pattern-decider` reads from DB directly
- T9-1.3: `design-qa` writes new patterns to DB
- T9-1.4: `INDEX.md` regenerated only when user requests `/monolith list-patterns`

**Deliverable:** Patterns in DB
**ETA:** 2 hours

---

## Phase 10: Model Routing & Minor Optimizations (P3)

### P3-16: IDE-Native Task Routing
**Issue:** #12 — Model tier inefficiency  
**Original Solution:** Implicit — use smaller models for deterministic tasks  
**Opus Rating:** 9/10 — "Better: IDE-Native Task Routing. Pass complexity_score. Let harness decide model."  
**Final Approach:** Add `complexity_score` to agent/tool calls, let harness route

**Tasks:**

#### T10-1: Add Complexity Scoring
**Subtasks:**
- T10-1.1: Update `orchestrator.md` — every tool call includes `complexity_score`:
  - `triage`: 1 (deterministic classification)
  - `ds-indexer`: 1 (script invocation)
  - `guidelines-resolver`: 2 (structured normalization)
  - `market-researcher`: 3 (web search + synthesis)
  - `researcher`: 4 (domain inference + gap filling)
  - `product-manager`: 4 (commercial lens + trade-offs)
  - `ux-strategist`: 4 (differentiation bets)
  - `ux-architect`: 3 (IA + flows)
  - `lead-designer`: 4 (component selection + token application)
  - `design-principal`: 4 (taste + judgment)
  - `aesthetic-director`: 4 (visual fingerprint audit)
  - `ux-writer`: 3 (copy rewrite)
  - `engineering-manager`: 3 (file tree + state model)
  - `pattern-decider`: 2 (decision tree)
  - `developer`: 4 (code generation)
  - `dev-qa`: 1 (deterministic gates — now mostly scripts)
  - `runtime-inspector`: 1 (Playwright sweep — now mostly scripts)
  - `design-qa`: 3 (visual critique)
  - `commercial-auditor`: 3 (commercial surfaces)
  - `self-healer`: 3 (issue grouping + patch brief)
- T10-1.2: The harness (Cursor/Claude Code) uses its native router to pick model tier
- T10-1.3: No hardcoded model names anywhere (already done)

**Deliverable:** Updated orchestrator with complexity scores
**ETA:** 4 hours

### P3-17: Structured Deliverable Tally
**Issue:** #19 — Tally overhead  
**Original Solution:** S19 — Structured metadata (Score: 10/10)  
**Opus Rating:** 10/10  
**Final Approach:** Already optimal — implement as specified

**Subtasks:**
- T10-2.1: Remove tally generation from all agent prompts
- T10-2.2: Orchestrator computes tally from DB: `SELECT COUNT(*) FROM artifacts WHERE run_id = ?`
- T10-2.3: Tally displayed by orchestrator, not generated by agents

**Deliverable:** Updated agents + orchestrator
**ETA:** 1 hour

---

## Phase 11: Sync & Validation (P0 — Final Step)

### P0-18: Run sync-skills.js + End-to-End Validation
**Tasks:**

#### T11-1: Run sync script
```bash
node sync-skills.js
```

**Deliverable:** All 9 editor folders updated
**ETA:** 30 seconds

#### T11-2: Verify zero model references
```bash
grep -r "model: (sonnet|opus|haiku)" src/monolith/ .opencode/ .cursor/ .trae/ || echo "Clean"
```

**Deliverable:** Clean grep
**ETA:** 10 seconds

#### T11-3: TypeScript compilation
```bash
npx tsc --noEmit
```

**Deliverable:** Zero errors
**ETA:** 10 seconds

#### T11-4: Smoke test on example brief
```bash
/monolith build "test product" --ds-repo ./fixtures/test-ds --lazy --stream-gates
```

**Deliverable:** Run completes, all agents invoked, no crashes
**ETA:** 10–15 minutes

---

## Consolidated Task List by Priority

### P0 (Foundation — Week 1)
| ID | Task | ETA | Blocked By |
|---|---|---|---|
| T0-1 | Create `package.json` + `tsconfig.json` | 1h | — |
| T0-2 | Install deps, verify compilation | 20m | T0-1 |
| T1-1 | `index-ds-repo.ts` | 2–3d | T0-2 |
| T1-2 | `index-ds-mcp.ts` | 1d | T0-2 |
| T1-3 | `scaffold-app.ts` | 2d | T0-2 |
| T1-4 | `validate-generated.ts` | 2d | T0-2 |
| T1-5 | `axe-run.ts` | 1d | T0-2 |
| T1-6 | `runtime-sweep.ts` | 2–3d | T0-2 |
| T1-7 | `start-dev-server.ts` | 4h | T0-2 |
| T1-8 | `stop-dev-server.ts` | 2h | T0-2 |
| T1-9 | `visual-smoke.ts` | 4h | T0-2 |
| T1-10 | `delta-map.ts` | 1d | T1-11 |
| T1-11 | `build-affected-graph.ts` | 1d | T0-2 |
| T1-12 | `install-deps.ts` | 2h | T0-2 |
| T1-13 | `fetch-guidelines-web.ts` | 1d | T0-2 |
| T1-14 | `parse-guidelines-repo.ts` | 1d | T0-2 |
| T1-15 | `generate-guidelines-fallback.ts` | 1d | T0-2 |
| T1-16 | `extract-tokens.ts` + `extract-icons.ts` | 4h | T0-2 |
| T2-1 | SQLite schema design | 1d | T0-2 |
| T2-2 | `db-client.ts` | 1d | T2-1 |
| T2-3 | Migrate agents to DB | 2d | T2-2 |

### P1 (Big Wins — Week 2–3)
| ID | Task | ETA | Blocked By |
|---|---|---|---|
| T3-1 | Unified orchestrator with parallel tools | 2d | T2-3 |
| T3-2 | Batch extension judging | 4h | T3-1 |
| T3-3 | Parallel design critique | 2h | T3-1 |
| T3-4 | Unified QA loop architecture | 2d | T1-4, T1-6, T2-3 |
| T3-5 | Delta-testing integration | 1d | T1-10, T3-4 |
| T4-1 | Harness-native search (drop custom RAG) | 1d | T2-3 |
| T4-2 | Harness-native web search | 4h | T4-1 |
| T4-3 | MCP browser integration | 1d | T1-6 |
| T5-1 | Cache layer implementation | 4h | T2-2 |
| T5-2 | Stage fingerprinting | 1d | T5-1 |
| T5-3 | Multi-tier cache integration | 1d | T5-2 |
| T6-1 | Vite programmatic API server | 1d | T1-7 |
| T6-2 | In-memory build cache | 4h | T6-1 |
| T6-3 | Browser resolution strategy | 4h | T1-6 |

### P2 (Medium Wins — Week 3–4)
| ID | Task | ETA | Blocked By |
|---|---|---|---|
| T7-1 | Artifact storage in SQLite | 4h | T2-2 |
| T7-2 | Lazy markdown render | 1d | T7-1 |
| T7-3 | Inline competitive synthesis | 2h | T7-2 |
| T8-1 | Git branching for G2 | 1d | T3-1 |
| T8-2 | Auto-approve G3 | 4h | T8-1 |
| T9-1 | Pattern storage in SQLite | 2h | T2-2 |

### P3 (Polish — Week 4)
| ID | Task | ETA | Blocked By |
|---|---|---|---|
| T10-1 | Complexity scoring | 4h | T3-1 |
| T10-2 | Structured tally | 1h | T2-3 |
| T11-1 | Run sync-skills.js | 30s | ALL |
| T11-2 | Verify clean model refs | 10s | T11-1 |
| T11-3 | TypeScript compilation | 10s | T11-1 |
| T11-4 | Smoke test | 15m | T11-3 |

---

## Expected Outcome

After full implementation:

| Metric | Before (v3.2) | After (v3.3) | Improvement |
|---|---|---|---|
| Agent invocations (best case) | ~22 | ~14 | **–36%** |
| Agent invocations (realistic) | ~40 | ~18 | **–55%** |
| Agent invocations (worst case) | ~80 | ~30 | **–62%** |
| QA loop time | 20–60 min | 6–15 min | **–75%** |
| Dev server boots | 10+ | 1 | **–90%** |
| Script execution | 30–60s each (agent) | <1s each (compiled) | **–99%** |
| Planning layer time | 15–30 min | 5–10 min | **–65%** |
| Human gate idle time | Unbounded | ~0 min | **–100%** |
| Context tokens per agent | 30K–80K | 3K–8K | **–75%** |
| Files written per run | 30+ | 5–10 (DB primary) | **–80%** |
| **Total runtime (realistic)** | **60–90 min** | **12–20 min** | **–80%** |
| **Total runtime (cached re-run)** | **60–90 min** | **5–10 min** | **–90%** |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| SQLite corruption on abrupt exit | Low | WAL mode + regular backups |
| MCP browser tools unavailable | Medium | Always maintain Playwright fallback |
| Harness doesn't support complexity_score | Medium | Graceful fallback to default model |
| Git branching conflicts with user repo | Low | Use dedicated `monolith/` branch prefix |
| Delta-testing misses critical issue | Low | Conservative fallback to full sweep |
| Vite programmatic API incompatible with some configs | Low | Fallback to `npm run dev` spawn |
| Rate limits on parallel tool calls | Medium | Implement exponential backoff + queue |

---

## Success Criteria

1. ✅ `npx tsc --noEmit` passes with zero errors
2. ✅ `node sync-skills.js` completes without errors
3. ✅ Zero `model:` references in any agent file
4. ✅ A full run completes in <20 minutes on a representative brief
5. ✅ All 5 QA gates still execute with full coverage
6. ✅ All 3 approval gates still exist (G2 uses Git branching)
7. ✅ Production-grade mandate still enforced (no dead buttons, all routes render)
8. ✅ DS-First Mandate unchanged (no custom components without ruling)
9. ✅ Same outputs for same inputs (deterministic)
10. ✅ User can still `--no-cache`, `--no-skip`, force blocking gates
