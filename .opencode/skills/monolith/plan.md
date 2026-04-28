# monolith — Master Plan & Tracker

> **Single execution surface.** This is both the design doc and the checklist. Everything the skill does, every artifact it produces, every agent it calls, every script it runs, every rule it enforces is enumerated here. Status lives in the checkboxes — do not add status into other files.
>
> **One-line purpose.** Take ANY natural-language product brief + ANY design system (as MCP, repo, or both) and produce a fully-researched, fully-designed, **production-grade** React app that runs on localhost — with every artifact a real design/PM/eng team would hand off, and every QA gate self-heals until clean.

---

## 0.0 What changed across versions (read first if returning)

See also the workspace-root tracker: `<workspaceRoot>/WORKFLOW-EVOLUTION-TRACKER.md` — lives outside this folder per portability rule.

### v1 → v2: Production-grade + portable

Closed holes where v1 could ship half-done code (dead buttons, broken nav state, clipped layouts, app written inside the workflow folder):

1. **Output is portable.** Nothing writes inside `monolith/`. App goes to `<workspaceRoot>/<appName>/`. [rules/output-location-rules.md](rules/output-location-rules.md)
2. **Production-grade mandate.** No MVP shortcuts. Every button wired, every state reachable. [rules/production-grade-mandate.md](rules/production-grade-mandate.md)
3. **Self-healing QA loops.** dev-qa, production-readiness-auditor, runtime-inspector, design-qa iterate with self-healer → developer (patch mode) until clean or 5-iteration cap. [rules/self-healing-loop.md](rules/self-healing-loop.md)
4. **Runtime verification mandatory.** Headless-browser sweep catches nav state, scroll clipping, dead buttons, responsive failures. [rules/runtime-verification-rules.md](rules/runtime-verification-rules.md)
5. **Gap-filling discipline.** Researcher fills every PRD gap with evidence-grounded inference, surfaced at G2.
6. Three new agents: `production-readiness-auditor`, `runtime-inspector`, `self-healer`.

### v3.1 → v3.2: Universal theming + weaker-LLM discipline

Closed two gaps in cross-run consistency and theming flexibility:

1. **Universal theme normalization.** Any theming input (palette JSON, CSS file, Tailwind config, Figma variables export, design-tokens.json, brand PDF, brand-guide URL, inline, or none) is absorbed and normalized into a single canonical `theme-spec.json` with a three-tier architecture (primitives → semantics → bridge). Schema: [guidelines-schema/theme-spec.schema.json](guidelines-schema/theme-spec.schema.json). Rule: [rules/theming-input-normalization.md](rules/theming-input-normalization.md) (**Rule 21**).
2. **DS themeability taxonomy.** Every DS is classified into tier 1 (full themeable, e.g., shadcn) through tier 4 (not themeable, custom-wrap only), with per-property verdicts and fallback recipes. User is notified at G1 when the requested theme exceeds the DS's capacity. Rule: [rules/ds-themeability-taxonomy.md](rules/ds-themeability-taxonomy.md) (**Rule 22**). Registry: [references/ds-themeability-registry.md](references/ds-themeability-registry.md).
3. **New agent `theming-resolver`.** Runs after `ds-indexer` + `guidelines-resolver`. Absorbs theme inputs, classifies DS tier, emits `theme-spec.json` + `themeability-report.md`. [agents/theming-resolver.md](agents/theming-resolver.md).
4. **Checkpoint discipline.** Disk as source of truth between agents. `<runRoot>/checkpoints/*.json` replaces reliance on conversation context. **Rule 23.**
5. **Phase manifests.** Every agent declares `reads:` / `writes:` frontmatter fields. **Rule 24.**
6. **Artifact size caps.** 10K tokens per planning artifact; compression over prose. **Rule 25.**
7. **Deliverable tally.** `📋 Delivered: X | Remaining: Y` after every artifact. **Rule 26.**
8. **Surface templates.** 9 canonical page-level layouts under [references/surface-templates/](references/surface-templates/) (dashboard / list-view / detail-view / form / wizard / settings / landing / split-pane / empty-first-run). lead-designer cites one per screen.
9. **Mode flags.** `--full` / `--themeOnly` / `--planOnly` / `--lazy` / `--UXR` / `--noPRD` in the invocation.
10. **Richer component manifest.** `component-index.json` now carries `level` / `category` / `when` / `not_when` fields — helps weaker LLMs pick the right primitive.
11. **Research cache.** `<memoryRoot>/research-cache/<domain>/` for cross-run research reuse.

### v3 → v3.1: Premium-visual (anti-AI-generic)

Closed the gap between "well-planned, well-built product" and "product that doesn't look like it came out of an LLM template":

1. **Premium aesthetic standard.** Prescriptive OKLCH color ranges, type scale ratios, motion cubic-beziers, hairline borders, tiered shadows, tiered radii, 1-1-1 discipline. Every token choice traces either to a DS token or a § reference. [rules/premium-aesthetic-standard.md](rules/premium-aesthetic-standard.md) — **Rule 19**.
2. **AI-generic anti-patterns.** 25-item scannable blacklist + canonical compound tells (the centered-red-X error state, the pastel-circle-emoji empty state, the 4-shadow-md-card dashboard). Self-audit before every return. [rules/ai-generic-anti-patterns.md](rules/ai-generic-anti-patterns.md) — **Rule 20**.
3. **Aesthetic-director agent.** New gate between `design-principal` and `ux-writer`. Audits `design_decisions.md` against Rules 19 + 20, up to 2 revision rounds with lead-designer, produces `aesthetic-audit.md`. [agents/aesthetic-director.md](agents/aesthetic-director.md).
4. **Dimension 5 of UI excellence.** `ui-excellence-standard.md` gains a fifth dimension (Visual refinement), owned by aesthetic-director.
5. **ANTI_GENERIC dev-qa gate.** Source regex probes catch banned literals (Tailwind blue primaries, uniform `rounded-2xl`, `shadow-md` blanket, `transition-all`, emoji-as-icon, canonical AI copy strings) in generated code. Blocker at ≥5 matches or any canonical compound shape.
6. **Design-qa gains two axes.** Aesthetic refinement (runtime matches declared premium values) + Anti-pattern audit (runtime exhibits no compound tells). Both at higher ≥8 bar.
7. **Reference playbook.** Curated knowledge base (Linear, Vercel, Stripe, Raycast, Bloomberg, Rauno, Emil, Kennedy) at [references/premium-design-playbook.md](references/premium-design-playbook.md) and concrete DO/DON'T component code at [references/anti-generic-examples.md](references/anti-generic-examples.md). Weak LLMs pattern-match against these.

### v2 → v3: Market-grade

Closed the gap between "correctly built app" and "product that can actually win its market":

1. **Market research first.** Every run starts with real competitor analysis. [rules/market-research-mandate.md](rules/market-research-mandate.md) + `agents/market-researcher.md` (which now includes inlined competitive synthesis).
2. **Differentiation is explicit.** 3–5 bets, each citing a competitor gap + evidence weight. [rules/differentiation-mandate.md](rules/differentiation-mandate.md) + `agents/ux-strategist.md`.
3. **DS extensions are ruled, not assumed.** Five-test gate for every proposed custom component or token. [rules/ds-extension-criteria.md](rules/ds-extension-criteria.md) + `agents/ds-extension-judge.md`.
4. **Senior-designer critique.** `design-principal` grades against [rules/ui-excellence-standard.md](rules/ui-excellence-standard.md); up to 2 revision rounds with lead-designer.
5. **UX writing pass.** Every user-visible string rewritten with intent. [rules/copy-excellence-standard.md](rules/copy-excellence-standard.md) + `agents/ux-writer.md`.
6. **Commercial audit.** Before G3, every run is audited against onboarding / conversion / retention / trust / expansion surfaces. [rules/commercial-viability-rules.md](rules/commercial-viability-rules.md) + `agents/commercial-auditor.md`.
7. **Evidence weights.** Every non-trivial decision tagged `[grounded]` / `[cited-inference]` / `[domain-pattern]` / `[judgment]` / `[speculative]`. [rules/evidence-weighted-decisions.md](rules/evidence-weighted-decisions.md).

### v3 pipeline

```
triage →
  [discovery] ds-indexer ‖ guidelines-resolver ‖ market-researcher →
  [research] researcher → PM → ux-strategist →
  [design] ux-architect → lead-designer ↔ ds-extension-judge → design-principal → aesthetic-director → ux-writer →
  [specs] eng-manager →
    [G2] →
      pattern-decider → developer →
        dev-qa ↻ → production-readiness ↻ → runtime-inspector ↻ →
        design-qa ↻ → commercial-auditor ↻ →
          [G3] → DELIVERY.md
```

Five self-healing loops. Three gates. Twenty-five agents total (v3.1 adds `aesthetic-director`; v3.2 adds `theming-resolver`).

---

## 0. Read this first

### 0.1 What makes this different from `phase-1-build-with-ds`

| Dimension | `phase-1-build-with-ds` (existing) | `monolith` (this) |
|---|---|---|
| Input surface | Brief + local DS repo (required) | Brief + DS (MCP OR repo OR both), guidelines (provided OR website OR inline OR none→generate) |
| Depth | Screen plan → .tsx | Research → PRD → IA → User Flow → Design Decisions → Build Specs → Code → QA → Running prototype |
| Agents | 4 (indexer/planner/generator/validator) | 13 roles (orchestrator, triage, indexer, guidelines-resolver, researcher, PM, UX-architect, lead-designer, EM, pattern-decider, developer, dev-QA, design-QA) |
| Output | `out/<id>/screen.tsx` + plan | `out/<id>/app/` (full running React app) + 8 markdown artifacts + QA reports |
| Custom-component policy | Hard-block | Decision tree → patterns/ memory → justified custom |
| Pattern memory | None | Persistent `patterns/` folder — accumulates across runs |
| Guidelines | Implicit (DS-first) | Explicit document set, resolved or generated |
| Runtime gate | Static only (M1) | Static + dev-server boots + axe + visual smoke |

### 0.2 What this skill is NOT

- Not Figma. Zero Figma node IDs, zero `use_figma` calls. Phase 2 (`rewire-to-ds`) handles that separately.
- Not a DS authoring tool. We consume DS; we do not add components to it.
- Not multi-framework. React only. Vite only (v1).
- Not multi-app. One app per run. Multi-route is fine; multi-product is not.
- Not autonomous past the approval gates. Three hard stops (input triage → research/PRD review → design/build-spec review) require user sign-off.

### 0.3 Non-negotiables (carry over from WORKFLOW_MASTER_PLAN §0.2, extended)

- **DS-agnostic from day one.** No specific DS name ever hardcoded in any agent, rule, template, schema, or script. Adapters are the only place DS specifics live.
- **DS-First Mandate is Rule 0.** Re-use [../phase-1-build-with-ds/rules/ds-first-mandate.md](../phase-1-build-with-ds/rules/ds-first-mandate.md) verbatim; extend with the custom-component decision tree (§7.5).
- **No hallucinated props, components, icons, tokens.** If it isn't in the index or the MCP's live response, it doesn't exist.
- **Realistic, domain-appropriate content.** No Lorem. Seeded, reproducible fake data per run.
- **Every artifact has a template + a schema + an owning agent.** No ad-hoc .md.
- **Three approval gates.** No silent progress past them.
- **Fail loud.** Any missing component, missing token, missing icon, missing adapter → blocker in the relevant report, never a silent custom fallback.
- **Pattern memory is append-only.** Patterns added in a run stay for future runs. Only a human removes them.
- **Everything that would need JS belongs in a script.** Agents plan and write markdown; scripts do the mechanical work (indexing, fetching, scaffolding, validating, running).

### 0.4 What the user gives us (the five input shapes)

The skill must handle ALL combinations:

| Shape | DS source | Guidelines source |
|---|---|---|
| A | MCP only | provided .md files |
| B | MCP only | website URL to crawl |
| C | MCP only | nothing → generate from MCP metadata |
| D | Repo only | provided .md files |
| E | Repo only | website URL to crawl |
| F | Repo only | inline docs inside the repo (`docs/`, `README`, `*.mdx`) |
| G | Repo only | nothing → generate from repo + source code |
| H | MCP + Repo | any of the above — prefer MCP at runtime, reconcile with repo |

Detection is Stage 0's job. See §4.

---

## 1. Folder layout (ship this)

```
monolith/
├── plan.md                              ← this file (spec + tracker)
├── SKILL.md                             ← user-facing skill definition (frontmatter required)
├── README.md                            ← quick-start for a human maintainer
├── QUICKSTART.md                        ← 5-minute happy-path walkthrough
│
├── agents/                              ← 13 subagent specs, one .md each
│   ├── orchestrator.md
│   ├── triage.md
│   ├── ds-indexer.md
│   ├── guidelines-resolver.md
│   ├── researcher.md
│   ├── product-manager.md
│   ├── ux-architect.md
│   ├── lead-designer.md
│   ├── engineering-manager.md
│   ├── pattern-decider.md
│   ├── developer.md
│   ├── dev-qa.md
│   └── design-qa.md
│
├── rules/                               ← enforceable doctrines, referenced by agents
│   ├── ds-first-mandate.md              ← copy of Rule 0 (link back to canonical)
│   ├── anti-patterns.md
│   ├── custom-component-decision.md     ← NEW — §7.5
│   ├── pattern-memory-rules.md          ← NEW — how to add/retrieve patterns
│   ├── guidelines-inference-rules.md    ← NEW — how to auto-generate guidelines
│   ├── research-rules.md                ← NEW — disciplined research method
│   ├── copy-rules.md                    ← NEW — voice, tone, realistic content
│   ├── approval-gate-rules.md           ← NEW — what stops the pipeline
│   ├── token-usage-rules.md
│   ├── generation-rules.md
│   ├── planning-rules.md
│   └── handoff-rules.md                 ← NEW — what Phase 2 needs from our output
│
├── templates/                           ← code/scaffold templates (.hbs / .tsx)
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
├── docs-templates/                      ← markdown deliverable templates
│   ├── research.md.hbs
│   ├── prd.md.hbs
│   ├── information_architecture.md.hbs
│   ├── user_flow.md.hbs
│   ├── design_decisions.md.hbs
│   ├── best_practices.md.hbs
│   ├── build_specs.md.hbs
│   ├── qa.md.hbs
│   ├── pattern.md.hbs
│   └── delivery.md.hbs
│
├── scripts/                             ← TS scripts (the JS surface)
│   ├── triage-input.ts                  ← detect input shape (A-H)
│   ├── index-ds-repo.ts                 ← ts-morph pass over local DS
│   ├── index-ds-mcp.ts                  ← query DS MCP, normalize
│   ├── extract-tokens.ts
│   ├── extract-icons.ts
│   ├── fetch-guidelines-web.ts          ← WebFetch crawl + strip
│   ├── parse-guidelines-repo.ts         ← parse /docs inside repo
│   ├── generate-guidelines-fallback.ts  ← last-resort guidelines synthesis
│   ├── scaffold-app.ts                  ← Vite + DS + router + theme
│   ├── install-deps.ts
│   ├── validate-generated.ts
│   ├── axe-run.ts
│   ├── start-dev-server.ts              ← boots localhost, returns URL + PID
│   └── visual-smoke.ts                  ← playwright screenshot vs. expected
│
├── guidelines-schema/                   ← JSON schemas for normalized guidelines
│   ├── brand.schema.json
│   ├── voice.schema.json
│   ├── ux-principles.schema.json
│   ├── accessibility.schema.json
│   ├── content.schema.json
│   ├── motion.schema.json
│   ├── layout.schema.json
│   └── input-manifest.schema.json
│
├── patterns/                            ← pattern memory (append-only, cross-run)
│   ├── README.md                        ← what a pattern is + how to write one
│   ├── INDEX.md                         ← human-readable index of all patterns
│   └── <slug>.md                        ← one file per pattern (added by design-qa)
│
├── references/                          ← curated external references
│   ├── domain-playbooks/                ← hand-authored per-domain primers (open set)
│   ├── layout-primers/                  ← dashboard, form, table, wizard layouts
│   └── accessibility-checklists/        ← WCAG 2.2 AA quick refs
│
├── prompts/                             ← reusable system-prompt snippets
│   ├── research-seed.md
│   ├── pm-seed.md
│   ├── designer-seed.md
│   ├── developer-seed.md
│   └── qa-seed.md
│
├── examples/                            ← worked examples for the maintainer
│   └── <run-label>/                     ← replayable end-to-end example (populated after first real run)
│       ├── 00-input-brief.md
│       ├── 01-input-manifest.json
│       ├── 02-ds-index.json (small)
│       ├── 03-guidelines/*
│       ├── 04-research.md
│       ├── 05-prd.md
│       ├── 06-ia.md
│       ├── 07-user-flow.md
│       ├── 08-design-decisions.md
│       ├── 09-build-specs.md
│       ├── 10-app/ (tree only, no node_modules)
│       ├── 11-qa.md
│       └── 12-delivery.md
│
└── .cache/                              ← per-run caches, safe to wipe
    ├── ds-index/                        ← cached component indexes
    └── guidelines/                      ← cached resolved guideline docs
```

Every file in the tree above has a row in §10 Tracker.

---

## 2. The pipeline (stages)

A run is exactly these stages, in order. No stage is skippable. Stages that don't apply to a given input shape still execute and emit a "not applicable, here is why" marker.

```
         ┌─────────────────────────────────────────────────┐
         │  user invokes /monolith <brief>       │
         └──────────────────────┬──────────────────────────┘
                                │
   ┌─── Stage 0 ────────────────▼─────────────── orchestrator + triage ──┐
   │    Detect DS source. Detect guidelines source. Detect prompt type. │
   │    Emit input-manifest.json. First approval gate.                   │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 1 ──────────▼────────────────────────── ds-indexer ────────┐
   │    Build component-index + tokens + icons from the detected source.│
   │    Cache under .cache/ds-index/<ds>@<ver>/.                         │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 2 ──────────▼─────────────────── guidelines-resolver ──────┐
   │    Normalize provided / crawl website / parse repo docs / generate │
   │    fallback. Emit 7 guideline docs per guidelines-schema/.          │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 3 ──────────▼──────────────────────── researcher ──────────┐
   │    Domain inference, persona sketches, jobs-to-be-done, prior-art   │
   │    suggestions, risks. Emit docs/research.md.                       │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 4 ──────────▼──────────────────── product-manager ─────────┐
   │    Problem statement, user stories, acceptance criteria, success    │
   │    metrics, MVP scope. Emit docs/prd.md.                            │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 5 ──────────▼──────────────────── ux-architect ────────────┐
   │    Sitemap, nav model, content hierarchy, flows. Emit               │
   │    docs/information_architecture.md + docs/user_flow.md.            │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 6 ──────────▼────────────────── lead-designer ─────────────┐
   │    Per-screen component/pattern selection, token application,      │
   │    layout choices, empty/error/loading state plans. Emit            │
   │    docs/design_decisions.md + docs/best_practices.md.              │
   │    Consult patterns/ before proposing any custom primitive.         │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 7 ──────────▼───────────── engineering-manager ────────────┐
   │    File tree, routes, state model, data contracts, component       │
   │    decomposition, custom-component specs. Emit docs/build_specs.md. │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
                          ▼   ≫≫ APPROVAL GATE 2 ≪≪
                          │   show user: research + PRD + IA + design + build
                          │   spec in one condensed summary + links to full
                          │   docs. Accept: "ok" | delta | restart.
                          │
   ┌─── Stage 8 ──────────▼──────────────── pattern-decider ─────────────┐
   │    For every section in every screen: emit                         │
   │    {ds-component | ds-pattern | reused-custom-pattern |            │
   │     new-custom-pattern | blocker}. Write new patterns into          │
   │    patterns/. Emit docs/pattern_decisions.md.                       │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 9 ──────────▼──────────────────── developer ───────────────┐
   │    Scaffold Vite app, install DS, generate every screen, wire      │
   │    routes, implement data fixtures, emit out/<run>/app/.           │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 10 ─────────▼───────────────────── dev-qa ─────────────────┐
   │    tsc, eslint, build, dev-server boot, axe, DS_FIRST static gate. │
   │    Emit qa/dev_qa_report.md.                                        │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
   ┌─── Stage 11 ─────────▼──────────────────── design-qa ───────────────┐
   │    Visual rhythm, token coverage, pattern reuse ratio, copy        │
   │    realism, empty/error/loading completeness. Emit                  │
   │    qa/design_qa_report.md. Promote new patterns into patterns/.     │
   └──────────────────────┬─────────────────────────────────────────────┘
                          │
                          ▼   ≫≫ APPROVAL GATE 3 ≪≪
                          │   show user: prototype URL + QA reports + next.
                          │
   ┌─── Stage 12 ─────────▼───────────────── orchestrator ───────────────┐
   │    Emit DELIVERY.md: run summary, localhost URL, artifact map,     │
   │    blockers, next-step handoff to Phase 2.                          │
   └─────────────────────────────────────────────────────────────────────┘
```

### 2.1 Approval gates

| Gate | After stage | Shown to user | Accepted responses |
|---|---|---|---|
| **G1 — Input** | 0 | input-manifest.json + detected shape + any ambiguity | `ok`, `change X`, `abort` |
| **G2 — Plan** | 7 | condensed summary of research/PRD/IA/design/build-spec + links | `ok`, `iterate on <doc>`, `restart from <stage>`, `abort` |
| **G3 — Delivery** | 11 | localhost URL + QA reports + blockers | `accept`, `iterate on <stage>`, `log for Phase 2` |

### 2.2 Between-stage contracts

Every stage has a typed in/out contract:

```
triage.out        → input-manifest.json
ds-indexer.out    → component-index.json + tokens.json + icons.json
guidelines.out    → 7 guideline docs (schemas enforced)
researcher.out    → research.md
pm.out            → prd.md
ux-architect.out  → information_architecture.md + user_flow.md
lead-designer.out → design_decisions.md + best_practices.md
em.out            → build_specs.md
pattern-decider.out → pattern_decisions.md + (N) new patterns/<slug>.md
developer.out     → out/<run>/app/**
dev-qa.out        → qa/dev_qa_report.md
design-qa.out     → qa/design_qa_report.md + (N) promoted patterns
orchestrator.out  → DELIVERY.md
```

Contracts are enforced by the validator scripts. A missing required field is a blocker.

---

## 3. The 13 agents (role specs, short form — full specs in agents/*.md)

All agents are **subagent prompts** loaded by the orchestrator via the Agent tool. None run as separate Claude processes; they are role-prompts with scoped context and a typed output contract.

| # | Agent | Model | Role summary | Output |
|---|---|---|---|---|
| 0 | **orchestrator** | Opus | Runs the whole pipeline. Holds the plan. Invokes every other agent. Manages approval gates. | DELIVERY.md, run log |
| 1 | **triage** | Haiku | Classifies inputs into shape A-H. Detects DS source + guideline source. Emits input-manifest. | input-manifest.json |
| 2 | **ds-indexer** | Sonnet | Builds the component index from MCP or repo. Normalizes across sources. | component-index + tokens + icons |
| 3 | **guidelines-resolver** | Sonnet | Normalizes provided guidelines; crawls site; parses repo docs; falls back to inference. | 7 guideline .md files + JSON equivalents |
| 4 | **researcher** | Sonnet | Domain research, personas, jobs-to-be-done, prior-art references, risks. | research.md |
| 5 | **product-manager** | Sonnet | Problem, user stories, acceptance criteria, MVP scope, metrics. | prd.md |
| 6 | **ux-architect** | Sonnet | Sitemap, nav model, content hierarchy, user flows, decision points. | information_architecture.md + user_flow.md |
| 7 | **lead-designer** | Sonnet | Per-section component/pattern/token selection; empty/error/loading states; density; a11y intent. | design_decisions.md + best_practices.md |
| 8 | **engineering-manager** | Sonnet | File tree, routes, state model, data contracts, custom-component specs. | build_specs.md |
| 9 | **pattern-decider** | Sonnet | Decision tree per section → component/pattern/reuse/create/block. Writes new patterns to disk. | pattern_decisions.md + new patterns/*.md |
| 10 | **developer** | Sonnet | Scaffolds app. Writes every screen + route + fixture. Calls scripts for mechanical work. | out/<run>/app/** |
| 11 | **dev-qa** | Haiku | Runs static + runtime gates. Blocks on any failure. | qa/dev_qa_report.md |
| 12 | **design-qa** | Sonnet | Visual rhythm, token coverage, pattern-reuse ratio, copy, state completeness. | qa/design_qa_report.md + promotions |

Model assignment follows WORKFLOW_MASTER_PLAN §6.4 — cheap where deterministic, Sonnet where judgment, Opus only where high ambiguity (the orchestrator itself).

Agent files (agents/*.md) each carry:
- `role` — one-line role
- `inputs` — explicit list with schemas
- `outputs` — explicit list with schemas
- `system-prompt` — the prompt prefix the orchestrator injects
- `steps` — the canonical work order
- `fail-modes` — enumerated, each with a recovery path
- `gates` — what must be true to pass
- `example` — one worked example (points at examples/)

---

## 4. Stage 0 — Input triage (decision table)

Triage is the linchpin. Every downstream stage depends on it being right.

### 4.1 DS source detection

| Signal | Interpretation |
|---|---|
| User mentions MCP tool names (Figma MCP, Atlassian MCP, custom DS MCP) | MCP candidate |
| User provides a path to a repo that contains `package.json` with a DS-like name | Repo candidate |
| User provides a URL to a published DS repo (GitHub) | Repo candidate (clone required — BLOCK, ask user to clone locally first) |
| Both signals present | H — MCP + Repo |
| Neither signal present | BLOCK — ask user to provide one |

### 4.2 Guidelines source detection

| Signal | Interpretation |
|---|---|
| User attaches / references `.md` files | Provided |
| User provides a URL that is not a repo URL | Website → crawl |
| Repo contains a `docs/`, `guidelines/`, `brand/`, `principles.md`, `CONTRIBUTING.md`, `README.md` | Inline (best-effort parse) |
| None of the above | Generate fallback |

### 4.3 Prompt type detection (used by researcher + PM)

| Signal | Type |
|---|---|
| "build a <screen> for <product>" | Single screen |
| "build a <product>" | Multi-screen app |
| "add <feature> to <product>" | Feature addition (BLOCK — requires existing app context we don't have in v1) |
| Ambiguous | Ask user |

### 4.4 input-manifest.json shape

```json
{
  "runId": "<YYYY-MM-DD>_<kebab-brief>",
  "brief": "<verbatim user brief>",
  "ds": {
    "source": "mcp | repo | both",
    "name": "<ds-name>",
    "version": "<semver | commit>",
    "mcp": { "name": "...", "reachable": true } | null,
    "repo": { "path": "...", "adapterPath": "..." } | null
  },
  "guidelines": {
    "source": "provided | website | repo-inline | generated",
    "files": ["..."] | null,
    "url": "..." | null
  },
  "promptType": "single-screen | multi-screen-app",
  "constraints": {
    "theme": "light | dark | both",
    "density": "compact | comfortable | spacious",
    "breakpoints": ["sm","md","lg"],
    "locale": "en-US"
  },
  "unresolved": [ { "field": "...", "question": "...", "blockingStage": 0 } ]
}
```

`unresolved[]` drives G1. If non-empty, the orchestrator asks the user to answer each before advancing.

### 4.5 Triage output is checkpoint 1

Even when everything resolves cleanly, the orchestrator shows the manifest to the user and asks "look right? proceed?" before anything else runs. One cheap confirm saves a whole pipeline of wrong-direction work.

---

## 5. Stage 1 — DS knowledge base

### 5.1 The three flavors

**MCP-only.** Query the MCP for: component list, per-component props/variants, token list, icon list. Normalize to the `component-index.json` schema (reuse `shared/types/screen-plan.schema.json`-style schemas from existing skill; create a peer `component-index.schema.json` here).

**Repo-only.** Reuse the existing `scripts/index-ds.ts` pattern (ts-morph walk). Extend: emit not just props but `examples[]` from stories/mdx, `tokensUsed[]` from SCSS, and `a11y` metadata.

**Both.** Run both in parallel (via two scripts), reconcile by component name + import path. Conflicts → emit `ds-index-conflicts.md` and block until user picks authority.

### 5.2 Contract

Every downstream agent sees ONE `component-index.json`, ONE `tokens.json`, ONE `icons.json`. The indexer normalizes away the source difference. No agent downstream should ever branch on "MCP vs repo."

### 5.3 Cache

`.cache/ds-index/<ds-slug>@<version-hash>/` — the same cache shape as the existing skill. Invalidate on:
- DS version change
- Adapter file mtime change
- Explicit `--rebuild-index` flag

---

## 6. Stage 2 — Guidelines resolution

### 6.1 The seven canonical guideline documents

Whatever the source, we end up with these seven, each conforming to its JSON schema (for programmatic access) + a pretty `.md` rendering (for human/agent reading):

| Doc | What it captures |
|---|---|
| `brand.md` | Product name, logo usage, palette semantics, typography families, voice anchors |
| `voice.md` | Tone words, dos/don'ts, example phrases, banned phrases |
| `ux-principles.md` | 5–10 principles the DS team articulates (e.g. "progressive disclosure", "feedback within 100ms") |
| `accessibility.md` | WCAG target level, contrast minima, focus-order rules, keyboard-first expectations |
| `content.md` | Copy conventions — sentence case vs title case, number/date formats, list punctuation |
| `motion.md` | Durations, easings, when to animate vs when not to |
| `layout.md` | Grid, spacing scale, breakpoints, density rules, container widths |

### 6.2 Source-specific pipelines

**Provided.** Validate each against its schema. Normalize heading structure. If a doc is missing, fall back to inference for just that doc.

**Website.** `scripts/fetch-guidelines-web.ts` uses the WebFetch tool with a scraping prompt that asks for the seven topic slices. Cache under `.cache/guidelines/<domain>/`. Manual review step: show the user a one-line summary of what was extracted per topic before accepting.

**Repo inline.** `scripts/parse-guidelines-repo.ts` walks the DS repo for likely doc files and classifies each paragraph into one of the seven topics. Low-confidence classifications → flagged in the output.

**Generated fallback.** `scripts/generate-guidelines-fallback.ts` feeds the component index + token map + any README into a Sonnet prompt with one job: produce the seven docs using ONLY evidence present in the index/tokens — never invent principles. Hard rule: every claim in a generated guideline must cite a component, token, or snippet of source it was derived from. If a topic has zero evidence, the doc says so explicitly and is marked `inferred: false`.

### 6.3 Guideline hand-off

The orchestrator injects the relevant guideline excerpt into each subsequent agent's system prompt:
- researcher sees voice + ux-principles
- PM sees ux-principles + accessibility
- ux-architect sees layout + content
- lead-designer sees ALL seven
- developer sees layout + accessibility + motion
- dev-qa sees accessibility + motion
- design-qa sees ALL seven

---

## 7. The core design policies (the hard stuff)

### 7.1 DS-First Mandate — applies verbatim

Re-export [../phase-1-build-with-ds/rules/ds-first-mandate.md](../phase-1-build-with-ds/rules/ds-first-mandate.md) as `rules/ds-first-mandate.md`. Every agent in `agents/` that touches UI output quotes the mandate at the top of its prompt.

### 7.2 Anti-patterns — applies verbatim

Re-export the existing anti-pattern catalog. Extend with two new categories:
- **Research anti-patterns** (e.g., inventing personas, citing non-existent studies)
- **PM anti-patterns** (e.g., padding the MVP with non-critical features)

### 7.3 Pattern memory — how it actually works

**Definition.** A pattern is a recurring piece of UI composition that is NOT a DS primitive but IS worth keeping because it appears across screens. Examples: a "metric trio with trend sparkline", a "two-column split form with sticky submit", a "bottom-nav with overflow menu", a "skeleton-screen loading sequence for a list".

**Storage.** `patterns/<kebab-slug>.md`. Each pattern doc contains:

```markdown
---
slug: metric-trio-sparkline
when: dashboard summary rows where three KPIs share a trend line
created: 2026-04-22
owner: design-qa (promoted from run <runId>)
uses-ds: [Card, Typography.Title, Typography.Text]
uses-tokens: [color/brand/*, space/200, space/300, radius/md]
uses-custom: [MiniSparkline]
---

## When to use
…

## Structure
<ascii or bullet outline>

## Code skeleton
```tsx
<Card>…</Card>
```

## Don't use when
…

## Accessibility notes
…

## Variants
…
```

**Lifecycle.**
- **pattern-decider** reads `patterns/INDEX.md` in Stage 8 and cites any reused pattern by slug.
- **design-qa** in Stage 11 identifies NEW recurring custom compositions and writes new `patterns/<slug>.md` files.
- **orchestrator** regenerates `patterns/INDEX.md` at end-of-run.
- **no agent ever deletes a pattern.** That is a human-only action.

### 7.4 Custom component decision tree

This is the single hardest decision in the pipeline. Codified as `rules/custom-component-decision.md`. Evaluated by **pattern-decider** per section, visible to user, overridable.

```
For each UI need S in a screen:

  1. Is there a DS component C whose name, semantics, and variants fit S?
     → YES. Use C. DONE.

  2. Can C1 + C2 + … from the DS be composed to satisfy S without new CSS?
     → YES. Compose. Document composition in design_decisions.md.

  3. Is there a DS pattern (from docs/guidelines) that describes S?
     → YES. Follow the pattern. Cite source.

  4. Is there an entry in patterns/INDEX.md that satisfies S?
     → YES. Reuse the pattern. Record reuse in pattern_decisions.md.

  5. Is S a LAYOUT / COMPOSITION rather than a primitive?
     (Layout = arrangement of DS components in space.
      Primitive = button, input, chip, select, dialog, shadow, focus ring.)
     → LAYOUT. Build inline in the screen file. Cite tokens used.
       If it's likely to recur: propose a new pattern (design-qa will
       decide at QA-time whether to promote it).
     → PRIMITIVE. STOP. This is a DS-First violation. Block the run
       with reason "missing DS primitive: <name>". Never silently custom.

  6. Is S a truly novel, domain-specific piece of UI with no DS analog?
     (e.g., a domain-specific visualization, a complex diagram, a bespoke chart
      type that has no generic DS analog)
     → YES. Create under app/src/custom/<name>/. Follow custom-component
       template. Use ONLY DS tokens. Document in custom_components/<name>.md.
       Flag for DS-team contribution in delivery.md.

  7. Otherwise → block, escalate to user.
```

**The key insight:** Layout is free; primitives are forbidden. Patterns are the compromise — when layout recurs, give it a name.

### 7.5 Realistic content

`rules/copy-rules.md` specifies:
- Domain-appropriate noun/verb pools seeded from the brief + research.md
- Realistic names via seeded faker (seed = runId)
- Realistic numbers (rounded like a real product would, e.g. "$1,284" not "$1234.56" for a summary metric)
- Voice from `guidelines/voice.md`
- Dates in `locale` from input-manifest
- Never Lorem; never placeholder symbols

### 7.6 Handoff to Phase 2

`rules/handoff-rules.md` specifies exactly what Phase 2 (`rewire-to-ds`) needs from our output:
- `screen-plan.json` per screen (sections, copy, variant intent, landmarks)
- Screenshot per screen
- `app/` rendered and reachable, so Phase 1.5 can html.to.design from localhost

This contract is the same as the existing skill; we reuse the schema.

---

## 8. The markdown artifacts (what each contains)

Every doc has a template at `docs-templates/*.md.hbs`. Every doc has required sections. The owning agent fills them; the orchestrator refuses to advance if required sections are empty.

### 8.1 `docs/research.md`

Owner: researcher. Required sections:

- **Domain overview** — 1-2 paragraphs, cite sources or DS guideline docs.
- **Personas** — 2–3 personas, each with goals, frustrations, context of use. No invented demographics.
- **Jobs to be done** — verb-led list.
- **Prior art references** — links / names of similar products to study. Must be real.
- **Risks & unknowns** — what we DON'T know yet and would need to learn before shipping v1.
- **Guideline anchors** — which items from `guidelines/*.md` explicitly inform this research.

### 8.2 `docs/prd.md`

Owner: product-manager. Required sections:

- **Problem statement** — 1-3 sentences, user-centric.
- **Goals & non-goals** — explicit both.
- **User stories** — as-a / i-want / so-that, grouped by persona.
- **Acceptance criteria** — testable bullets per story.
- **MVP scope vs later** — two columns.
- **Success metrics** — leading + lagging, each with a how-we-measure.
- **Open questions** — to raise at G2.

### 8.3 `docs/information_architecture.md`

Owner: ux-architect. Required sections:

- **Sitemap** — ASCII tree.
- **Nav model** — primary/secondary, mobile vs desktop.
- **Content hierarchy** — per page: H1/H2/H3 expectations, landmarks.
- **URL scheme** — routes table.
- **Empty/error/loading inventory** — per page.

### 8.4 `docs/user_flow.md`

Owner: ux-architect. Required sections:

- **Happy path** per top user story — step-by-step.
- **Alternate paths** — errors, empty states, recovery.
- **Decision points** — where branches happen.
- **Screen-to-screen map** — from/to/trigger table.

### 8.5 `docs/design_decisions.md`

Owner: lead-designer. Required sections:

- **Per-section component choices** — table: section → chosen component → alternative considered → rationale.
- **Token applications** — table: surface → token → reason.
- **State plans** — empty / error / loading / success, per screen.
- **Density & breakpoints** — decisions per screen.
- **A11y intent** — focus order, landmark plan, announcement plan.
- **DS-First audit** — verbatim section listing any proposed custom component with justification.

### 8.6 `docs/best_practices.md`

Owner: lead-designer. Required sections:

- **Project-specific practices** — what we're doing here that other projects should copy.
- **Project-specific anti-practices** — what we're NOT doing and why.
- **Token discipline** — how this project uses tokens (vars vs theme vs className).
- **Copy discipline** — the voice rules actually in use.
- **A11y practices** — beyond the DS defaults, what we enforce.

### 8.7 `docs/build_specs.md`

Owner: engineering-manager. Required sections:

- **File tree** — annotated.
- **Routes** — path → file → layout → data dependency.
- **State model** — per feature: where state lives, shape, mutation triggers.
- **Data contracts** — fake-data shape and fixture source per screen.
- **Component decomposition** — top-down split: screen → sections → components.
- **Custom components spec** — one sub-section per custom component with props, variants, a11y, tokens used.
- **Build + run commands** — exact CLI to reproduce locally.

### 8.8 `docs/pattern_decisions.md`

Owner: pattern-decider. Required sections:

- **Decision matrix** — one row per section across all screens, columns: needed-UI | decision | pattern-or-component | rationale.
- **New patterns introduced** — links to new `patterns/<slug>.md`.
- **Blockers** — any `missing-DS-primitive` blockers.

### 8.9 `docs/qa.md` (consolidation)

Owner: orchestrator at end-of-run. Concatenates dev_qa_report + design_qa_report with a one-page summary at top.

### 8.10 `docs/delivery.md`

Owner: orchestrator. Required sections:

- **Run summary** — runId, brief, DS, guidelines source, duration.
- **Artifact map** — table of every file produced + path.
- **Localhost URL** — with start command.
- **Blockers & warnings** — carried forward.
- **Phase 2 handoff** — what to hand off + exact command.

---

## 9. Scripts (the JS surface)

Every script is TS, zero external state except its inputs/outputs, documented at top with a `USAGE:` block. All scripts live under `scripts/` and are callable via `ts-node` or `tsx`.

| Script | Purpose | Inputs | Outputs |
|---|---|---|---|
| `triage-input.ts` | Detect shape A-H | brief + env | input-manifest.json |
| `index-ds-repo.ts` | ts-morph DS walk | adapter.json | component-index.json |
| `index-ds-mcp.ts` | DS MCP query + normalize | mcp name | component-index.json |
| `extract-tokens.ts` | Normalize tokens | adapter | tokens.json |
| `extract-icons.ts` | Enumerate icons | adapter | icons.json |
| `fetch-guidelines-web.ts` | Crawl DS guideline site | URL | 7 guideline docs |
| `parse-guidelines-repo.ts` | Parse inline docs | repo root | 7 guideline docs |
| `generate-guidelines-fallback.ts` | Infer from index | index + tokens | 7 guideline docs |
| `scaffold-app.ts` | Vite + DS + routing + theme | build-specs | out/<run>/app/ |
| `install-deps.ts` | npm install in the scaffolded app | app path | exit code |
| `validate-generated.ts` | Static gates | app path + index | dev_qa_report snippets |
| `axe-run.ts` | Axe core CLI | URL | a11y_report.json |
| `start-dev-server.ts` | Boot localhost | app path | `{url, pid}` |
| `visual-smoke.ts` | Playwright screenshot per route | URL + routes | screenshots/*.png |

Script failure = blocker in the calling stage's report. No "best effort".

---

## 10. Tracker — every file, every gate

> Mark `[x]` when the file exists, is correct, and is referenced by at least one other file or agent. Bullets beneath are acceptance criteria. Do not mark a parent until all children are marked.

### 10.0 Foundations

- [x] `plan.md` — this file
- [x] `SKILL.md` — with required frontmatter (name, description)
- [x] `README.md` — maintainer primer
- [x] `QUICKSTART.md` — 5-minute happy path
- [x] `TUTORIAL.md` — scenario walkthrough for every input shape

### 10.1 agents/

- [x] `agents/orchestrator.md` — runs pipeline, owns gates, renders DELIVERY.md
- [x] `agents/triage.md` — emits input-manifest.json
- [x] `agents/ds-indexer.md` — emits component-index/tokens/icons
- [x] `agents/guidelines-resolver.md` — emits 7 guideline docs
- [x] `agents/researcher.md` — emits research.md
- [x] `agents/product-manager.md` — emits prd.md
- [x] `agents/ux-architect.md` — emits IA + user flow
- [x] `agents/lead-designer.md` — emits design decisions + best practices
- [x] `agents/engineering-manager.md` — emits build specs
- [x] `agents/pattern-decider.md` — emits pattern decisions + new patterns
- [x] `agents/developer.md` — emits out/<run>/app/
- [x] `agents/dev-qa.md` — emits dev_qa_report
- [x] `agents/design-qa.md` — emits design_qa_report + pattern promotions

### 10.2 rules/

- [x] `rules/ds-first-mandate.md` — re-export of Rule 0
- [x] `rules/anti-patterns.md` — carry over + extended
- [x] `rules/custom-component-decision.md` — decision tree from §7.4
- [x] `rules/pattern-memory-rules.md` — lifecycle from §7.3
- [x] `rules/guidelines-inference-rules.md` — fallback method from §6.2
- [x] `rules/research-rules.md` — disciplined research method
- [x] `rules/copy-rules.md` — voice, realism, fake-data rules
- [x] `rules/approval-gate-rules.md` — G1/G2/G3 contract
- [x] `rules/token-usage-rules.md` — carry over
- [x] `rules/generation-rules.md` — carry over + extended
- [x] `rules/planning-rules.md` — carry over + extended
- [x] `rules/handoff-rules.md` — Phase 2 contract

### 10.3 templates/ (code)

- [x] `templates/screen.tsx.hbs`
- [x] `templates/app.tsx.hbs`
- [x] `templates/routes.tsx.hbs`
- [x] `templates/main.tsx.hbs`
- [x] `templates/theme-provider.tsx.hbs`
- [x] `templates/vite.config.ts.hbs`
- [x] `templates/package.json.hbs`
- [x] `templates/tsconfig.json.hbs`
- [x] `templates/index.html.hbs`
- [x] `templates/custom-component.tsx.hbs`

### 10.4 docs-templates/ (artifact templates)

- [x] `docs-templates/research.md.hbs`
- [x] `docs-templates/prd.md.hbs`
- [x] `docs-templates/information_architecture.md.hbs`
- [x] `docs-templates/user_flow.md.hbs`
- [x] `docs-templates/design_decisions.md.hbs`
- [x] `docs-templates/best_practices.md.hbs`
- [x] `docs-templates/build_specs.md.hbs`
- [x] `docs-templates/qa.md.hbs`
- [x] `docs-templates/pattern.md.hbs`
- [x] `docs-templates/delivery.md.hbs`

### 10.5 scripts/ (stubs with USAGE headers; implementations in M1+)

- [x] `scripts/triage-input.ts` (stub)
- [x] `scripts/index-ds-repo.ts` (stub)
- [x] `scripts/index-ds-mcp.ts` (stub)
- [x] `scripts/extract-tokens.ts` (stub)
- [x] `scripts/extract-icons.ts` (stub)
- [x] `scripts/fetch-guidelines-web.ts` (stub)
- [x] `scripts/parse-guidelines-repo.ts` (stub)
- [x] `scripts/generate-guidelines-fallback.ts` (stub)
- [x] `scripts/scaffold-app.ts` (stub)
- [x] `scripts/install-deps.ts` (stub)
- [x] `scripts/validate-generated.ts` (stub)
- [x] `scripts/axe-run.ts` (stub)
- [x] `scripts/start-dev-server.ts` (stub)
- [x] `scripts/visual-smoke.ts` (stub)

### 10.6 guidelines-schema/

- [x] `guidelines-schema/brand.schema.json`
- [x] `guidelines-schema/voice.schema.json`
- [x] `guidelines-schema/ux-principles.schema.json`
- [x] `guidelines-schema/accessibility.schema.json`
- [x] `guidelines-schema/content.schema.json`
- [x] `guidelines-schema/motion.schema.json`
- [x] `guidelines-schema/layout.schema.json`
- [x] `guidelines-schema/input-manifest.schema.json`

### 10.7 patterns/

- [x] `patterns/README.md` — pattern authoring spec
- [x] `patterns/INDEX.md` — auto-generated index (starts empty)
- [x] `patterns/.gitkeep` — allow empty start

### 10.8 references/

- [x] `references/domain-playbooks/README.md`
- [x] `references/layout-primers/README.md`
- [x] `references/accessibility-checklists/README.md`

### 10.9 prompts/

- [x] `prompts/research-seed.md`
- [x] `prompts/pm-seed.md`
- [x] `prompts/designer-seed.md`
- [x] `prompts/developer-seed.md`
- [x] `prompts/qa-seed.md`

### 10.10 examples/

- [ ] `examples/<run-label>/` — full replayable trace (populated after first end-to-end run)

### 10.11 End-to-end gates

- [ ] G0: Folder tree exists, every path in §1 present.
- [ ] G1: `triage-input.ts` correctly classifies all 8 shapes on test briefs.
- [ ] G2: `ds-indexer.md` produces a valid `component-index.json` for the first DS onboarded (MCP or repo).
- [ ] G3: `guidelines-resolver.md` produces 7 valid guideline docs for the same DS (exercise each guideline source at least once — provided, website, repo-inline, generated).
- [ ] G4: Full orchestrator run on a non-trivial brief emits all 10 markdown artifacts without empty required sections.
- [ ] G5: `developer.md` scaffolds a Vite app that `npm install && npm run dev` boots on localhost.
- [ ] G6: `dev-qa.md` passes tsc + eslint + DS_FIRST + axe on the generated app.
- [ ] G7: `design-qa.md` promotes ≥1 new pattern into `patterns/` across two representative runs.
- [ ] G8: `DELIVERY.md` lists a valid localhost URL and a clean Phase 2 handoff command.
- [ ] G9: Approval gates G1/G2/G3 each actually stop the run until user confirms (verified by injecting a `hold` response).
- [ ] G10: Second run against a DIFFERENT DS works without changing any agent, rule, template, or script — only a new adapter file is required.

---

## 11. Build order (first pass)

Strict order. Do not parallelize across milestones; within a milestone, parallelize freely.

**M0 — Scaffolding (this pass).**
- Create folder tree §1.
- Write `plan.md` (this file).
- Write `SKILL.md`, `README.md`, `QUICKSTART.md`.
- Write all agents/*.md with full specs (not stubs).
- Write all rules/*.md — fresh content for the new ones, re-export for carry-overs.
- Write all docs-templates/*.md.hbs.
- Write all guidelines-schema/*.json.
- Write patterns/README.md + INDEX.md stub.
- Write prompts/*.md.
- Stub scripts/*.ts with a USAGE: header + a clearly marked `TODO: implement` body.
- Stub code templates.

**M1 — Indexing + guidelines work end-to-end.**
- Implement `index-ds-repo.ts` (reuse existing skill's index-ds.ts wholesale).
- Implement `index-ds-mcp.ts` (new).
- Implement `extract-tokens.ts` + `extract-icons.ts`.
- Implement `parse-guidelines-repo.ts` against whichever DS is used as the first proving ground.
- Implement `generate-guidelines-fallback.ts`.
- Tracker gates G1, G2, G3 pass.

**M2 — Planning layer.**
- Exercise researcher, PM, ux-architect, lead-designer, EM agents end-to-end against a real brief.
- Tracker gate G4 passes.

**M3 — Generation layer.**
- Implement pattern-decider.
- Implement developer + scaffold-app.ts + install-deps.ts.
- Tracker gates G5, G8 pass.

**M4 — QA + pattern promotion.**
- Implement dev-qa + validator scripts.
- Implement design-qa + pattern promotion logic.
- Tracker gates G6, G7 pass.

**M5 — Second DS proof.**
- Add a DIFFERENT DS (adapter file only — no code changes elsewhere).
- Re-run full pipeline end to end.
- Tracker gate G10 passes.

Each milestone ends with an appended entry in §12 Run log.

---

## 12. Run log (append-only)

_This section is for real run traces. Not for planning edits. Format per entry:_

```
### <date> — <milestone> — <brief label>
- ran: <orchestrator command>
- gates passed: G1, G2, …
- gates failed: <none | list with reasons>
- artifacts: <path>
- patterns promoted: <list>
- next: <concrete action>
```

_Entries follow._

### 2026-04-22 — M0 — Skill scaffolded

- ran: (no orchestrator run — pure file scaffolding)
- gates passed: G0 (folder tree exists, every path in §1 present)
- gates failed: n/a
- artifacts:
  - `plan.md`, `SKILL.md`, `README.md`, `QUICKSTART.md`
  - 13 agent specs under `agents/`
  - 12 rules under `rules/` (7 new, 5 re-exported from phase-1-build-with-ds)
  - 10 markdown artifact templates under `docs-templates/`
  - 10 code templates under `templates/`
  - 14 script stubs under `scripts/` (all with USAGE headers + TODO bodies)
  - 8 JSON schemas under `guidelines-schema/`
  - `patterns/README.md` + empty `patterns/INDEX.md` + `.gitkeep`
  - 3 reference READMEs (domain-playbooks, layout-primers, accessibility-checklists)
  - 5 prompt seeds under `prompts/`
- patterns promoted: none (patterns/ is empty until first real run)
- next: M1 — implement `index-ds-repo.ts`, `index-ds-mcp.ts`, `extract-tokens.ts`, `extract-icons.ts`, `parse-guidelines-repo.ts`, `generate-guidelines-fallback.ts`. Smoke against whichever DS is picked as the first proving ground to verify Tracker gates G1, G2, G3.

---

## 13. Open questions (resolve at G1 or inline with user)

1. Do we want a default domain when the brief is domain-agnostic? (e.g., assume SaaS unless told.) Current default: ask user at G1.
2. How strict is fake-data realism? Real org/person names vs fictional? Current default: fictional, clearly non-real (domain-appropriate placeholders).
3. When generating guideline fallbacks, is it acceptable to output "insufficient evidence"? Current: yes, must say so explicitly.
4. Pattern slug collisions — how handled? Current: suffix `-v2`, design-qa flags for human rename.
5. How long do we keep `.cache/`? Current: indefinite, user wipes.
6. MCP failure during a run — retry, fall back to repo, or block? Current: try repo fallback if both provided; else block.
7. What's the exact "production-quality" bar for QA before we call a prototype "done"? Codify in `rules/handoff-rules.md` — current draft: tsc+eslint+build+server+axe-critical-zero+design-qa-score≥8/10.

---

## 13.1 Shippability snapshot (read this before expecting the skill to run)

| Surface | Content-complete? | Runtime-ready? |
|---|---|---|
| Entry docs — `SKILL.md`, `README.md`, `QUICKSTART.md`, `TUTORIAL.md`, `plan.md` | ✅ | n/a |
| 13 agents under `agents/` | ✅ | Ready — they're prompts |
| 12 rules under `rules/` | ✅ | Ready — they're doctrines |
| 10 artifact templates under `docs-templates/` | ✅ | Ready |
| 10 code templates under `templates/` | ✅ | Ready |
| 8 JSON schemas under `guidelines-schema/` | ✅ | Ready |
| 5 prompt seeds under `prompts/` | ✅ | Ready |
| 3 reference READMEs | ✅ (seed content; open set) | Ready |
| Pattern memory scaffolding (`patterns/README.md` + empty `INDEX.md`) | ✅ | Ready — fills at runtime |
| 14 scripts under `scripts/` | Stubs with `USAGE:` + `TODO: implement` | ❌ — need M1–M4 work |
| `package.json` / `tsconfig.json` at skill root | Missing | ❌ — needed to run scripts |
| At least one DS adapter | `../shared/ds-adapters/ant-design.json` exists (external) | ⚠️ — only one |
| End-to-end example trace under `examples/` | Empty | ⚠️ — populated after first real run |

**Interpretation:**
- The skill is a **complete specification** any maintainer or agent can build against.
- The skill is **not a runnable pipeline** until the scripts under §10.5 are implemented per §11 M1–M4.
- Agents, rules, templates, and schemas are final and can be used directly as prompts/context in the meantime.

## 14. References (internal)

- [../WORKFLOW_MASTER_PLAN.md](../WORKFLOW_MASTER_PLAN.md) — the umbrella plan for Phase 1/1.5/2.
- [../phase-1-build-with-ds/SKILL.md](../phase-1-build-with-ds/SKILL.md) — the older, narrower Phase 1 (v0.5).
- [../phase-1-build-with-ds/rules/ds-first-mandate.md](../phase-1-build-with-ds/rules/ds-first-mandate.md) — Rule 0 canonical.
- [../phase-2-rewire-to-ds/](../phase-2-rewire-to-ds/) — Phase 2 consumer of our output.
- [../shared/](../shared/) — cross-phase adapters, types, prompts.
- [../apply-design-system/SKILL.md](../apply-design-system/SKILL.md) — reference for the original Figma-skill scaffolding we improve upon.
