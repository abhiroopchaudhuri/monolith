---
name: monolith
description: End-to-end market-grade product build. Given a brief and ANY design system (MCP, repo, or both — with guidelines provided, as a website, inline, or auto-generated), orchestrate a full product organization — market research, competitive synthesis, differentiation strategy, research, PRD with commercial lens, IA, design with DS-extension judge rulings, senior-designer critique, aesthetic-director premium-visual gate, UX writing pass, engineering specs, pattern decisions — then ship a React app that has been click-tested at four viewports and commercially audited. Five self-healing QA loops: dev-qa (including ANTI_GENERIC gate), production-readiness, runtime, design, commercial. Three approval gates. No dead buttons, no undifferentiated products, no MVP shortcuts, no AI-generic aesthetic.
---

# monolith

A single-command route from a one-line brief to a **market-grade**, documented, QA'd React app running on localhost — against ANY design system, with explicit competitive research, differentiation strategy, and commercial viability built in.

> **Before anything else, read [plan.md](plan.md).** That is the spec AND the tracker.
>
> This skill is not a prototype generator, and not an MVP generator. It behaves as a complete product organization with opinions about where the DS ends, where customization is justified, what makes the product win in its market, and whether the output is actually sellable. See [rules/production-grade-mandate.md](rules/production-grade-mandate.md) and [rules/ui-excellence-standard.md](rules/ui-excellence-standard.md).

---

## The organizational metaphor

| Real org role | This skill's agent |
|---|---|
| Market / competitive researcher (+ synthesis) | `market-researcher` |
| Product researcher | `researcher` |
| Product manager | `product-manager` |
| UX strategist | `ux-strategist` |
| UX architect | `ux-architect` |
| Lead designer | `lead-designer` |
| DS principles gatekeeper | `ds-extension-judge` |
| Theming engineer (normalizer + themeability classifier) | `theming-resolver` |
| Principal designer (critic) | `design-principal` |
| Aesthetic director (premium-visual gate) | `aesthetic-director` |
| UX writer | `ux-writer` |
| Engineering manager | `engineering-manager` |
| Pattern librarian | `pattern-decider` |
| Software engineer | `developer` |
| Test engineer (static) | `dev-qa` |
| Test engineer (runtime) | `runtime-inspector` |
| QA auditor | `production-readiness-auditor` |
| Design QA | `design-qa` |
| Growth / commercial auditor | `commercial-auditor` |
| Project conductor | `orchestrator` |
| Scoped patch engineer | `self-healer` + `developer (patch mode)` |

Each is a real role with a real output. Agents do NOT duplicate each other's work.

---

## When to use

- "Build `<product>` with `<design-system>`."
- "Build `<product>` to compete with `<real competitor>` on `<axis>`."
- "Build `<product>`. `<design-system>` is available via MCP. Guidelines live at `<url>`."
- "Ship `<feature>` using `<design-system>`. I want to know what makes it distinctive before building."

Use this whenever the user wants a FULL run — research → code → market-grade running app — against ANY design system, and is willing to approve at three checkpoints.

## When NOT to use

- Incremental edits to an existing screen.
- Figma-side work (Phase 2).
- Adding a new component to the DS (DS authoring).
- Multi-framework (Vue, Svelte) — React + Vite only.

---

## Pipeline in one breath (v3)

```
triage →
  [discovery] ds-indexer ‖ guidelines-resolver ‖ market-researcher (includes competitive synthesis) →
              theming-resolver (normalizes theme inputs + DS themeability tier) →
  [research] researcher → PM → ux-strategist (3–5 differentiators) →
  [design] ux-architect → lead-designer ↔ ds-extension-judge → design-principal → aesthetic-director → ux-writer →
  [specs] eng-manager →
    [ ≫ G2 ≪ ] →
      pattern-decider → developer →
        dev-qa [↻] → production-readiness [↻] → runtime-inspector [↻] →
        design-qa [↻] → commercial-auditor [↻] →
          [ ≫ G3 ≪ ] → DELIVERY.md + localhost URL
```

**State flow.** Phase state lives in `.monolith/state.json` (unified state tree, Rule 23). Each agent declares `reads:` / `writes:` explicitly (Rule 24). Planning artifacts are size-capped (Rule 25). Every agent emits a `📋 Delivered: X | Remaining: Y` tally per artifact (Rule 26).

Five `[↻]` self-healing loops. Max 5 iterations per gate. Hard-block with escalation otherwise.

---

## Output layout (portable)

```
<workspaceRoot>/
├── monolith/               ← workflow (never written to)
├── .monolith-memory/patterns/         ← persistent pattern memory
├── <appName>/                       ← run root: app + artifacts
│   ├── .monolith/                   ← state tree (Rule 23)
│   │   └── state.json
│   ├── src/                         ← generated React app
│   ├── docs/                        ← planning artifacts
│   │   ├── market-research.md
│   │   ├── competitive-synthesis.md
│   │   ├── research.md               (with Gap Inferences)
│   │   ├── prd.md
│   │   ├── differentiation-map.md
│   │   ├── information_architecture.md
│   │   ├── user_flow.md
│   │   ├── design_decisions.md
│   │   ├── design-principal-critique.md
│   │   ├── aesthetic-audit.md
│   │   ├── ds-extensions/<slug>.md
│   │   ├── ux-writing-pass.md
│   │   ├── build_specs.md
│   │   ├── pattern_decisions.md
│   │   ├── commercial-audit.md
│   │   └── qa.md
│   ├── qa/                          ← QA reports
│   ├── ds-knowledge/                ← DS index + tokens + icons
│   ├── guidelines/                  ← seven topic docs
│   ├── theme-spec.json              ← normalized theme (Rule 21)
│   ├── themeability-report.md       ← DS tier + fallbacks (Rule 22)
│   └── DELIVERY.md
└── <appName>/                        ← the running app
```

---

## Invocation

```
/monolith build a {PRODUCT}
  - DS: {mcp:<name> | repo:<path> | both}
  - Guidelines: {files:<paths> | url:<link> | repo-inline | auto}
  - Theme: {light | dark | both}
  - ThemeInputs: {palette:<path> | css:<path> | tokens:<path> | figma-export:<path> |
                  tailwind-config:<path> | brand-url:<url> | inline:<values> | none}
                  (normalized by theming-resolver per Rule 21; may be multiple)
  - Density: {compact | comfortable | spacious}
  - Locale: {en-US | …}
  - AppName: <optional-kebab-name>
  - ProductType: {consumer-saas | b2b-saas | internal-tool | regulated-tool | developer-tool}
  - Competitors: <optional CSV of real product names to seed market research>
  - Mode: {--full (default) | --themeOnly | --planOnly | --lazy | --UXR | --noPRD}
```

**Mode flags** (v3.2):

- `--full` (default) — entire pipeline through G3 + running app.
- `--themeOnly` — triage + ds-indexer + guidelines-resolver + theming-resolver, then stop. Produces `theme-spec.json` + `themeability-report.md`. Useful when the user just wants to know "can my DS + brand work together?"
- `--planOnly` — discovery + research + design + specs up through G2, then stop. No app built.
- `--lazy` — skip interactive G1/G2 prompts; auto-answer with documented defaults. G3 still interactive. Useful for ergonomic re-runs.
- `--UXR` — research synthesis only (market-research + research.md). No design, no build.
- `--noPRD` — skip PRD generation. Everything else runs.

Anything missing is resolved at G1.

---

## Core rules (v3)

Foundational (v2):
- **Rule 0** — DS-First Mandate. [rules/ds-first-mandate.md](rules/ds-first-mandate.md)
- **Rule 1** — Custom component decision (legacy — see ds-extension-criteria). [rules/custom-component-decision.md](rules/custom-component-decision.md)
- **Rule 2** — Pattern memory. [rules/pattern-memory-rules.md](rules/pattern-memory-rules.md)
- **Rule 3** — Guidelines inference. [rules/guidelines-inference-rules.md](rules/guidelines-inference-rules.md)
- **Rule 4** — Research discipline. [rules/research-rules.md](rules/research-rules.md)
- **Rule 5** — Copy realism. [rules/copy-rules.md](rules/copy-rules.md)
- **Rule 6** — Approval gates. [rules/approval-gate-rules.md](rules/approval-gate-rules.md)
- **Rule 7** — Handoff to Phase 2. [rules/handoff-rules.md](rules/handoff-rules.md)
- **Rule 8** — Output location. [rules/output-location-rules.md](rules/output-location-rules.md)
- **Rule 9** — Production-grade mandate. [rules/production-grade-mandate.md](rules/production-grade-mandate.md)
- **Rule 10** — Self-healing QA loop. [rules/self-healing-loop.md](rules/self-healing-loop.md)
- **Rule 11** — Runtime verification. [rules/runtime-verification-rules.md](rules/runtime-verification-rules.md)

Market-grade (v3):
- **Rule 12** — Market research mandate. [rules/market-research-mandate.md](rules/market-research-mandate.md)
- **Rule 13** — Differentiation mandate. [rules/differentiation-mandate.md](rules/differentiation-mandate.md)
- **Rule 14** — DS extension criteria. [rules/ds-extension-criteria.md](rules/ds-extension-criteria.md)
- **Rule 15** — UI excellence standard. [rules/ui-excellence-standard.md](rules/ui-excellence-standard.md)
- **Rule 16** — Commercial viability. [rules/commercial-viability-rules.md](rules/commercial-viability-rules.md)
- **Rule 17** — Evidence-weighted decisions. [rules/evidence-weighted-decisions.md](rules/evidence-weighted-decisions.md)
- **Rule 18** — Copy excellence standard. [rules/copy-excellence-standard.md](rules/copy-excellence-standard.md)

Premium-visual (v3.1):
- **Rule 19** — Premium aesthetic standard. [rules/premium-aesthetic-standard.md](rules/premium-aesthetic-standard.md) — prescriptive OKLCH / type / motion / depth values that separate premium from AI-generic. Enforced by `aesthetic-director` (planning) and `design-qa` + `dev-qa` (runtime).
- **Rule 20** — AI-generic anti-patterns. [rules/ai-generic-anti-patterns.md](rules/ai-generic-anti-patterns.md) — the 25-item blacklist every design/code-producing agent self-audits against. Compound tells (canonical AI error/empty/dashboard shapes) are automatic blockers.

Theming (v3.2 — universal theme ingestion):
- **Rule 21** — Theming input normalization. [rules/theming-input-normalization.md](rules/theming-input-normalization.md) — any theming input (palette JSON, CSS file, Tailwind config, Figma variables, design-tokens.json, brand PDF, brand-guide URL, inline, or none) normalizes into one canonical three-tier `theme-spec.json`. Schema: [guidelines-schema/theme-spec.schema.json](guidelines-schema/theme-spec.schema.json).
- **Rule 22** — DS themeability taxonomy. [rules/ds-themeability-taxonomy.md](rules/ds-themeability-taxonomy.md) — classifies every DS into tier 1 (full), tier 2 (css-var-only), tier 3 (forked), tier 4 (custom-wrap). Fallback paths + user-facing notifications at G1 when the requested theme exceeds DS capacity. Known DSs: [references/ds-themeability-registry.md](references/ds-themeability-registry.md).

Workflow discipline (v3.2 — stabilizes weaker LLMs):
- **Rule 23** — Checkpoint discipline (state tree as source of truth). [rules/checkpoint-discipline.md](rules/checkpoint-discipline.md) — state between agents flows through `.monolith/state.json`, not conversation.
- **Rule 24** — Phase manifest discipline. [rules/phase-manifest-discipline.md](rules/phase-manifest-discipline.md) — every agent declares `reads:` / `writes:` in its frontmatter.
- **Rule 25** — Artifact size cap. [rules/artifact-size-cap.md](rules/artifact-size-cap.md) — 10K tokens per planning artifact; compression over prose.
- **Rule 26** — Deliverable tally discipline. [rules/deliverable-tally.md](rules/deliverable-tally.md) — `📋 Delivered: X | Remaining: Y` printed after every artifact.

Supporting references (read-only):
- [references/premium-design-playbook.md](references/premium-design-playbook.md) — visual knowledge base.
- [references/anti-generic-examples.md](references/anti-generic-examples.md) — concrete DO/DON'T component code.
- [references/surface-templates/](references/surface-templates/) — 9 canonical page-level layouts (dashboard, list-view, detail-view, form, wizard, settings, landing, split-pane, empty-first-run).
- [references/ds-themeability-registry.md](references/ds-themeability-registry.md) — known DS classifications.

---

## Final report shape

```
✓ Market-grade app ready at http://localhost:<port>
  run: cd <workspaceRoot>/<appName> && npm run dev

Paths:
  workspace:    <workspaceRoot>/
  workflow:     <workspaceRoot>/monolith/  (unchanged)
  memory:       <workspaceRoot>/.monolith-memory/patterns/
  run:          <workspaceRoot>/<appName>/
  app:          <workspaceRoot>/<appName>/

Market positioning:
  Segment:         <segment>
  Competitors:     <N>, top loopholes cited in market-research.md
  Differentiators: 3–5 bets, each with competitor citation + evidence weight

DS posture:
  Components used: <N> from DS, <M> compositions
  Extensions:      <approved>/<denied>/<with-modifications>; see ds-extensions/

Docs: 16 planning + QA artifacts (see Artifact map in DELIVERY.md)

Self-healing summary:
  dev-qa:                   2 iterations → clean
  production-readiness:     3 iterations → clean
  runtime-inspector:        2 iterations → clean
  design-qa:                1 iteration  → clean
  commercial-auditor:       2 iterations → clean
  Total: 10 heal passes, 24 issues resolved, 0 waived.

Commercial verdict: ready-to-sell | ready-with-caveats | not-ready
  Surfaces graded: onboarding / conversion / retention / trust / expansion
  Every differentiator verified in the running app.

Blockers: none
Warnings: <list or "none">
Patterns promoted: <list or "none">

Phase 2 handoff:
  Open http://localhost:<port>/<route>
  Then: /rewire-to-ds <figma-frame-url>
```
