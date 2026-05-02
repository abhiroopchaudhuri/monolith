# monolith — Master Plan & Tracker (v3.3)

> **Single execution surface.** This is both the design doc and the checklist. Everything the skill does, every artifact it produces, every agent it calls, every script it runs, every rule it enforces is enumerated here.
>
> **One-line purpose.** Take ANY natural-language product brief + ANY design system (as MCP, repo, or both) and produce a fully-researched, fully-designed, **production-grade** React app that runs on localhost — with every artifact a real design/PM/eng team would hand off, and every QA gate self-heals until clean.

---

## 0. Version history (read first)

### v3.3 — Performance + zero-dependency (current)

The big rewrite. Same output quality, ~80% faster, no system-level dependencies.

1. **Single state tree.** `.monolith/state.json` replaces 21 checkpoint JSON files. Atomic source of truth (Rule 23 rewritten).
2. **Scratchpad convention.** Planning artifacts in `.monolith/scratchpad/` during a run; archive to `.monolith/archive/<runId>/` on G3 `accept`.
3. **Turn-yielding G2/G3.** No background work, no async approvals, no Git branching. The orchestrator outputs the gate message and stops.
4. **Parallel planning tracks.** Track A (discovery) parallel; Track B (planning) parallel; Track C parallel critique.
5. **Batch DS extension judging.** All extension requests adjudicated in a single judge pass.
6. **Unified QA loop.** 5 gates parallel iter 1; delta-routed iter 2+ via developer's `<patchManifest>`.
7. **Stage fingerprinting.** Cacheable phases skip when inputs unchanged.
8. **Persistent dev server.** Vite programmatic API; one boot, HMR across patches.
9. **Lazy Playwright.** `resolve-browser.ts` falls back through env var → global cache → system browser → install.
10. **Inline competitive synthesis.** `competitive-synthesizer` agent removed; synthesis is an appendix in `market-research.md`.
11. **Structured tally.** Agents declare outputs; orchestrator computes and prints `📋` from `state.artifacts`.
12. **Zero new deps.** No SQLite, no `tree-kill`, no embedding model. Works on Windows out of the box.

### v3.2 — Universal theming + workflow discipline

1. **Universal theme normalization** into canonical `theme-spec.json` (Rule 21).
2. **DS themeability taxonomy** — tier 1–4 (Rule 22).
3. **New agent `theming-resolver`.**
4. **Checkpoint discipline** (Rule 23 — superseded by v3.3 state tree).
5. **Phase manifests** with `reads:`/`writes:` (Rule 24).
6. **Artifact size caps** (Rule 25).
7. **Deliverable tally** (Rule 26 — moved to orchestrator in v3.3).
8. **Surface templates** (9 canonical layouts).
9. **Mode flags.**
10. **Richer component manifest.**
11. **Research cache.**

### v3.1 — Premium-visual

1. **Premium aesthetic standard** — prescriptive OKLCH/type/motion/depth (Rule 19).
2. **AI-generic anti-patterns** — 25-item blacklist + canonical compound tells (Rule 20).
3. **Aesthetic-director agent.**
4. **Dimension 5 of UI excellence.**
5. **ANTI_GENERIC dev-qa gate.**
6. **Reference playbook** + DO/DON'T component examples.

### v3.0 — Market-grade

1. **Market research first** (Rule 12) + `market-researcher`.
2. **Differentiation explicit** (Rule 13) + `ux-strategist`.
3. **DS extensions ruled, not assumed** (Rule 14) + `ds-extension-judge`.
4. **Senior-designer critique** + `design-principal`.
5. **UX writing pass** + `ux-writer`.
6. **Commercial audit** + `commercial-auditor`.
7. **Evidence weights** (Rule 17).

### v2 — Production-grade + portable

1. Output portability (nothing writes inside `monolith/`).
2. Production-grade mandate.
3. Self-healing QA loops.
4. Runtime verification mandatory.
5. Gap-filling discipline.
6. New agents: `production-readiness-auditor`, `runtime-inspector`, `self-healer`.

---

## 1. Folder layout (current)

```
monolith-skill/
├── README.md                            ← root (user-facing)
├── LICENSE                              ← MIT
├── CHANGELOG.md
├── TROUBLESHOOTING.md
├── .gitignore
├── sync-skills.js                       ← copies src/monolith/ to editor folders
├── MONOLITH-PERFORMANCE-ISSUES.md       ← historical analysis docs
├── MONOLITH-PERFORMANCE-SOLUTIONS.md
├── MONOLITH-IMPLEMENTATION-PLAN.md
├── MONOLITH-ZERO-DEPENDENCY-PLAN.md     ← v3.3 ground truth
├── MONOLITH-PRODUCTION-READINESS-AUDIT.md
├── CLAUDE.md / AGENTS.md / .cursorrules ← editor trigger docs
│
├── .claude/skills/monolith/             ← synced
├── .cursor/skills/monolith/             ← synced
├── .opencode/skills/monolith/           ← synced
├── .trae/skills/monolith/               ← synced
├── .gemini/skills/monolith/             ← synced
│
└── src/monolith/                        ← MASTER COPY
    ├── plan.md                          ← this file
    ├── SKILL.md
    ├── README.md                        ← maintainer
    ├── QUICKSTART.md
    ├── TUTORIAL.md
    ├── user_tutorial.md
    ├── package.json
    ├── tsconfig.json
    ├── .gitignore
    │
    ├── agents/                          ← 24 sub-agent specs
    │   ├── orchestrator.md
    │   ├── triage.md
    │   ├── ds-indexer.md
    │   ├── guidelines-resolver.md
    │   ├── theming-resolver.md
    │   ├── market-researcher.md         ← (with inlined ## Synthesis)
    │   ├── researcher.md
    │   ├── product-manager.md
    │   ├── ux-strategist.md
    │   ├── ux-architect.md
    │   ├── lead-designer.md
    │   ├── ds-extension-judge.md
    │   ├── design-principal.md
    │   ├── aesthetic-director.md
    │   ├── ux-writer.md
    │   ├── engineering-manager.md
    │   ├── pattern-decider.md
    │   ├── developer.md
    │   ├── dev-qa.md
    │   ├── production-readiness-auditor.md
    │   ├── runtime-inspector.md
    │   ├── design-qa.md
    │   ├── commercial-auditor.md
    │   └── self-healer.md
    │
    ├── rules/                           ← enforceable doctrines
    │   ├── ds-first-mandate.md          (Rule 0)
    │   ├── custom-component-decision.md (Rule 1)
    │   ├── pattern-memory-rules.md      (Rule 2)
    │   ├── guidelines-inference-rules.md (Rule 3)
    │   ├── research-rules.md            (Rule 4)
    │   ├── copy-rules.md                (Rule 5)
    │   ├── approval-gate-rules.md       (Rule 6 — v3.3 turn-based)
    │   ├── handoff-rules.md             (Rule 7)
    │   ├── output-location-rules.md     (Rule 8)
    │   ├── production-grade-mandate.md  (Rule 9)
    │   ├── self-healing-loop.md         (Rule 10)
    │   ├── runtime-verification-rules.md (Rule 11)
    │   ├── market-research-mandate.md   (Rule 12)
    │   ├── differentiation-mandate.md   (Rule 13)
    │   ├── ds-extension-criteria.md     (Rule 14)
    │   ├── ui-excellence-standard.md    (Rule 15)
    │   ├── commercial-viability-rules.md (Rule 16)
    │   ├── evidence-weighted-decisions.md (Rule 17)
    │   ├── copy-excellence-standard.md  (Rule 18)
    │   ├── premium-aesthetic-standard.md (Rule 19)
    │   ├── ai-generic-anti-patterns.md  (Rule 20)
    │   ├── theming-input-normalization.md (Rule 21)
    │   ├── ds-themeability-taxonomy.md  (Rule 22)
    │   ├── checkpoint-discipline.md     (Rule 23 — v3.3 state tree)
    │   ├── phase-manifest-discipline.md (Rule 24)
    │   ├── artifact-size-cap.md         (Rule 25)
    │   ├── deliverable-tally.md         (Rule 26 — v3.3 orchestrator-driven)
    │   ├── anti-patterns.md
    │   ├── token-usage-rules.md
    │   ├── generation-rules.md
    │   └── planning-rules.md
    │
    ├── templates/                       ← .hbs scaffolding
    │   ├── screen.tsx.hbs
    │   ├── app.tsx.hbs
    │   ├── routes.tsx.hbs
    │   ├── main.tsx.hbs
    │   ├── theme-provider.tsx.hbs
    │   ├── vite.config.ts.hbs
    │   ├── package.json.hbs
    │   ├── tsconfig.json.hbs
    │   ├── index.html.hbs
    │   └── custom-component.tsx.hbs
    │
    ├── docs-templates/                  ← markdown artifact templates
    │   └── *.md.hbs
    │
    ├── scripts/                         ← 23 implemented TS scripts
    │   ├── state-manager.ts             ← state.json read/write/validate (THE core)
    │   ├── run-phase.ts                 ← cacheable-phase driver with fingerprinting
    │   ├── run-qa.ts                    ← unified QA loop driver
    │   ├── scratchpad-lifecycle.ts      ← detect-edits / archive / clear
    │   ├── render-planning-review.ts    ← G2 review file
    │   ├── get-affected-gates.ts        ← reads patchManifest, picks gates
    │   ├── triage-input.ts
    │   ├── index-ds-repo.ts
    │   ├── index-ds-mcp.ts
    │   ├── extract-tokens.ts
    │   ├── extract-icons.ts
    │   ├── fetch-guidelines-web.ts
    │   ├── parse-guidelines-repo.ts
    │   ├── generate-guidelines-fallback.ts
    │   ├── scaffold-app.ts
    │   ├── install-deps.ts
    │   ├── validate-generated.ts
    │   ├── axe-run.ts
    │   ├── start-dev-server.ts          ← Vite programmatic API
    │   ├── stop-dev-server.ts
    │   ├── runtime-sweep.ts
    │   ├── visual-smoke.ts
    │   └── resolve-browser.ts           ← env → cache → system → install
    │
    ├── guidelines-schema/               ← JSON schemas
    │   └── *.schema.json
    │
    ├── references/                      ← curated read-only material
    │   ├── premium-design-playbook.md
    │   ├── anti-generic-examples.md
    │   ├── surface-templates/           ← 9 canonical page layouts
    │   ├── ds-themeability-registry.md
    │   ├── domain-playbooks/
    │   ├── layout-primers/
    │   └── accessibility-checklists/
    │
    ├── prompts/                         ← reusable prompt seeds
    │   └── *.md
    │
    └── examples/                        ← starter material for new users
        ├── ds-adapters/
        │   ├── README.md
        │   └── shadcn.json              ← sample adapter
        └── sample-run/
            └── README.md                ← (real run trace populated by user)
```

Per-run output (outside the skill folder):

```
<workspaceRoot>/
├── .monolith/
│   ├── state.json
│   ├── scratchpad/                      ← live during run; archived on accept
│   ├── archive/<runId>/                 ← post-run home of scratchpad files
│   └── cache/<tier>/<hash>/             ← content-addressable cache
├── .monolith-memory/patterns/           ← cross-run pattern memory (log.jsonl)
└── <appName>/
    ├── src/                             ← generated React app
    ├── ds-knowledge/{component-index,tokens,icons}.json
    ├── guidelines/{brand,voice,...}.md
    ├── theme-spec.json
    ├── themeability-report.md
    ├── qa/                              ← per-gate QA reports
    └── DELIVERY.md
```

---

## 2. The pipeline (v3.3 flow)

A run is exactly these stages, in order. Parallelism within each track is mandatory where shown.

```
0. Path resolution + state init
   - workspaceRoot, workflowRoot, memoryRoot, runRoot, appRoot
   - .monolith/state.json initialized via stateManager.init(runId, brief)

1. triage  →  state.input.manifest

≫ G1 — INPUT (blocking) ≪
   Show manifest. Accept ok / change / rename / abort.

2. Track A — Discovery
   2a (parallel): ds-indexer ‖ guidelines-resolver ‖ market-researcher
   2b (sequential): theming-resolver
   2c (sequential): researcher

   Each cacheable phase routed through scripts/run-phase.ts:
     exit 0 = cache hit, skip
     exit 1 = cache miss, script-backed, recorded
     exit 2 = cache miss, agent-driven; orchestrator invokes agent then runs --record

3. Track B — Planning
   3a (parallel): product-manager ‖ ux-strategist
   3b (parallel): ux-architect ‖ lead-designer (early draft)

4. Track C — Design quality
   4a (batch): ds-extension-judge — all extension requests in one call
   4b (parallel): design-principal ‖ aesthetic-director
   4c (sequential): ux-writer
   4d (sequential): engineering-manager

≫ G2 — PLAN (turn-yielding) ≪
   render-planning-review.ts → .monolith/scratchpad/PLANNING_REVIEW.md
   Output yield message. STOP.
   On user reply:
     - continue  → scratchpad-lifecycle.ts detect-edits → re-run dirty phases → proceed
     - iterate on <doc>: <delta>  → re-run owning agent + downstream → re-show G2
     - restart from <phase>  → reset phases → re-run → re-show G2
     - abort  → state.meta.status = aborted

5. pattern-decider  →  state.artifacts.patternDecisions

6. developer (full-gen)
   - scaffold-app.ts → <appRoot>/**
   - install-deps.ts → npm install
   - emit <patchManifest> in response
   - state.phases.developer.summary

7. start-dev-server.ts
   - Vite createServer programmatic API
   - state.server = { pid, url, status: "running" }

8. UNIFIED QA LOOP (run-qa.ts driver)
   Iteration 1 (FULL):
     parallel: dev-qa ‖ production-readiness ‖ runtime-inspector ‖ design-qa ‖ commercial-auditor
     aggregate issues → state.issues.open[]
     self-healer → ONE patch brief
     developer (patch mode) → ONE patch + new <patchManifest>
   Iteration 2+ (DELTA):
     get-affected-gates.ts (reads latest patchManifest) → affected gates
     parallel run only affected gates
     aggregate → self-healer → developer
   Cap: 5 iterations per gate. Hard-block + escalate otherwise.

9. consolidate qa.md, regenerate patterns INDEX.md (lazy)

10. write DELIVERY.md (sections in §8.10)

≫ G3 — DELIVERY (turn-yielding) ≪
   Show summary. STOP.
   On user reply:
     - accept  → scratchpad-lifecycle.ts archive → clear → state.meta.status = completed
     - iterate on <stage>: <delta>  → re-run that stage + downstream → re-show G3
     - abort  → state.meta.status = aborted
```

### 2.1 Approval gates (summary)

| Gate | After phase | Mode | Shown to user | Accepted responses |
|---|---|---|---|---|
| G1 — Input | 1 | Blocking | `state.input.manifest` + warnings | `ok`, `change <field>`, `rename app`, `abort` |
| G2 — Plan | 4d | Turn yield | `.monolith/scratchpad/PLANNING_REVIEW.md` + scratchpad files | `continue`, `iterate on <doc>: <delta>`, `restart from <phase>`, `abort` |
| G3 — Delivery | 10 | Turn yield | `DELIVERY.md` + per-gate self-healing iter counts | `accept`, `iterate on <stage>: <delta>`, `abort` |

### 2.2 Between-stage contracts

Every phase has a typed contract in the state tree:

```
phases.<name>.{ status, attempt, fingerprint, producedAt, summary, outputs }
```

Plus its declared scratchpad files. Schema lives in `state-manager.ts`. A phase that returns with missing required summary fields is a phase failure.

---

## 3. The 24 agents (role specs — full specs in agents/*.md)

Every agent file carries: `role`, `invoked_by`, `reads:`/`writes:`/`search:` (Rule 24), system prompt, steps, fail modes, gates, outputs declaration block (Rule 26). No agent runs code; scripts do that.

| # | Agent | Track | Role | Output |
|---|---|---|---|---|
| 0 | **orchestrator** | — | Runs the whole pipeline. Holds state. Manages gates. | DELIVERY.md, state.json |
| 1 | **triage** | — | Detects shape, emits manifest. | state.input.manifest |
| 2 | **ds-indexer** | A | Component index from MCP/repo. | component-index + tokens + icons |
| 3 | **guidelines-resolver** | A | Normalize/crawl/parse/generate 7 guideline docs. | 7 guideline .md files |
| 4 | **theming-resolver** | A | Normalize theme inputs + DS tier. | theme-spec.json + themeability-report.md |
| 5 | **market-researcher** | A | Real competitors, loopholes, **inline `## Synthesis` appendix**. | market-research.md (with appendix) |
| 6 | **researcher** | A | Domain, personas, JTBDs, gap inferences. | research.md |
| 7 | **product-manager** | B | PRD with commercial lens. | prd.md |
| 8 | **ux-strategist** | B | 3–5 differentiation bets. | differentiation-map.md |
| 9 | **ux-architect** | B | Sitemap, flows, state inventory. | information_architecture.md + user_flow.md |
| 10 | **lead-designer** | B | Per-section components + tokens + states. | design_decisions.md + best_practices.md |
| 11 | **ds-extension-judge** | C | **Batch** ruling on all extension requests. | ds-extensions/<slug>.md per request |
| 12 | **design-principal** | C | Critique dimensions 1–4 (parallel with aesthetic-director). | design-principal-critique.md |
| 13 | **aesthetic-director** | C | Critique dimension 5 (premium / anti-generic). | aesthetic-audit.md |
| 14 | **ux-writer** | C | Every user-visible string rewritten. | ux-writing-pass.md |
| 15 | **engineering-manager** | C | File tree, routes, state model, custom-component specs. | build_specs.md |
| 16 | **pattern-decider** | — | Decision matrix per section. | pattern_decisions.md + new patterns |
| 17 | **developer** | — | Full-gen + patch mode; emits `<patchManifest>`. | <appRoot>/** |
| 18 | **dev-qa** | QA | tsc, eslint, build, server, axe, DS_FIRST, ANTI_GENERIC. | dev_qa_report.md |
| 19 | **production-readiness-auditor** | QA | Every-button-wired, every-state-reachable. | production-readiness.md |
| 20 | **runtime-inspector** | QA | Playwright sweep (delta-routed iter 2+). | runtime-report.md + screenshots |
| 21 | **design-qa** | QA | Visual rhythm, copy, tokens, states + premium-visual axes. | design_qa_report.md |
| 22 | **commercial-auditor** | QA | Onboarding/conversion/retention/trust/expansion. | commercial-audit.md |
| 23 | **self-healer** | QA | Aggregate issues across gates → ONE patch brief. | qa/heal-briefs/<gate>-attempt-<N>.md |

Model assignment is delegated to the harness (Rule 24's `complexity_score` field if the harness supports it). No hardcoded model names anywhere.

---

## 4. Stage 1 — Triage (decision table)

### 4.1 DS source detection

| Signal | Interpretation |
|---|---|
| MCP tool names mentioned | MCP candidate |
| Path with `package.json` + DS-like name | Repo candidate |
| URL to GitHub DS repo | Block — ask user to clone locally |
| Both | Shape H |
| Neither | Block at G1 |

### 4.2 Guidelines source detection

| Signal | Interpretation |
|---|---|
| `.md` files referenced | Provided |
| Non-repo URL | Website crawl |
| Repo has `docs/` / `README.md` / `*.mdx` | Inline |
| None | Generate fallback |

### 4.3 Prompt type

| Signal | Type |
|---|---|
| "build a <screen> for <product>" | single-screen |
| "build a <product>" | multi-screen-app |
| "add <feature> to <product>" | Block (no Phase 1.5 ingest yet) |
| Ambiguous | Ask at G1 |

### 4.4 input-manifest shape

```json
{
  "runId": "<YYYY-MM-DD>_<kebab-brief>",
  "brief": "<verbatim>",
  "ds": { "source": "...", "name": "...", "version": "...", "mcp": {...}|null, "repo": {...}|null },
  "guidelines": { "source": "...", "files": [...]|null, "url": "..."|null },
  "promptType": "...",
  "constraints": { "theme": "...", "density": "...", "breakpoints": [...], "locale": "...", "productType": "..." },
  "themeInputs": [...],
  "unresolved": [{ "field": "...", "question": "...", "blockingStage": 0 }]
}
```

`unresolved[]` drives G1.

---

## 5. Stage 2 — DS knowledge

### 5.1 The three flavors

- **MCP-only:** `index-ds-mcp.ts` queries the MCP, normalizes to `component-index.json` schema.
- **Repo-only:** `index-ds-repo.ts` ts-morph walk per the adapter.
- **Both:** parallel + reconciliation by name + importPath. Conflicts → block at G1.

### 5.2 Contract

Every downstream agent sees ONE `component-index.json`, ONE `tokens.json`, ONE `icons.json`. The indexer normalizes away the source.

### 5.3 Cache

`.monolith/cache/ds-knowledge/<hash>/` keyed on `hash(adapterMtime + repoHead + mcpVersion)`. Invalidate on any input change.

---

## 6. Stage 3 — Guidelines resolution

### 6.1 The seven canonical docs

`brand`, `voice`, `ux-principles`, `accessibility`, `content`, `motion`, `layout`. Each conforms to its JSON schema + an `.md` rendering.

### 6.2 Source-specific pipelines

- **Provided:** validate, normalize headings.
- **Website:** `fetch-guidelines-web.ts` crawls, classifies; cache 7 days.
- **Repo inline:** `parse-guidelines-repo.ts` walks docs.
- **Generated:** `generate-guidelines-fallback.ts` infers from index/tokens; every claim cites a source. `inferred: true/false` in frontmatter.

### 6.3 Hand-off

Orchestrator passes the relevant guidelines per agent's `reads:` list (Rule 24).

---

## 7. Core design policies

### 7.1 DS-First Mandate (Rule 0) — applies verbatim

### 7.2 Anti-patterns (Rule 20) — 25-item blacklist + canonical compound tells

### 7.3 Pattern memory

- Definition: recurring composition that's NOT a DS primitive.
- Storage: `.monolith-memory/patterns/log.jsonl` (append-only) + lazy `INDEX.md`.
- Lifecycle: `pattern-decider` reads INDEX/log; `design-qa` writes new patterns; `orchestrator` regenerates INDEX lazily.

### 7.4 Custom component decision tree

Codified in `rules/ds-extension-criteria.md` (Rule 14). Adjudicated in batch by `ds-extension-judge`. Layout = free; primitives = forbidden; truly novel domain UI = approved with a written ruling.

### 7.5 Realistic content

`rules/copy-rules.md` + `rules/copy-excellence-standard.md`. Voice from `guidelines/voice.md`. Seeded faker for names; rounded numbers for summary metrics; locale-aware dates.

### 7.6 Handoff to Phase 2

`rules/handoff-rules.md` — `screen-plan.json`, screenshots, running localhost.

---

## 8. The artifacts

Every doc has a template at `docs-templates/*.md.hbs` and required sections enforced by the owning agent. Caps in Rule 25.

### 8.1 `market-research.md` (with `## Synthesis` appendix)

Owner: market-researcher. Sections: market segment, competitor set, per-competitor deep-dive, genre conventions, patterns to avoid, JTBD alignment, methodology. **Mandatory appendix `## Synthesis`** with top loopholes, table stakes, patterns to avoid, pricing signal, copy vocabulary, visual signature.

### 8.2 `research.md`

Owner: researcher. Sections: domain, personas, JTBDs, context anchors, prior art, risks, **gap inferences** (mandatory), guideline anchors. Every claim evidence-tagged.

### 8.3 `prd.md`

Owner: product-manager. Sections: problem, goals/non-goals, user stories per persona, acceptance criteria, MVP vs later, success metrics, open questions, **commercial hypothesis per feature** (Rule 16).

### 8.4 `differentiation-map.md`

Owner: ux-strategist. 3–5 differentiation bets, each with competitor citation + evidence weight + UI surface where it shows up.

### 8.5 `information_architecture.md` + `user_flow.md`

Owner: ux-architect. Sitemap, nav, content hierarchy, URL scheme, empty/error/loading inventory; happy paths, alternates, decision points, screen-to-screen map.

### 8.6 `design_decisions.md` + `best_practices.md`

Owner: lead-designer. Per-section table, token applications, state plans, density, a11y intent, **DS-First audit** (extension requests collected for batch judge).

### 8.7 `ds-extensions/<slug>.md` (per request)

Owner: ds-extension-judge. Five-test ruling: approved | approved-with-modifications | denied. Justification + modifications list.

### 8.8 `design-principal-critique.md` + `aesthetic-audit.md`

Owner: design-principal (dims 1–4) + aesthetic-director (dim 5). Grades + revisions. Up to 2 revision rounds with lead-designer.

### 8.9 `ux-writing-pass.md`

Owner: ux-writer. Every user-visible string rewritten with rationale + voice anchors.

### 8.10 `build_specs.md`

Owner: engineering-manager. File tree, routes, state model, data contracts, component decomposition, custom-component specs, build/run commands.

### 8.11 `pattern_decisions.md`

Owner: pattern-decider. Decision matrix per section, new patterns introduced, blockers.

### 8.12 `commercial-audit.md`

Owner: commercial-auditor. Five surfaces graded: onboarding / conversion / retention / trust / expansion.

### 8.13 `qa.md`

Owner: orchestrator (consolidation). Concatenates dev-qa, production-readiness, runtime-inspector, design-qa, commercial-auditor reports + heal-log summary.

### 8.14 `DELIVERY.md`

Owner: orchestrator. Run summary, paths block, market positioning, differentiators, DS extensions, artifact map, self-healing summary, commercial verdict, blockers, warnings, patterns promoted, Phase 2 handoff.

---

## 9. Scripts (the JS surface)

Every script is TS, zero external state except its inputs/outputs, documented at top.

| Script | Purpose |
|---|---|
| `state-manager.ts` | Read/write/validate `.monolith/state.json` (the only writer) |
| `run-phase.ts` | Cacheable-phase driver with fingerprinting + agent fallback |
| `run-qa.ts` | Unified QA loop driver — invokes parallel gates + delta routing |
| `scratchpad-lifecycle.ts` | detect-edits / archive / clear |
| `render-planning-review.ts` | G2 review file |
| `get-affected-gates.ts` | Reads patchManifest, returns affected gates list |
| `triage-input.ts` | Detect shape A–H |
| `index-ds-repo.ts` | ts-morph DS walk |
| `index-ds-mcp.ts` | DS MCP query + normalize |
| `extract-tokens.ts` | Normalize tokens |
| `extract-icons.ts` | Enumerate icons |
| `fetch-guidelines-web.ts` | Crawl DS guideline site |
| `parse-guidelines-repo.ts` | Parse inline docs |
| `generate-guidelines-fallback.ts` | Infer from index |
| `scaffold-app.ts` | Vite + DS + routing + theme |
| `install-deps.ts` | npm install in appRoot |
| `validate-generated.ts` | Static gates (tsc, imports, props, DS_FIRST, ANTI_GENERIC) |
| `axe-run.ts` | a11y audit |
| `start-dev-server.ts` | Vite createServer programmatic API |
| `stop-dev-server.ts` | Graceful shutdown |
| `runtime-sweep.ts` | Playwright sweep across routes/viewports/forms/modals |
| `visual-smoke.ts` | Screenshot per route |
| `resolve-browser.ts` | env → cache → system → install fallback chain |

Script failure = blocker in the calling phase's report. No "best effort".

---

## 10. Tracker

> Mark `[x]` when implemented + referenced. Implementation status as of v3.3 release.

### 10.0 Foundations

- [x] `plan.md` (this file)
- [x] `SKILL.md` (frontmatter + invocation)
- [x] root `README.md`, maintainer `README.md`
- [x] `QUICKSTART.md`, `TUTORIAL.md`, `user_tutorial.md`
- [x] `LICENSE`, `CHANGELOG.md`, `TROUBLESHOOTING.md`
- [x] root `.gitignore`, `package.json`, `tsconfig.json`

### 10.1 agents/ (24 implemented)

- [x] orchestrator, triage, ds-indexer, guidelines-resolver, theming-resolver
- [x] market-researcher (with inlined Synthesis appendix), researcher
- [x] product-manager, ux-strategist, ux-architect, lead-designer
- [x] ds-extension-judge, design-principal, aesthetic-director, ux-writer, engineering-manager
- [x] pattern-decider, developer
- [x] dev-qa, production-readiness-auditor, runtime-inspector, design-qa, commercial-auditor, self-healer
- [removed] competitive-synthesizer (inlined per Solution 18)

### 10.2 rules/ (Rules 0–26 + extras)

- [x] All Rules 0–26 present and v3.3-aligned
- [x] checkpoint-discipline (Rule 23) — rewritten for state tree
- [x] phase-manifest-discipline (Rule 24) — adds `search:` field
- [x] deliverable-tally (Rule 26) — orchestrator-driven
- [x] approval-gate-rules (Rule 6) — turn-yielding G2/G3

### 10.3 templates/, docs-templates/, guidelines-schema/, references/, prompts/

- [x] All templates present
- [x] All docs-templates present
- [x] All guidelines schemas present
- [x] References (premium-design-playbook, anti-generic-examples, surface-templates, ds-themeability-registry, domain-playbooks/, layout-primers/, accessibility-checklists/)
- [x] All prompt seeds present

### 10.4 scripts/ (23 implemented)

- [x] state-manager, run-phase, run-qa, scratchpad-lifecycle, render-planning-review, get-affected-gates
- [x] triage-input, index-ds-repo, index-ds-mcp, extract-tokens, extract-icons
- [x] fetch-guidelines-web, parse-guidelines-repo, generate-guidelines-fallback
- [x] scaffold-app, install-deps, validate-generated, axe-run
- [x] start-dev-server, stop-dev-server, runtime-sweep, visual-smoke, resolve-browser

### 10.5 examples/

- [x] `ds-adapters/README.md` + `ds-adapters/shadcn.json` (sample)
- [ ] `sample-run/<runId>/` — populated after first real run by maintainer

### 10.6 End-to-end gates

- [x] G0: Folder tree exists.
- [x] G1: triage classifies all 8 shapes.
- [x] G2: ds-indexer produces valid component-index.json.
- [x] G3: guidelines-resolver produces 7 valid guideline docs.
- [x] G4: orchestrator emits all planning artifacts to `.monolith/scratchpad/`.
- [x] G5: developer scaffolds an app that boots on localhost.
- [x] G6: dev-qa passes static gates including ANTI_GENERIC.
- [x] G7: design-qa promotes new patterns via patterns log.
- [x] G8: DELIVERY.md emits valid Phase 2 handoff.
- [x] G9: G1/G2/G3 each stop until user confirms (G2/G3 turn-yielding).
- [x] G10: Second run against a different DS works with adapter only.

---

## 11. v3.3 status

The pipeline is implemented. Outstanding items tracked in `MONOLITH-PRODUCTION-READINESS-AUDIT.md` (root) — primarily example/sample-run population, smoke-test fixtures, and the documented mode-flag matrix verification.

### Smoke test command

```
npm install
npm run typecheck
# Manual end-to-end:
/monolith build "test product" --ds-repo ./examples/ds-adapters/shadcn.json --lazy
```

After every change to `src/monolith/`, run `node sync-skills.js` to propagate to editor folders.

---

## 12. Open questions

1. Default domain when brief is domain-agnostic? Default: ask at G1.
2. Fake-data realism? Default: fictional, domain-appropriate, seeded.
3. Generated-guideline "insufficient evidence"? Default: yes, must say so explicitly.
4. Pattern slug collisions? Default: `-v2` suffix, design-qa flags for human rename.
5. `.monolith/cache/` retention? Default: indefinite, LRU evicts above 1GB.
6. MCP failure mid-run? Default: try repo fallback if both provided; else block.
7. "Production-quality" QA bar? Default: tsc+eslint+build+server+axe-critical-zero+design-qa-score≥8/10+commercial-audit-no-blockers.

---

## 13. Resume + cache control flags

| Flag | Effect |
|---|---|
| `--resume <runId>` | Read `.monolith/state.json`, continue from last `done` phase |
| `--no-cache` | Bypass fingerprint cache for all cacheable phases |
| `--refresh-research` | Invalidate research + market-research cache only |
| `--refresh-ds` | Invalidate DS knowledge cache |
| `--refresh-guidelines` | Invalidate guidelines cache |
| `--keep-scratchpad` | Skip scratchpad clear on G3 accept |

---

## 14. References

- `MONOLITH-ZERO-DEPENDENCY-PLAN.md` (root) — v3.3 ground truth.
- `MONOLITH-PERFORMANCE-SOLUTIONS.md` (root) — original Solutions 1–20.
- `MONOLITH-IMPLEMENTATION-PLAN.md` (root) — superseded SQLite/Git draft.
- `MONOLITH-PRODUCTION-READINESS-AUDIT.md` (root) — outstanding-work log.
