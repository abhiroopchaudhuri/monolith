# Monolith v3.3 — Zero-Dependency Implementation Plan

> **Date:** 2026-04-28  
> **Revision:** v2 — Post-review with zero-dependency principles  
> **Core Principle:** *Zero-configuration. The skill molds to the user's existing environment. No SQLite. No Git required. No system-level dependencies beyond Node.js and the AI harness.*  
> **Goal:** 80%+ runtime reduction without quality loss  
> **Estimated Implementation:** 2–3 weeks (1 engineer full-time)

---

## Why Zero-Dependency Matters

A local AI skill is not a SaaS platform. It runs inside the user's editor (Cursor, Claude Code, Trae, Windsurf). If the skill assumes:
- SQLite → `better-sqlite3` requires native compilation. Fails on Windows without build tools. Fails in sandboxed environments.
- Git branching → The user may not use Git. Their project may be a fresh folder. Creating branches pollutes their VCS.
- Custom RAG → Adds embedding model downloads, vector stores, and complex infrastructure.
- Persistent background servers → Orphaned processes when the user closes the editor tab.

**The correct approach:** Use what the harness already provides (file tools, chat turns, native search) and dependency-free file formats (JSON, Markdown).

---

## Revised Architecture: The Three Pillars

### Pillar 1: The State Tree (Replaces SQLite + 21 Checkpoint Files)
**File:** `.monolith/state.json`

A single JSON file that is the pipeline's brain. It replaces:
- 21 checkpoint JSON files
- 16+ planning artifact files (now stored as values in state tree, rendered to scratchpad only when needed)
- SQLite database
- Pattern memory index
- Issue tracking for self-healing loops

```json
{
  "$schema": "./.monolith/state.schema.json",
  "meta": {
    "version": "3.3.0",
    "runId": "2026-04-28_expense-reporting-tool",
    "startedAt": "2026-04-28T10:00:00Z",
    "status": "planning" 
  },
  "input": {
    "manifest": { ... },
    "fingerprint": "sha256:abc123..."
  },
  "cache": {
    "dsKnowledge": { "key": "sha256:...", "path": ".monolith-cache/ds-knowledge/..." },
    "guidelines": { "key": "sha256:...", "path": ".monolith-cache/guidelines/..." },
    "research": { "key": "sha256:...", "expiresAt": "2026-05-05T00:00:00Z" }
  },
  "phases": {
    "triage": { "status": "done", "checkpoint": { ... }, "outputs": ["input-manifest.json"] },
    "dsIndexer": { "status": "done", "checkpoint": { ... }, "outputs": ["component-index.json", "tokens.json", "icons.json"] },
    "guidelinesResolver": { "status": "done", "checkpoint": { ... } },
    "marketResearcher": { "status": "done", "checkpoint": { ... } },
    "researcher": { "status": "done", "checkpoint": { ... }, "outputs": ["research.md"] },
    "productManager": { "status": "done", "checkpoint": { ... }, "outputs": ["prd.md"] },
    "uxStrategist": { "status": "done", "checkpoint": { ... }, "outputs": ["differentiation-map.md"] },
    "uxArchitect": { "status": "active", "checkpoint": { ... } }
  },
  "artifacts": {
    "research": { "summary": "...", "fullPath": ".monolith/scratchpad/research.md", "tokenCount": 4200 },
    "prd": { "summary": "...", "fullPath": ".monolith/scratchpad/prd.md", "tokenCount": 3800 },
    "informationArchitecture": { "summary": "...", "fullPath": ".monolith/scratchpad/information_architecture.md" },
    "userFlow": { "summary": "...", "fullPath": ".monolith/scratchpad/user_flow.md" },
    "designDecisions": { "summary": "...", "fullPath": ".monolith/scratchpad/design_decisions.md" },
    "buildSpecs": { "summary": "...", "fullPath": ".monolith/scratchpad/build_specs.md" }
  },
  "qa": {
    "devQa": { "attempts": 2, "lastIssues": [], "status": "clean" },
    "productionReadiness": { "attempts": 1, "lastIssues": [], "status": "clean" },
    "runtimeInspector": { "attempts": 3, "lastIssues": [...], "status": "healing" },
    "designQa": { "attempts": 0, "status": "pending" },
    "commercialAuditor": { "attempts": 0, "status": "pending" }
  },
  "issues": {
    "open": [...],
    "resolved": [...],
    "waived": []
  },
  "healLog": [
    { "gate": "runtime-inspector", "attempt": 1, "issuesCount": 5, "timestamp": "..." },
    { "gate": "runtime-inspector", "attempt": 2, "issuesCount": 2, "timestamp": "..." }
  ],
  "patterns": {
    "reused": ["metric-trio-sparkline"],
    "promotedThisRun": []
  },
  "server": {
    "pid": 12345,
    "url": "http://localhost:5173",
    "status": "running"
  }
}
```

**Why this works:**
- **Harness-native:** Cursor/Claude Code can read `state.json` and inject only the relevant branch into context. `"Read only the designDecisions summary from state.json"` → harness parses and passes just that chunk.
- **Atomic:** One write = full state snapshot. No partial writes, no corruption from 21 separate files getting out of sync.
- **Human-debuggable:** Open the file and see exactly where the pipeline is.
- **Zero-dependency:** Pure JSON. No npm package required.

**Concurrency safety:** In a turn-based chat agent, only one agent acts at a time. There is no concurrent write risk. The orchestrator is the sole writer.

---

### Pillar 2: Patch Manifests (Replaces Git Diff for Delta-Testing)
**Format:** JSON embedded in agent output

When the Developer agent writes a patch, its output MUST include a manifest:

```json
{
  "patchManifest": {
    "touchedFiles": [
      "src/screens/StrategiesList/index.tsx",
      "src/components/layout/Sidebar.tsx"
    ],
    "touchedRoutes": ["/strategies"],
    "touchedComponents": ["Sidebar", "StrategiesList"],
    "changeType": "logic", // logic | css | routing | copy | form | modal
    "estimatedImpact": {
      "staticGates": ["tsc", "imports", "props"],
      "runtimeGates": ["route-sweep", "nav-state", "interactions"],
      "designGates": ["copy", "visual-rhythm"]
    }
  }
}
```

**Why this works:**
- The developer **already knows** what it changed. It just needs to declare it.
- No Git dependency. Works in a folder with no `.git`.
- More precise than `git diff` — the developer knows semantic impact ("this is a form fix"), not just file names.
- The self-healer can use this to route issues precisely.

**Validation:** If a patch manifest is missing or incomplete, the orchestrator falls back to full QA sweep. This is conservative but safe.

---

### Pillar 3: Turn-Based Yielding (Replaces Git Branching + Async Threading)
**Pattern:** Draft → Write to scratchpad → Yield turn → User edits → Continue

At G2:

```
[AGENT OUTPUT]
I have drafted the complete architecture. Here's the summary:

## Plan Summary
- 8 screens, 12 routes
- 3 differentiators: [...]
- DS extensions: 2 approved, 1 denied
- Design principal grade: Solid (3/4 dimensions)

The full planning documents are in `.monolith/scratchpad/`.

### Review the plan
Open `.monolith/scratchpad/PLANNING_REVIEW.md` to see the condensed plan.
Feel free to edit any document in `.monolith/scratchpad/` directly.

### Next steps
Reply with:
- `continue` — proceed to code generation
- `iterate on <doc>: <delta>` — I'll update the specific doc and re-verify downstream
- `restart from <phase>` — restart from that phase
```

**Why this works:**
- **Harness-native:** Cursor/Claude Code are turn-based chat interfaces. Yielding the turn is the natural UX.
- **No event loop blocking:** The agent simply stops. No background threads. No orphaned processes.
- **User can edit files:** The user opens `.monolith/scratchpad/prd.md`, edits it, then says "continue." The orchestrator reads the updated file and continues.
- **No Git required:** Works in a plain folder.

**G3 behavior:**
After QA converges:
```
[AGENT OUTPUT]
Run complete. App running at http://localhost:5173

The final delivery summary is in `DELIVERY.md`.

Scratchpad cleanup: I have removed all intermediate planning documents.
If you need them back, they are in `.monolith/archive/2026-04-28_expense-reporting-tool/`.
```

---

## Revised Phase-by-Phase Implementation

### Phase 0: Foundation (Week 1, Days 1–2)

#### T0-1: Create `package.json` (zero-dependency version)
**REMOVE:** `better-sqlite3`, `tree-kill` (no longer needed)
**KEEP:** Everything else

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
    "tsx": "^4.11.0",
    "typescript": "^5.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/jsdom": "^21.0.0"
  }
}
```

**ETA:** 30 min

#### T0-2: Create `.monolith/` directory structure
```
.monolith/
├── state.json              ← single source of truth
├── state.schema.json       ← zod/jsonschema validation
├── scratchpad/             ← temporary planning docs (gitignored)
├── archive/                ← completed run docs (user can keep or delete)
├── cache/                  ← content-addressable cache
│   ├── ds-knowledge/
│   ├── guidelines/
│   ├── research/
│   └── web/
└── patterns/
    ├── log.jsonl           ← append-only pattern log
    └── INDEX.md            ← rendered index (lazy)
```

**ETA:** 1 hour

#### T0-3: Implement `scripts/state-manager.ts`
The unified state tree manager. All agents read/write through this.

**Subtasks:**
- T0-3.1: `readState(path?: string)` — reads `.monolith/state.json`. If `path` provided, returns only that branch (e.g., `readState("phases.dsIndexer")` returns just the dsIndexer checkpoint).
- T0-3.2: `writeState(path: string, value: any)` — writes to a specific branch. Merges deeply.
- T0-3.3: `atomicWrite(state: object)` — replaces entire state file. Used by orchestrator between phases.
- T0-3.4: `validateState()` — validates against `state.schema.json` using zod.
- T0-3.5: `getArtifact(name: string)` — returns artifact metadata from state tree. Does NOT read the full markdown file.
- T0-3.6: `setArtifact(name: string, summary: string, fullPath: string)` — registers an artifact.
- T0-3.7: `getFingerprint(phase: string)` — returns input hash for stage skipping.
- T0-3.8: `setFingerprint(phase: string, inputHash: string, outputHash: string)` — stores fingerprint.
- T0-3.9: `addIssue(gate: string, attempt: number, issue: IssueSchema)` — adds to `state.issues.open[]`.
- T0-3.10: `resolveIssue(issueId: string)` — moves from open to resolved.
- T0-3.11: `getPattern(slug: string)` — reads from `state.patterns` or `.monolith/patterns/log.jsonl`.
- T0-3.12: `addPattern(slug: string, content: object)` — appends to log.jsonl.

**ETA:** 2 days
**Deliverable:** Working state-manager.ts + unit tests

#### T0-4: Create `state.schema.json`
Zod schema defining every key in state.json. Enforces structure so agents can't corrupt the tree.

**ETA:** 4 hours

---

### Phase 1: Core Scripts (Week 1, Days 3–5)

Implement the 14 script stubs using the state manager. All scripts now read/write via `state-manager.ts` instead of direct file I/O.

#### T1-1 through T1-16: Same as original plan
**BUT with these changes:**
- All scripts call `readState()` / `writeState()` instead of `fs.readFile()` / `fs.writeFile()`
- Checkpoints are written to `state.json` via `atomicWrite()`, not to individual JSON files
- Artifacts are written to `.monolith/scratchpad/*.md` AND registered in `state.artifacts`
- Cache lookups use `state.cache` metadata, not separate cache directories

**ETA:** 5 days (same as before, but simpler I/O)

---

### Phase 2: Parallel Planning + Unified QA (Week 2)

#### T2-1: Rewrite `orchestrator.md` for Turn-Based Flow

**Key changes from original plan:**
- **REMOVED:** Background threading, async gates, Git branching
- **ADDED:** Explicit turn-yielding at G2 and G3
- **ADDED:** State tree as the orchestrator's memory

**New orchestrator flow:**
```
1. resolve paths → init state.json
2. triage → write state.phases.triage
3. PARALLEL: ds-indexer ‖ guidelines-resolver ‖ market-researcher
   → write state.phases.{dsIndexer, guidelinesResolver, marketResearcher}
4. PARALLEL: researcher ‖ competitive-synthesis (inline)
   → write state.artifacts.research
5. PARALLEL: product-manager ‖ ux-strategist
   → write state.artifacts.{prd, differentiationMap}
6. PARALLEL: ux-architect ‖ lead-designer (early)
   → write state.artifacts.{informationArchitecture, userFlow, designDecisions}
7. BATCH: ds-extension-judge
   → write state.artifacts.dsExtensions
8. PARALLEL: design-principal ‖ aesthetic-director
   → write state.artifacts.{critique, aestheticAudit}
9. ux-writer
   → write state.artifacts.uxWriting
10. engineering-manager
    → write state.artifacts.buildSpecs
11. [G2 YIELD] → write PLANNING_REVIEW.md to scratchpad, STOP, wait for user
    User says "continue" → read state back, verify no edits, proceed
    User edited files → re-read affected artifacts, re-run affected phases
12. pattern-decider
    → write state.artifacts.patternDecisions
13. developer
    → write appRoot/**, include patchManifest in output
14. UNIFIED QA LOOP:
    Iteration 1: run ALL 5 QA agents in parallel (via parallel tool calls)
    → aggregate issues to state.issues.open[]
    → self-healer reads issues, writes patch brief
    → developer patches, emits new patchManifest
    Iteration 2+: read patchManifest, run only affected gates
    → delta determined by patchManifest.changeType + stateManager.getAffectedGates()
15. [G3 YIELD] → write DELIVERY.md, show summary, STOP, wait for user
    User says "accept" → cleanup scratchpad, archive to .monolith/archive/
    User says "iterate" → route to specific phase, continue
```

**ETA:** 2 days

#### T2-2: Implement Delta-Testing via Patch Manifests

**Subtasks:**
- T2-2.1: Update `developer.md` — mandate `patchManifest` in every output:
  ```
  When you return from patch mode, your response MUST include:
  <patchManifest>
  {
    "touchedFiles": [...],
    "touchedRoutes": [...],
    "changeType": "logic|css|routing|copy|form|modal|layout",
    "estimatedImpact": { "staticGates": [...], "runtimeGates": [...], "designGates": [...] }
  }
  </patchManifest>
  ```
- T2-2.2: Update `orchestrator.md` — parse patchManifest from developer output, store in `state.healLog[].patchManifest`
- T2-2.3: Add `scripts/get-affected-gates.ts` — reads patchManifest, returns affected gates:
  ```typescript
  const gateMap = {
    "logic": ["dev-qa", "production-readiness", "runtime-inspector"],
    "css": ["design-qa", "visual-smoke"],
    "routing": ["dev-qa", "runtime-inspector"],
    "copy": ["design-qa", "commercial-auditor"],
    "form": ["runtime-inspector", "production-readiness"],
    "modal": ["runtime-inspector", "production-readiness"],
    "layout": ["runtime-inspector", "design-qa"]
  };
  ```
- T2-2.4: If patchManifest is missing → fallback to full sweep (conservative)
- T2-2.5: If patchManifest claims "css only" but touched a `.tsx` file with JSX → override to "logic" (conservative)

**ETA:** 1 day

#### T2-3: Batch Extension Judging + Parallel Critique
Same as original plan (T3-2, T3-3). No changes needed.
**ETA:** 4 hours

---

### Phase 3: Approval Gates as Turn Yields (Week 2, Days 4–5)

#### T3-1: Implement G2 Yield

**Subtasks:**
- T3-1.1: Orchestrator reaches G2 after `engineering-manager` completes
- T3-1.2: Orchestrator calls `scripts/render-planning-review.ts`:
  - Reads `state.artifacts.*` summaries
  - Renders `PLANNING_REVIEW.md` to `.monolith/scratchpad/`
  - Includes: brief, personas, differentiators, screen count, DS extensions, design grades, open questions
- T3-1.3: Orchestrator outputs yield message:
  ```
  [G2 — Plan Review]

  I've drafted the complete plan. Review it here:
  → .monolith/scratchpad/PLANNING_REVIEW.md

  You can also review individual docs:
  → .monolith/scratchpad/prd.md
  → .monolith/scratchpad/design_decisions.md
  → .monolith/scratchpad/build_specs.md

  Feel free to edit any file directly.

  Reply with:
  - `continue` — proceed to code generation
  - `iterate on <doc>: <delta>` — I'll update that doc and re-run downstream
  - `restart from <phase>` — restart from that phase
  - `abort` — stop the run
  ```
- T3-1.4: Orchestrator STOPS. No background work.
- T3-1.5: On next user message:
  - `"continue"` → orchestrator re-reads state, checks if any scratchpad files were modified (compare mtimes or hashes), if modified → re-run affected phases, else → proceed
  - `"iterate on prd: shorten to 5 stories"` → re-run `product-manager` with delta, cascade to downstream phases
  - `"restart from ux-architect"` → set `state.phases.{uxArchitect,leadDesigner,...}.status = "pending"`, re-run from there
  - `"abort"` → set `state.meta.status = "aborted"`, cleanup

**ETA:** 1 day

#### T3-2: Implement G3 Yield

**Subtasks:**
- T3-2.1: After QA converges, orchestrator renders `DELIVERY.md`
- T3-2.2: Orchestrator outputs:
  ```
  [G3 — Delivery]

  App running at http://localhost:5173
  Run command: cd <appName> && npm run dev

  Review DELIVERY.md for the full summary.

  Self-healing summary:
  - dev-qa: 2 iterations → clean
  - runtime-inspector: 3 iterations → clean
  - design-qa: 1 iteration → clean

  Reply with:
  - `accept` — finalize the run (cleanup scratchpad, archive docs)
  - `iterate on <stage>: <delta>` — fix something specific
  - `abort` — stop, keep everything as-is
  ```
- T3-2.3: On `"accept"`:
  - Copy `.monolith/scratchpad/` to `.monolith/archive/<runId>/`
  - Delete `.monolith/scratchpad/*` (keep only DELIVERY.md in workspace root)
  - Set `state.meta.status = "completed"`
  - Print Phase 2 handoff

**ETA:** 4 hours

#### T3-3: Detect User Edits During Yield

**Subtasks:**
- T3-3.1: Before resuming from G2, compare `mtime` or `sha256` of each scratchpad file against values stored in `state.artifacts.*.lastModified`
- T3-3.2: If a file changed → mark its phase as "dirty", re-run that phase and all downstream
- T3-3.3: If no files changed → proceed directly

**ETA:** 4 hours

---

### Phase 4: Caching + Stage Skipping (Week 3, Days 1–2)

#### T4-1: Content-Addressable Cache (same as before, but state-managed)

**Changes from original:**
- Cache metadata lives in `state.cache` instead of SQLite
- Cache files still stored on disk at `.monolith/cache/`
- `state-manager.ts` handles cache key computation and lookup

**Subtasks:**
- T4-1.1: `cacheGet(type: string, inputHash: string)` → returns path or null
- T4-1.2: `cacheSet(type: string, inputHash: string, outputPath: string)`
- T4-1.3: `cacheInvalidate(type?: string)` — if no type, invalidate all
- T4-1.4: LRU eviction — walk `.monolith/cache/`, delete oldest by mtime when >1GB

**ETA:** 1 day

#### T4-2: Stage Fingerprinting (same logic, state-backed)

**Subtasks:**
- T4-2.1: `scripts/fingerprint.ts` — computes SHA-256 of stage inputs
- T4-2.2: Orchestrator checks `state.phases.<phase>.fingerprint` before invoking
- T4-2.3: If match and previous status was "done" → skip, copy cached outputs, set status to "skipped"
- T4-2.4: If miss → run, store fingerprint in state

**ETA:** 4 hours

---

### Phase 5: Dev Server + Build Optimizations (Week 3, Days 3–4)

#### T5-1: Ephemeral Vite Server via Programmatic API
Same as before (T6-1), but state-managed:
- Server PID stored in `state.server.pid`
- Server URL stored in `state.server.url`
- `scripts/stop-dev-server.ts` reads PID from state, kills process tree

**ETA:** 1 day

#### T5-2: Browser Resolution Strategy
Same as before (T6-3).
**ETA:** 4 hours

---

### Phase 6: Artifact Management (Week 3, Day 5)

#### T6-1: Scratchpad Convention

**Subtasks:**
- T6-1.1: All planning artifacts written to `.monolith/scratchpad/<name>.md`
- T6-1.2: `state.artifacts` tracks: name, summary, fullPath, tokenCount, lastModified
- T6-1.3: Agents NEVER write artifacts to `<runRoot>/docs/` directly — only to scratchpad
- T6-1.4: On G3 accept, orchestrator moves scratchpad → `.monolith/archive/<runId>/`
- T6-1.5: User can request "keep scratchpad" with `--keep-scratchpad` flag

**ETA:** 4 hours

#### T6-2: Inline Competitive Synthesis
Same as before (T7-3).
**ETA:** 2 hours

#### T6-3: Structured Deliverable Tally
Same as before (T10-2).
**ETA:** 1 hour

---

### Phase 7: Harness Integration (Week 3, Days 5–6)

#### T7-1: Harness-Native Search (no custom RAG)
Same as before (T4-1). Agents use `search:` in their reads list, harness handles it.
**ETA:** 4 hours

#### T7-2: Harness-Native Web Search
Same as before (T4-2).
**ETA:** 4 hours

#### T7-3: MCP Browser Integration (optional fallback)
Same as before (T4-3). Playwright remains the primary fallback.
**ETA:** 1 day

---

### Phase 8: Sync & Validation (Week 3, Day 7)

#### T8-1: Run `node sync-skills.js`
**ETA:** 30 seconds

#### T8-2: Verify zero model references
**ETA:** 10 seconds

#### T8-3: Verify zero SQLite/Git dependencies
```bash
grep -r "better-sqlite3\|tree-kill\|git branch\|git checkout" src/monolith/scripts/ || echo "Clean"
```
**ETA:** 10 seconds

#### T8-4: TypeScript compilation
```bash
npx tsc --noEmit
```
**ETA:** 10 seconds

#### T8-5: Smoke test
```bash
/monolith build "test product" --ds-repo ./fixtures/test-ds --lazy
```
**ETA:** 10–15 minutes

---

## Consolidated Task List (Zero-Dependency)

### P0 (Foundation — Week 1)
| ID | Task | ETA |
|---|---|---|
| T0-1 | Create `package.json` (no sqlite, no tree-kill) | 30m |
| T0-2 | Create `.monolith/` directory structure | 1h |
| T0-3 | Implement `scripts/state-manager.ts` | 2d |
| T0-4 | Create `state.schema.json` | 4h |
| T1-1..16 | Implement 14 script stubs (using state-manager) | 5d |

### P1 (Big Wins — Week 2)
| ID | Task | ETA |
|---|---|---|
| T2-1 | Rewrite orchestrator for turn-based flow | 2d |
| T2-2 | Delta-testing via patch manifests | 1d |
| T2-3 | Batch extension judging + parallel critique | 4h |
| T3-1 | G2 yield with scratchpad review | 1d |
| T3-2 | G3 yield with cleanup | 4h |
| T3-3 | Detect user edits during yield | 4h |

### P2 (Medium Wins — Week 3)
| ID | Task | ETA |
|---|---|---|
| T4-1 | Content-addressable cache (state-backed) | 1d |
| T4-2 | Stage fingerprinting (state-backed) | 4h |
| T5-1 | Vite programmatic server | 1d |
| T5-2 | Browser resolution | 4h |
| T6-1 | Scratchpad convention | 4h |
| T6-2 | Inline competitive synthesis | 2h |
| T6-3 | Structured tally | 1h |
| T7-1 | Harness-native search | 4h |
| T7-2 | Harness-native web search | 4h |
| T7-3 | MCP browser (optional) | 1d |

### P3 (Validation — Week 3, Day 7)
| ID | Task | ETA |
|---|---|---|
| T8-1 | Run sync-skills.js | 30s |
| T8-2 | Verify zero model refs | 10s |
| T8-3 | Verify zero sqlite/git deps | 10s |
| T8-4 | TypeScript compilation | 10s |
| T8-5 | Smoke test | 15m |

---

## What Changed From v1 Plan

| Area | v1 Plan (with SQLite/Git) | v2 Plan (zero-dependency) | Why |
|---|---|---|---|
| State storage | SQLite database | Single `state.json` file | No native deps, harness can read JSON natively |
| Checkpoints | 21 JSON files + SQLite | Keys in `state.json` | Atomic, single write |
| Artifacts | SQLite rows + lazy render | `.monolith/scratchpad/*.md` | User can edit directly, no DB queries |
| Delta-testing | `git diff` + affected graph | Patch manifest from developer | No Git required |
| G2 approval | Git branching + background work | Turn yield + scratchpad edit | No Git required, natural chat UX |
| G3 approval | Auto-approve with timeout | Turn yield + accept/iterate | Natural chat UX |
| Dev server cleanup | `tree-kill` on PID | Vite `createServer()` bound to script lifecycle | No extra dependency |
| Patterns | SQLite table | `log.jsonl` + lazy INDEX.md | Append-only, zero-dep |
| Issues | SQLite table | `state.issues` array | In state tree |
| npm deps | `better-sqlite3`, `tree-kill` | Removed | 2 fewer native deps |

---

## Expected Outcome

| Metric | Before (v3.2) | After (v3.3 zero-dep) | Improvement |
|---|---|---|---|
| Agent invocations (realistic) | ~40 | ~18 | **–55%** |
| QA loop time | 20–60 min | 6–15 min | **–75%** |
| Dev server boots | 10+ | 1 | **–90%** |
| Script execution | 30–60s each (agent) | <1s each (compiled) | **–99%** |
| Planning layer time | 15–30 min | 5–10 min | **–65%** |
| Human gate idle time | Unbounded | ~0 min | **–100%** |
| Context tokens per agent | 30K–80K | 3K–8K | **–75%** |
| System dependencies | None | None | Same |
| npm install time | +30s (sqlite build) | Normal | **Faster** |
| **Total runtime (realistic)** | **60–90 min** | **12–20 min** | **–80%** |
| **Total runtime (cached re-run)** | **60–90 min** | **5–10 min** | **–90%** |

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| `state.json` grows too large | Low | Summaries only in state; full docs in scratchpad |
| Concurrent writes to state.json | None | Turn-based agent = single writer |
| User deletes `.monolith/` mid-run | Low | State is re-derivable from scratchpad files |
| Patch manifest inaccurate | Low | Conservative fallback to full sweep |
| User doesn't understand turn-yielding | Low | Clear prompt: "Reply 'continue' to proceed" |
| Scratchpad clutters workspace | Low | Auto-cleanup on accept; `.gitignore` included |

---

## Success Criteria

1. ✅ `npx tsc --noEmit` passes with zero errors
2. ✅ `node sync-skills.js` completes without errors
3. ✅ Zero `model:` references in any agent file
4. ✅ Zero `better-sqlite3` or `tree-kill` in `package.json`
5. ✅ No `git` commands in any script or agent spec
6. ✅ A full run completes in <20 minutes
7. ✅ All 5 QA gates execute with full coverage
8. ✅ G2 and G3 use turn-yielding (no background work)
9. ✅ Production-grade mandate enforced
10. ✅ DS-First Mandate unchanged
11. ✅ User can edit scratchpad files during yield and agent respects changes
12. ✅ Scratchpad auto-cleans on accept
