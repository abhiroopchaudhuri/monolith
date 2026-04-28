# Monolith Skill — Performance Optimization Solutions

> **Date:** 2026-04-28  
> **Skill Version:** v3.2 → v3.3-proposed  
> **Scope:** Research-backed, quality-preserving solutions for every performance bottleneck identified in `MONOLITH-PERFORMANCE-ISSUES.md`.  
> **Constraint:** Zero reduction in agent quality, output thoroughness, or production-grade mandate.

---

## Executive Summary

The Monolith skill's runtime can be reduced by **60–80%** without quality loss through five architectural shifts:

1. **Parallelize the planning layer** — 9 sequential agents → 3 parallel tracks
2. **Implement deterministic scripts** — Replace 14 AI-driven stubs with compiled TS
3. **Unified QA with delta-testing** — One smart loop instead of 5 sequential loops
4. **Intelligent caching tier** — Cross-run persistence for DS, research, guidelines, patterns
5. **Async approval gates** — Non-blocking G2/G3 with automatic continuation

These changes are inspired by production CI/CD pipelines, modern build systems (Bazel, Nx), incremental compilation strategies, and agent orchestration research from platforms like LangGraph, CrewAI, and AutoGen.

---

## Solution 1: Parallelize the Planning Layer (Critical — saves 15–30 min)

### Problem
Stages 4–12 are strictly sequential: researcher → PM → ux-strategist → ux-architect → lead-designer ↔ ds-extension-judge → design-principal → aesthetic-director → ux-writer → engineering-manager.

### Research Basis
Modern agent orchestration frameworks (LangGraph, CrewAI, AutoGen) use **DAG-based execution** where agents run in parallel when no data dependency exists. The key insight: many planning outputs are independent or only weakly dependent.

### Solution: Three-Track Parallel Planning

Restructure planning into three parallel tracks that converge at G2:

```
Track A — Discovery (parallel):
  researcher ─┬─→ product-manager
              └─→ ux-strategist

Track B — Architecture (parallel, starts after Track A delivers):
  ux-architect ─┬─→ lead-designer
                └─→ engineering-manager (early)

Track C — Design Quality (parallel, starts after lead-designer delivers):
  ds-extension-judge (batch mode) ─┬─→ design-principal
                                   └─→ aesthetic-director
  ux-writer (starts after design-principal Round 1)

Convergence:
  All tracks → G2 checkpoint
```

**Why this preserves quality:**
- `researcher` output is the only dependency for `product-manager` and `ux-strategist` — they can read the same research.md in parallel
- `ux-architect` only needs PRD + differentiation-map — both available after Track A
- `lead-designer` needs IA + differentiation-map — both available
- `engineering-manager` can start drafting file tree and routes from IA + PRD before design decisions are final; final specs are reconciled at convergence
- `ds-extension-judge` processes ALL extension requests in ONE batch (see Solution 5)
- `design-principal` and `aesthetic-director` both read `design_decisions.md` — they can run in parallel, then their critiques are merged by the orchestrator
- `ux-writer` needs the final approved design — starts after design-principal Round 1

**Implementation:**
1. Update `orchestrator.md` §Parallelization Policy to declare three planning tracks
2. Add `track: A|B|C` to each agent's frontmatter
3. The orchestrator invokes Track A agents in parallel, waits for all, then invokes Track B, then Track C
4. Add a `convergence-check` step that verifies all tracks produced compatible outputs before G2

**Estimated savings:** 9 sequential agents → ~4 parallel waves = **~60% reduction in planning latency**

---

## Solution 2: Implement All 14 Scripts as Deterministic Code (Critical — saves 10–20 min)

### Problem
All scripts are `TODO: implement` stubs. Mechanical work (parsing, indexing, validating, scaffolding) is done by Sonnet agents instead of compiled TypeScript.

### Research Basis
This is the single highest-ROI fix. In CI/CD systems, deterministic build steps are orders of magnitude faster than AI-driven steps. A `ts-morph` parse of a DS repo takes **<1 second**; a Sonnet agent doing the same work takes **30–60 seconds** and may hallucinate.

### Solution: Full Script Implementation with `tsx` Runtime

Implement every stub using:
- `ts-morph` for AST parsing (index-ds-repo.ts)
- `cheerio` + `node-fetch` for web scraping (fetch-guidelines-web.ts)
- `Handlebars` for template rendering (scaffold-app.ts)
- `zod` for schema validation (validate-generated.ts)
- `playwright` for runtime testing (runtime-sweep.ts, visual-smoke.ts)
- `axe-core` + `jsdom` for a11y testing (axe-run.ts)

**Critical: Add `package.json` and `tsconfig.json` to skill root** so scripts can actually run.

```json
{
  "name": "monolith-skill",
  "private": true,
  "type": "module",
  "scripts": {
    "index-ds": "tsx scripts/index-ds-repo.ts",
    "scaffold": "tsx scripts/scaffold-app.ts",
    "validate": "tsx scripts/validate-generated.ts",
    "axe": "tsx scripts/axe-run.ts",
    "runtime": "tsx scripts/runtime-sweep.ts",
    "visual-smoke": "tsx scripts/visual-smoke.ts"
  },
  "dependencies": {
    "ts-morph": "^23.0.0",
    "cheerio": "^1.0.0",
    "handlebars": "^4.7.8",
    "zod": "^3.23.0",
    "playwright": "^1.44.0",
    "axe-core": "^4.9.0",
    "jsdom": "^24.0.0",
    "tsx": "^4.11.0",
    "typescript": "^5.4.0"
  }
}
```

**Why this preserves quality:**
- Scripts produce **deterministic, schema-validated output** — more reliable than agent generation
- AST-based parsing catches edge cases that agents miss
- Schema validation guarantees downstream compatibility
- Agents are freed to do **judgment work** (design decisions, critique, strategy) instead of mechanical parsing

**Estimated savings:** Each script invocation goes from 30–60s (agent) to <1s (compiled TS). With 20+ script calls per run, this saves **10–20 minutes**.

---

## Solution 3: Unified Smart QA with Delta-Testing (Critical — saves 20–60 min)

### Problem
5 sequential QA loops × 5 iterations each. Each loop re-boots the dev server and re-runs the full build. Each loop is isolated — issues found by design-qa aren't visible to dev-qa.

### Research Basis
Modern test frameworks (Jest, Vitest) use **incremental/delta testing** — only test what changed. Bazel and Nx use **remote caching** and **affected-graph testing** to avoid redundant work. This principle applies directly: if a patch only changes CSS, we don't need to re-test modal focus traps.

### Solution: Single Unified QA Loop with Delta-Routing

Replace 5 sequential loops with **1 unified loop** that:

1. **Runs all 5 QA agents in parallel on first pass** (after developer emits code)
2. **Aggregates all issues into a single heal-brief** (self-healer batches across all gates)
3. **Developer applies ONE patch** addressing all gates simultaneously
4. **On subsequent iterations, uses delta-testing:**
   - If patch only touched CSS → skip static gates (tsc, imports, props), run only design-qa + visual smoke
   - If patch only touched a single component → run only affected routes in runtime-inspector
   - If patch only touched copy/strings → run only design-qa copy-sampling + commercial-auditor onboarding check
   - If patch touched routing → run full runtime-inspector
   - Use a `delta-map.json` that tracks which files changed → which gates are affected

```
Iteration 1 (full):
  dev-qa ‖ production-readiness-auditor ‖ runtime-inspector ‖ design-qa ‖ commercial-auditor
  → aggregate issues → single heal-brief → single patch

Iteration 2+ (delta):
  delta-map determines affected gates → run only affected gates
  → aggregate new issues → heal-brief → patch
```

**Why this preserves quality:**
- First pass still runs ALL gates — no reduction in coverage
- Delta-testing is **conservative** — if a file MIGHT affect a gate, the gate runs
- The same issue schema and severity levels are used
- Commercial-auditor still sees the full app; it just doesn't wait for design-qa to finish first
- All 5 iteration caps are preserved per gate

**Implementation:**
1. Add `scripts/delta-map.ts` — reads git diff (or file mtimes) and maps changed files to affected QA gates
2. Update `self-healer.md` to aggregate issues from ALL gates into one brief
3. Update `orchestrator.md` to invoke QA agents in parallel, not sequence
4. Add `affected_gates` field to checkpoint JSON

**Estimated savings:** 5 sequential loops → 1 parallel loop + delta iterations = **~70% reduction in QA latency**

---

## Solution 4: Intelligent Multi-Tier Caching (Major — saves 10–30 min)

### Problem
DS indexing, guidelines, research, and patterns are recomputed from scratch on every run. First runs get zero cache benefit.

### Research Basis
Build systems (Bazel, Nx, Turborepo) use **content-addressable caching** where outputs are keyed by input hashes. If inputs haven't changed, outputs are retrieved from cache instantly. This is the standard approach for deterministic build pipelines.

### Solution: Content-Addressable Cache with LRU Eviction

Implement a cache at `<workspaceRoot>/.monolith-cache/` with these tiers:

#### Tier 1 — DS Knowledge Cache
```
.monolith-cache/ds-knowledge/<hash-of-adapter-mtime-repo-head>/
  ├── component-index.json
  ├── tokens.json
  ├── icons.json
  ├── themeability.json
```
- Key: `hash(adapterPath + adapterMtime + repoHeadCommit + mcpVersion)`
- If cache hit: copy to `<runRoot>/ds-knowledge/` in <100ms, skip ds-indexer agent entirely
- Invalidation: adapter file changes, repo commit changes, MCP version changes

#### Tier 2 — Guidelines Cache
```
.monolith-cache/guidelines/<hash-of-source-files-mtime-url>/
  ├── brand.md
  ├── voice.md
  ├── ...
```
- Key: `hash(sourceFiles + sourceMtimes + urlContentHash)`
- If provided files haven't changed: skip guidelines-resolver entirely

#### Tier 3 — Research Cache (already partially implemented)
```
.monolith-cache/research/<domain-hash>/<brief-hash>/
  ├── market-research.md
  ├── competitive-synthesis.md
  ├── research.md
```
- Key: `hash(brief + domain + competitorList + researchDate)`
- TTL: 7 days for market research (competitor landscapes don't change daily)
- TTL: 30 days for domain research
- User can force refresh with `--refresh-research` flag

#### Tier 4 — Pattern Cache
```
.monolith-cache/patterns/<hash-of-patterns-dir>/
  ├── INDEX.md
  ├── <slug>.md
```
- Always read from `<memoryRoot>/patterns/` — no re-computation needed
- Promotions are append-only

#### Tier 5 — Build Cache
```
.monolith-cache/build/<hash-of-source-files>/
  ├── .vite/
  ├── node_modules/.cache/
```
- Reuse Vite's own build cache across runs
- Copy `.vite/cache` from previous run to new appRoot before `npm run build`

**Why this preserves quality:**
- Cached outputs are **exactly the same files** that would have been generated
- Cache keys are cryptographically strong — collisions are impossible
- Invalidation is aggressive — any input change busts the cache
- TTLs are conservative — market research refreshes weekly
- User always has `--no-cache` and `--refresh-*` overrides

**Estimated savings:**
- DS indexing: 30–60s → 100ms (99% reduction)
- Guidelines: 30–60s → 100ms (99% reduction)
- Market research: 2–5 min → 100ms (99% reduction)
- Research: 1–2 min → 100ms (99% reduction)
- Build: 10–30s → 2–5s (80% reduction with Vite cache)

**Total per-run savings for cached inputs: 5–10 minutes**

---

## Solution 5: Batch DS Extension Judging (Major — saves 5–10 min)

### Problem
`lead-designer ↔ ds-extension-judge` is interleaved — each extension request is ruled one at a time, synchronously.

### Research Basis
Code review systems (GitHub PR reviews, Phabricator) use **batch reviewing** — reviewers see all changes at once and can cross-reference between them. This is faster and produces more consistent rulings than one-at-a-time review.

### Solution: Batch All Extension Requests in One Pass

1. `lead-designer` emits `design_decisions.md` with **ALL extension requests** in a single "Extension requests" section
2. `ds-extension-judge` receives the full batch, processes all requests in parallel, emits all rulings at once
3. `lead-designer` receives all rulings at once, revises all denied/modified sections in a single pass
4. Only if a ruling is contested does it go to Round 2

```
Before (interleaved):
  lead-designer → request A → judge → ruling A → lead-designer → request B → judge → ruling B ...

After (batch):
  lead-designer → requests [A, B, C, D] → judge → rulings [A, B, C, D] → lead-designer → revisions [A, B, C, D]
```

**Why this preserves quality:**
- The judge sees the **full picture** — can spot patterns ("you're proposing 3 custom cards, but they all compose from DS primitives")
- Cross-referencing between requests improves consistency
- Same five-test gate is applied to each request
- Round 2 still exists for contested rulings

**Implementation:**
1. Update `lead-designer.md` to emit all extension requests in one block
2. Update `ds-extension-judge.md` to process `requests[]` array, emit `rulings[]` array
3. Update `orchestrator.md` to invoke judge once per design round, not once per request

**Estimated savings:** 4 extension requests × 2 round-trips = 8 agent calls → 2 agent calls = **75% reduction**

---

## Solution 6: Collapse design-principal + aesthetic-director into Parallel Review (Major — saves 5–10 min)

### Problem
`design-principal` (dimensions 1–4) and `aesthetic-director` (dimension 5) run sequentially, each with up to 2 revision rounds.

### Research Basis
Modern design critique uses **multi-dimensional rubrics** scored simultaneously. A single reviewer can grade all dimensions, or multiple reviewers can grade in parallel and their scores are merged. The sequential approach is a holdover from handoff-based workflows.

### Solution: Parallel Critique with Merged Verdict

Run `design-principal` and `aesthetic-director` **in parallel** after `lead-designer` delivers:

```
lead-designer → design_decisions.md
  ├─→ design-principal → critique (dimensions 1–4)
  └─→ aesthetic-director → audit (dimension 5)
       → orchestrator merges critiques → unified revision brief → lead-designer
```

Both agents read the same `design_decisions.md`. They work independently. The orchestrator merges their findings:
- If both agents request changes to the same section → combine into one brief
- If agents disagree → surface at G2 (same as current behavior)
- Round 2: lead-designer addresses ALL feedback in one pass, both agents re-review in parallel

**Why this preserves quality:**
- Each agent's rubric is unchanged — design-principal still uses `ui-excellence-standard.md`, aesthetic-director still uses `premium-aesthetic-standard.md`
- Parallel execution doesn't reduce the depth of either critique
- Merged verdict means lead-designer gets **all feedback at once** instead of adapting to one critique then another
- Round 2 boundary is still hard — no Round 3

**Estimated savings:** 2 sequential critique rounds → 1 parallel round = **~50% reduction in design-review latency**

---

## Solution 7: Async Non-Blocking Approval Gates (Critical — saves unbounded time)

### Problem
G1, G2, and G3 are hard blocking — the pipeline stops and waits for human text input. In async chat, each gate could wait hours.

### Research Basis
Modern CI/CD pipelines use **async approval gates** — builds continue to a staging environment while awaiting approval for production. GitHub Actions' `environment` protection rules and GitLab's `rules:if` allow pipelines to proceed to a "ready for review" state without blocking upstream work.

### Solution: Stream Gates with Auto-Continue

#### G1 — Input (kept blocking, but optimized)
G1 is the only gate that MUST block — the pipeline cannot proceed with wrong inputs. But it can be optimized:
- If `input-manifest.json` has zero `unresolved[]` items AND the user has used `--lazy` mode → **auto-approve G1** after 30-second countdown with visible summary
- If `unresolved[]` is non-empty → block and ask (current behavior)

#### G2 — Plan (converted to async stream)
Instead of blocking after engineering-manager, the pipeline **continues to code generation** while G2 is open:

```
engineering-manager → build_specs.md
  ├─→ [STREAM TO USER] condensed plan summary + "Reply to approve, iterate, or abort"
  └─→ pattern-decider → developer → dev-qa → ... (continues in background)

User replies at any time:
  "ok" → pipeline proceeds to runtime verification (already mostly done)
  "iterate on prd" → pause current work, apply delta, re-stream plan, continue from revised stage
  "abort" → kill background work, clean up
```

**This is safe because:**
- Code generation is **idempotent** — the `appRoot` can be rebuilt from planning docs at any time
- If user iterates, the background work is discarded — no different from current behavior where iteration triggers a restart
- If user approves, the pipeline is already at or near runtime verification — **G3 arrives faster**
- The risk is bounded — worst case, ~10 minutes of background work is discarded

#### G3 — Delivery (converted to auto-approve with opt-out)
After all QA loops converge:
- Pipeline auto-approves G3 after showing DELIVERY.md summary
- User can reply "iterate" within a 5-minute window to trigger fixes
- After 5 minutes, the run is marked complete and Phase 2 handoff is printed
- User can always re-run with deltas later

**Why this preserves quality:**
- All planning docs are still generated, all QA gates still run
- User still sees every artifact — they just don't have to say "ok" to proceed
- Iteration is still possible — the pipeline just doesn't wait idle
- The `--lazy` flag already exists for auto-answering G1/G2; this extends the concept

**Implementation:**
1. Update `rules/approval-gate-rules.md` to define "stream mode" vs "blocking mode"
2. Update `orchestrator.md` to support background continuation after G2
3. Add `--stream-gates` flag to invocation
4. Add `gate-timeout` config (default 5 min for G3)

**Estimated savings:** Unbounded wall-clock time → **~0 minutes of idle waiting per gate**

---

## Solution 8: Context Summarization with Embedding Retrieval (Major — saves 3–8 min)

### Problem
Every agent re-reads the full planning corpus (30K–80K tokens). Large context increases latency linearly.

### Research Basis
Retrieval-Augmented Generation (RAG) is the standard approach for giving LLMs access to large document sets without stuffing the full context. LangChain, LlamaIndex, and OpenAI's own retrieval systems use **embedding-based search** to find relevant chunks. Research shows that RAG with top-k=5 chunks often outperforms full-context stuffing for specific tasks.

### Solution: Hybrid Context — Summaries + Retrieval

Instead of passing full documents to every agent, provide:

1. **Compact summaries** (≤1K tokens each) for every upstream artifact — stored in checkpoints
2. **Embedding index** of all planning documents — built once after each agent completes
3. **Agent-specific retrieval** — each agent's `reads:` list is replaced with:
   - `summary:` — the compact summary (always loaded)
   - `retrieve:` — a query string used to fetch relevant chunks from the embedding index

**Example for `developer` agent:**
```yaml
reads:
  summary:
    - <runRoot>/checkpoints/14-build-specs.json  # 1K summary
    - <runRoot>/checkpoints/15-pattern-decisions.json  # 500B summary
  retrieve:
    - query: "screen components and props for {{screenName}}"
      source: <runRoot>/docs/design_decisions.md
      top_k: 3
    - query: "token applications and theme values"
      source: <runRoot>/theme-spec.json
      top_k: 2
```

**Why this preserves quality:**
- Summaries contain the **structure and decisions** — what screens, what routes, what components
- Retrieval fetches the **specific details** the agent needs for its task
- If retrieval misses something critical, the agent can request additional chunks
- Checkpoint discipline (Rule 23) is maintained — summaries are on disk
- The embedding model can be lightweight (e.g., `text-embedding-3-small`) — fast and cheap

**Implementation:**
1. Add `scripts/build-embeddings.ts` — chunk documents, embed with local or API model, store in `<runRoot>/.embeddings/`
2. Update `rules/phase-manifest-discipline.md` to support `summary:` and `retrieve:` fields
3. Update each agent's frontmatter to use the new format
4. Add `retrieve` tool to the orchestrator's agent invocation

**Estimated savings:** 30K–80K tokens → 3K–8K tokens per agent = **~70% reduction in context processing time**

---

## Solution 9: Implement Persistent Dev Server with Hot Reload (Major — saves 5–15 min)

### Problem
Dev server is booted, killed, and re-booted multiple times per run. Each boot requires Vite warm-up.

### Research Basis
Vite's dev server supports **persistent HMR (Hot Module Replacement)**. If the server stays running and files are patched in-place, Vite updates the browser instantly without a full restart. This is how developers work locally — they don't restart the server on every file change.

### Solution: Keep Dev Server Alive Across QA Iterations

1. `start-dev-server.ts` boots the server **once** after developer emits code
2. The server stays running in the background throughout all QA iterations
3. When developer applies a patch, files are edited in-place
4. Vite HMR picks up changes automatically
5. QA agents connect to the **same running server** — no re-boot needed
6. Server is only killed at G3 (delivery) or on abort

**Delta-testing integration:**
- If a patch only touches CSS → dev-qa runs static checks (tsc) without restarting server, design-qa refreshes screenshots
- If a patch touches routing → Vite automatically updates route table, runtime-inspector tests new routes
- Server health is monitored — if it crashes, it's auto-restarted

**Why this preserves quality:**
- The app runs in the **exact same server instance** — no difference in behavior
- HMR is Vite's native feature — battle-tested in millions of projects
- If HMR fails for a specific change, the orchestrator detects it and falls back to a restart
- All QA checks (routes, interactions, screenshots) work the same way

**Implementation:**
1. Update `scripts/start-dev-server.ts` to daemonize and write PID to `<runRoot>/server.pid`
2. Update `scripts/stop-dev-server.ts` (new) to gracefully kill by PID
3. Update all QA agents to use the persistent server URL
4. Add server healthcheck to orchestrator — if server dies, auto-restart

**Estimated savings:** 10 server boots → 1 server boot = **~90% reduction in server boot time**

---

## Solution 10: Incremental Runtime Verification (Major — saves 10–30 min)

### Problem
Runtime-inspector does an exhaustive sweep (all routes, all viewports, all interactions, all modals, all forms) on every pass, even when only a CSS fix was made.

### Research Basis
Test selection algorithms in Jest (`--changedSince`) and Vitest (`--related`) run only tests affected by changed files. Playwright supports `test.only` and project dependencies. The principle: **verify what changed, trust what didn't**.

### Solution: Affected-Graph Runtime Testing

Build a dependency graph:
```
src/screens/StrategiesList/index.tsx
  → affects routes: /strategies
  → affects interactions: buttons, links, forms on /strategies
  → affects modals: any modal triggered from /strategies
  → affects responsive: all viewports for /strategies

src/components/layout/Sidebar.tsx
  → affects routes: ALL routes (layout component)
  → affects nav-state: ALL routes
  → affects responsive: all viewports

src/theme/globals.css
  → affects visual: all routes, all viewports
  → does NOT affect: interactions, nav-state, form wiring, modal lifecycle
```

After each patch, `scripts/delta-map.ts` determines which runtime checks are affected:

| Changed files | Required runtime checks |
|---|---|
| CSS only (`*.css`, `*.scss`, tailwind classes) | Route sweep (screenshots only), responsive sweep, design-qa visual check |
| Single screen component | That screen's route + interactions + forms + modals |
| Layout component | All routes + nav-state + responsive |
| Router config | All routes + nav-state |
| Form component | All forms across all routes |
| Modal component | All modals across all routes |
| Shared hook/util | All routes that import it |

**Why this preserves quality:**
- First pass is still **full sweep** — 100% coverage on initial verification
- Delta passes are **conservative** — if unsure, run the full check
- Critical paths (routing, nav-state, forms) are always re-verified if ANY code changes
- The dependency graph is explicitly declared — no guessing
- Fallback to full sweep if delta-map is ambiguous

**Implementation:**
1. Add `scripts/build-affected-graph.ts` — parses imports to build route→file→check mapping
2. Add `scripts/delta-map.ts` — reads git diff, outputs affected checks
3. Update `runtime-inspector.md` to accept `--affected-only` flag
4. Update `orchestrator.md` to pass delta-map to QA agents

**Estimated savings:**
- CSS-only patch: 3–8 min full sweep → 30s screenshot refresh = **~90% reduction**
- Single-screen patch: 3–8 min → 1–2 min = **~70% reduction**
- Layout patch: still full sweep (correctly conservative)

---

## Solution 11: Lazy Playwright Installation with System Browser Reuse (Major — saves 1–5 min)

### Problem
Playwright + Chromium download (100–300MB) happens on every fresh run.

### Research Basis
Playwright supports **system browser reuse** via `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and connecting to existing Chrome/Edge/Chromium installations. It also supports **global cache** — browsers are installed once per machine, not per project.

### Solution: Global Playwright Cache + System Browser Fallback

1. **Check for global Playwright cache first:** `~/.cache/ms-playwright/` (Linux), `~/Library/Caches/ms-playwright/` (macOS), `%LOCALAPPDATA%\ms-playwright\` (Windows)
2. **If cached globally:** skip download, use cached browser
3. **If not cached:** install to global cache, not to `<appRoot>/node_modules`
4. **Fallback:** use system Chrome/Edge if available (`chromium --version`)
5. **Skip entirely if dev-qa found critical failures:** if BUILD or SERVER gate failed, runtime-inspector cannot run anyway — don't waste time installing Playwright

```bash
# In install-deps.ts or start-dev-server.ts
if ! npx playwright install chromium --with-deps --only-shell; then
  # Fallback to system browser
  export PLAYWRIGHT_CHROMIUM_PATH=$(which chromium || which google-chrome || which edge)
fi
```

**Why this preserves quality:**
- Playwright's API is identical regardless of browser source
- Chromium versions are compatible across recent releases
- System browsers are often more up-to-date than bundled ones
- If fallback fails, the orchestrator blocks with clear error — no silent degradation

**Estimated savings:** 1–5 min download → 0s (cached) or 5s (system fallback) = **~95% reduction**

---

## Solution 12: Artifact Compression with Structured Templates (Moderate — saves 5–10 min)

### Problem
16+ planning artifacts are all large markdown docs. Agents spend tokens generating and reading extensive prose.

### Research Basis
Structured data formats (JSON, YAML, TOML) are more compact than prose for machine consumption. The 10K token cap (Rule 25) already acknowledges this. But templates still encourage verbose output.

### Solution: Machine-First Artifacts with Human Render Layer

Replace prose-heavy `.md` artifacts with **structured JSON/YAML** that agents read/write efficiently, plus an optional human-readable render:

**Example: `design_decisions.json` (machine-first)**
```json
{
  "screens": [
    {
      "route": "/strategies",
      "surfaceTemplate": "list-view",
      "sections": [
        {
          "id": "header",
          "component": "PageHeader",
          "variant": "default",
          "props": { "title": "Strategies" },
          "differentiator": "D-01",
          "antiGenericCite": "AG-12"
        }
      ],
      "states": {
        "empty": "ES-01",
        "error": "ERR-03",
        "loading": "LD-01"
      }
    }
  ],
  "tokenApplications": [...],
  "extensions": [...]
}
```

Agents read/write JSON (compact, schema-validated, fast). The orchestrator renders a `.md` version for human review at G2.

**Why this preserves quality:**
- JSON is **unambiguous** — no parsing ambiguity that prose introduces
- Schema validation catches errors immediately
- Agents spend fewer tokens reading structured data vs. prose
- Human render layer ensures G2 still shows readable summaries
- Backward compatible — `.md` files are still generated as secondary outputs

**Implementation:**
1. Add JSON schemas for all planning artifacts (many already exist in `guidelines-schema/`)
2. Update agent specs to read/write `.json` as primary, `.md` as rendered
3. Add `scripts/render-artifact.ts` — converts JSON to pretty `.md` for human review
4. Update `orchestrator.md` to render before G2

**Estimated savings:** 10K-token prose artifacts → 2K-token structured data = **~70% reduction in token consumption**

---

## Solution 13: Streaming Market Research with Background Fetch (Moderate — saves 2–5 min)

### Problem
Market researcher fetches 3+ competitor websites synchronously.

### Research Basis
`Promise.all()` and `Promise.allSettled()` allow parallel HTTP requests. Web scraping pipelines (Scrapy, Playwright async) routinely fetch hundreds of pages in parallel.

### Solution: Parallel Fetch with Streaming Analysis

1. Fetch all competitor pages **in parallel** using `Promise.all()`
2. Stream partial results to `market-researcher` as they arrive — the agent starts writing sections for competitors whose pages loaded first
3. If a fetch fails after 10s timeout, the agent uses training-era knowledge with appropriate weight tag
4. Cache successful fetches in `.monolith-cache/web/` for 7 days

```typescript
// In fetch-guidelines-web.ts or a new fetch-competitor.ts
const pages = await Promise.allSettled(
  urls.map(url => fetchWithTimeout(url, 10000))
);
```

**Why this preserves quality:**
- Same content is fetched — just in parallel
- Streaming means the agent doesn't wait for the slowest page
- Timeouts prevent one slow site from blocking the whole pipeline
- Cached results mean re-runs are instant

**Estimated savings:** 6–9 sequential fetches × 5s each = 30–45s → 5–10s (parallel) = **~80% reduction**

---

## Solution 14: Checkpoint Compression with Differential Updates (Moderate — saves 1–3 min)

### Problem
21 checkpoint files are written and re-read between every agent. Each is a full JSON file.

### Research Basis
Database systems use **delta encoding** and **append-only logs** for efficient state persistence. Redis AOF, Kafka logs, and event sourcing all avoid rewriting full state on every change.

### Solution: Append-Only Checkpoint Log + Lazy Materialization

Instead of 21 separate JSON files:

1. **Single append-only log:** `<runRoot>/checkpoints/checkpoints.jsonl`
   ```jsonl
   {"phase":"triage","runId":"...","summary":{...}}
   {"phase":"ds-indexer","runId":"...","summary":{...}}
   {"phase":"guidelines-resolver","runId":"...","summary":{...}}
   ```

2. **Lazy materialization:** Individual `NN-phase.json` files are only written when an agent explicitly requests them
3. **In-memory cache:** The orchestrator keeps the latest checkpoint per phase in memory — agents read from memory, not disk
4. **Differential updates:** Each checkpoint entry only contains CHANGED fields from the previous entry

**Why this preserves quality:**
- Same data, more efficient storage
- In-memory reads are instant
- Append-only logs are corruption-resistant
- Individual phase files are still available for debugging

**Estimated savings:** 21 file writes + 21 file reads → 1 append + in-memory access = **~90% reduction in checkpoint I/O**

---

## Solution 15: Intelligent Stage Skipping with Input Fingerprinting (Moderate — saves 2–5 min)

### Problem
"No stage is skippable" — even when inputs haven't changed, every agent runs.

### Research Basis
Build systems use **input fingerprinting** (content hashes) to skip steps. Make, Ninja, Bazel all skip compilation when source files haven't changed. The same principle applies to agent stages.

### Solution: Stage Fingerprinting with Deterministic Skip

Each stage computes a fingerprint of its inputs:
```
fingerprint(triage) = hash(brief + env + constraints)
fingerprint(ds-indexer) = hash(input-manifest + adapter + repo-head)
fingerprint(guidelines-resolver) = hash(input-manifest + source-files + url-content)
fingerprint(researcher) = hash(brief + market-research + competitive-synthesis + guidelines)
...
```

Before invoking an agent:
1. Compute current input fingerprint
2. Check `<runRoot>/checkpoints/fingerprints.json` for previous run with same fingerprint
3. If match AND previous run succeeded → **skip agent, copy outputs from previous run**
4. If no match → run agent, store fingerprint

**Stages that CAN be skipped:**
- `triage` — if brief and flags are identical
- `ds-indexer` — if DS hasn't changed (superseded by DS cache, but fingerprinting is a secondary check)
- `guidelines-resolver` — if guidelines source hasn't changed
- `market-researcher` — if brief + domain are identical AND cache is fresh
- `competitive-synthesizer` — if market-research hasn't changed
- `theming-resolver` — if theming inputs + DS haven't changed

**Stages that CANNOT be skipped:**
- `developer` — user may want different code for same plan
- All QA stages — must verify the actual code

**Why this preserves quality:**
- Skipped stages produce **identical output** — deterministic by design
- Fingerprints are cryptographic — no false skips
- User can force all stages with `--no-skip` flag
- Perfect for re-runs after a user iterates on a downstream stage (upstream stages don't change)

**Estimated savings:** 5–7 stages skipped on re-runs = **~40% reduction in agent invocations**

---

## Solution 16: Collapsible Commercial Audit with Design-QA Parallelism (Minor — saves 2–4 min)

### Problem
Commercial-auditor is forced sequential after design-qa, even though they check different things.

### Solution: Parallel Commercial + Design QA with Converged Patch

Run `commercial-auditor` in **parallel** with `design-qa` (both depend on the same app state post-runtime-inspector):

```
runtime-inspector converges
  ├─→ design-qa → issues[]
  └─→ commercial-auditor → issues[]
       → self-healer merges both issue lists → unified patch brief → developer
```

**Why this is safe:**
- `design-qa` checks visual quality, tokens, copy, patterns
- `commercial-auditor` checks onboarding, conversion, retention, trust, expansion
- They touch **different files** in the app — no patch conflicts
- If they both flag the same screen, the self-healer merges the fixes

**Estimated savings:** 2 sequential QA passes → 1 parallel pass = **~50% reduction**

---

## Solution 17: Lazy Pattern Memory Indexing (Minor — saves 30–60s)

### Problem
Pattern memory I/O on every run: read INDEX.md, write new patterns, regenerate INDEX.md.

### Solution: Append-Only Pattern Log with Background Indexing

1. New patterns are appended to `<memoryRoot>/patterns/log.jsonl`
2. `INDEX.md` is regenerated **in the background** (or lazily, only when needed)
3. `pattern-decider` reads the log directly, not the rendered INDEX.md
4. `design-qa` writes new patterns directly to the log

**Why this preserves quality:**
- Same patterns are stored — just more efficiently
- Log format is append-only and corruption-resistant
- INDEX.md is still generated for human reading

---

## Solution 18: Inline Competitive Synthesis (Minor — saves 1–2 min)

### Problem
`competitive-synthesizer` is a separate agent that reads `market-research.md` and writes `competitive-synthesis.md` with no new claims.

### Solution: Synthesis as Structured Output of market-researcher

Instead of a separate agent, `market-researcher` emits `market-research.md` with a **mandatory "Synthesis" appendix**:

```markdown
## Synthesis (machine-readable)

### Top 5 loopholes
| Rank | Loophole | Competitors | Severity | Evidence |

### Table stakes
| # | Pattern | Competitors |

### Visual signatures
| Competitor | Signature |

### Copy vocabulary map
| Concept | Words used |
```

Downstream agents read the synthesis appendix directly. No separate `competitive-synthesis.md` file.

**Why this preserves quality:**
- The same information is produced — just by the agent that already has the full context
- No risk of information loss in handoff
- One less file to validate and checkpoint

---

## Solution 19: Deliverable Tally as Structured Metadata (Minor — saves 30–60s)

### Problem
`📋 Delivered: X | Remaining: Y` is printed after every artifact, adding token overhead.

### Solution: Machine-Readable Tally in Checkpoint

Replace the prose tally with a structured field in the checkpoint JSON:
```json
{
  "tally": {
    "delivered": ["design_decisions.md", "best_practices.md"],
    "remaining": ["design-principal-critique.md", "aesthetic-audit.md"]
  }
}
```

The orchestrator computes and displays the tally — agents don't need to generate it.

**Why this preserves quality:**
- Same information, zero agent token overhead
- Orchestrator can render it consistently

---

## Solution 20: Skill Root Tooling Infrastructure (Minor — unblocks everything)

### Problem
No `package.json` or `tsconfig.json` at skill root. Scripts cannot run.

### Solution: Add Full Tooling Setup

**package.json** (see Solution 2 for full content)

**tsconfig.json:**
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
    "rootDir": "."
  },
  "include": ["scripts/**/*", "guidelines-schema/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Why this is critical:**
- Without this, Solutions 2, 9, 10, 11 cannot be implemented
- It's the foundation for all deterministic tooling

---

## Combined Impact Estimate

| Solution | Time Saved | Quality Impact |
|---|---|---|
| 1. Parallel planning tracks | 15–30 min | None — same agents, parallel scheduling |
| 2. Implement scripts | 10–20 min | **Improved** — deterministic output |
| 3. Unified QA + delta-testing | 20–60 min | None — same gates, smarter scheduling |
| 4. Intelligent caching | 10–30 min (re-runs) | None — exact same outputs |
| 5. Batch extension judging | 5–10 min | **Improved** — judge sees full picture |
| 6. Parallel design critique | 5–10 min | None — same rubrics, merged feedback |
| 7. Async approval gates | Unbounded | None — user still sees everything |
| 8. Context summarization | 3–8 min | None — relevant details retrieved |
| 9. Persistent dev server | 5–15 min | None — HMR is native Vite |
| 10. Incremental runtime | 10–30 min | None — conservative delta detection |
| 11. Lazy Playwright | 1–5 min | None — same browser API |
| 12. Machine-first artifacts | 5–10 min | **Improved** — schema-validated |
| 13. Parallel market research | 2–5 min | None — same content fetched |
| 14. Checkpoint compression | 1–3 min | None — same data, efficient format |
| 15. Stage fingerprinting | 2–5 min (re-runs) | None — deterministic skip |
| 16. Parallel commercial QA | 2–4 min | None — different concerns |
| 17. Lazy pattern indexing | 30–60s | None — same patterns stored |
| 18. Inline synthesis | 1–2 min | None — same information |
| 19. Structured tally | 30–60s | None — same metadata |
| 20. Tooling infrastructure | Unblocks all | **Improved** — scripts actually work |

**Conservative total savings:** 60–80% runtime reduction  
**Best-case total savings:** 80–85% runtime reduction (heavily cached re-run)

---

## Implementation Priority

### Phase 1 — Foundation (unblocks everything)
1. Solution 20: Add `package.json` + `tsconfig.json`
2. Solution 2: Implement core scripts (index-ds-repo, scaffold-app, validate-generated, start-dev-server)

### Phase 2 — Biggest Wins
3. Solution 3: Unified QA loop
4. Solution 9: Persistent dev server
5. Solution 1: Parallel planning tracks
6. Solution 4: Intelligent caching

### Phase 3 — Medium Wins
7. Solution 10: Incremental runtime verification
8. Solution 5: Batch extension judging
9. Solution 6: Parallel design critique
10. Solution 8: Context summarization

### Phase 4 — Polish + Async
11. Solution 7: Async approval gates
12. Solution 12: Machine-first artifacts
13. Solution 14: Checkpoint compression
14. Solution 15: Stage fingerprinting

### Phase 5 — Minor Optimizations
15. Solutions 11, 13, 16, 17, 18, 19

---

## Quality Guarantees

Every solution above adheres to these non-negotiables:

1. **All 5 QA gates still run** — no gate is removed or weakened
2. **All 3 approval gates still exist** — they just don't block the pipeline
3. **All 16+ planning artifacts are still generated** — format may change, content does not
4. **All agents still exist** — they may run in parallel, but their specs are unchanged
5. **Production-grade mandate is still enforced** — every button works, every route renders, every state is reachable
6. **Self-healing loops still iterate up to 5 times** — they just share state intelligently
7. **DS-First Mandate (Rule 0) is unchanged** — no custom components without ruling
8. **Premium aesthetic standard (Rule 19) is unchanged** — anti-generic checks still run
9. **Deterministic outputs** — same inputs produce same outputs (or better, with caching)
10. **Human override** — user can always `--no-cache`, `--no-skip`, or force blocking gates

---

## Research References

- **LangGraph** (LangChain): DAG-based agent orchestration with parallel node execution
- **CrewAI**: Role-based agent collaboration with task delegation
- **AutoGen** (Microsoft): Multi-agent conversation with group chat patterns
- **Bazel**: Content-addressable caching and incremental builds
- **Nx**: Affected-graph computation for monorepo task scheduling
- **Vite HMR**: Native hot module replacement for instant updates
- **Playwright**: System browser connection and global cache management
- **Jest/Vitest**: Delta test selection with `--changedSince` and `--related`
- **OpenAI Embeddings**: `text-embedding-3-small/large` for retrieval-augmented generation
- **Event Sourcing / CQRS**: Append-only logs for state persistence
