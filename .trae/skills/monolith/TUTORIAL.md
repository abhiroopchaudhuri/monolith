# TUTORIAL — every way to use `monolith` (v3.3)

A scenario-driven walkthrough. If [QUICKSTART.md](QUICKSTART.md) is the 5-minute version, this is the full map: every realistic input shape, how to invoke, what the gates ask, how to iterate, and how to hand off.

> **State of v3.3.** All scripts are implemented. `.monolith/state.json` is the source of truth. G2 and G3 are turn-yielding. `competitive-synthesizer` was removed (synthesis is now an inline appendix). The runtime is real.

---

## Part 0 — Read once before any case

### 0.1 Prerequisites (all cases)

- Node ≥ 20, npm ≥ 10.
- An AI editor with skill discovery: Claude Code, Cursor, OpenCode, Trae, or Gemini-class.
- **At least one** DS source — MCP, local repo (with adapter), or both. (If you have none, see [Case D](#case-d--product-goal-only-no-ds-yet).)
- **Zero or more** guideline sources — provided `.md` files, a website URL, docs inside the DS repo, or nothing (fallback generator runs).
- One-time `npm install` at the skill root for `tsx` + dependencies.

### 0.2 The shared lifecycle

```
invocation → triage → [G1 blocking] →

Track A discovery (parallel, cacheable):
  ds-indexer ‖ guidelines-resolver ‖ market-researcher
  → theming-resolver → researcher

Track B planning (parallel):
  product-manager ‖ ux-strategist
  → ux-architect ‖ lead-designer (early draft)

Track C design quality:
  ds-extension-judge (batch)
  → design-principal ‖ aesthetic-director (parallel critique)
  → ux-writer → engineering-manager

[G2 turn yield — edit .monolith/scratchpad/*, reply continue/iterate]

  pattern-decider → developer →
  Unified QA loop (5 gates parallel iter 1, delta iter 2+)

[G3 turn yield — accept / iterate / abort] → DELIVERY.md
```

Three gates. Nothing silently advances. Full contract in [rules/approval-gate-rules.md](rules/approval-gate-rules.md).

### 0.3 The eight input shapes

| Shape | DS source | Guidelines source |
|---|---|---|
| A | MCP only | provided .md files |
| B | MCP only | website URL to crawl |
| C | MCP only | none → generate from MCP metadata |
| D | Repo only | provided .md files |
| E | Repo only | website URL to crawl |
| F | Repo only | inline docs inside the repo |
| G | Repo only | none → generate from repo + source |
| H | MCP + Repo | any of the above |

### 0.4 Invocation syntax

```
/monolith build <product brief>.
  - DS: {mcp:<name> | repo:<path> | both:mcp:<n>,repo:<p>}
  - Guidelines: {files:<paths-csv> | url:<link> | repo-inline | auto}
  - Theme: {light | dark | both}
  - Density: {compact | comfortable | spacious}
  - Locale: <BCP-47>
  - ProductType: {consumer-saas | b2b-saas | internal-tool | regulated-tool | developer-tool}
```

Anything you omit is asked at G1.

### 0.5 What each gate wants

| Gate | When | What to say |
|---|---|---|
| **G1 — Input** (blocking) | After triage | `ok` / `proceed` / `change <field> to <value>` / `rename app to <name>` / `abort` |
| **G2 — Plan** (turn yield) | After engineering-manager | `continue` (edits in `.monolith/scratchpad/` are auto-detected) / `iterate on <doc>: <delta>` / `restart from <phase>` / `abort` |
| **G3 — Delivery** (turn yield) | After QA convergence | `accept` (archives scratchpad + cleans up) / `iterate on <stage>: <delta>` / `abort` |

---

## Case A — DS MCP + brief (cleanest path)

**Shape A or C.**

You have a DS MCP already configured. Maybe you have guideline files; maybe not.

### A.1 Invoke

```
/monolith build an internal expense-reporting tool for a mid-sized org.
  - DS: mcp:<your-ds-mcp-name>
  - Guidelines: auto
  - Theme: light
  - Density: comfortable
  - Locale: en-US
  - ProductType: internal-tool
```

### A.2 G1

Triage detects: MCP reachable → shape C (`generated` guidelines because you said `auto`). You see something like:

```json
{
  "runId": "<YYYY-MM-DD>_expense-reporting-tool",
  "brief": "build an internal expense-reporting tool for a mid-sized org.",
  "ds": { "source": "mcp", "name": "<ds-name>", "mcp": { "name": "<your-ds-mcp-name>", "reachable": true }, "repo": null },
  "guidelines": { "source": "generated" },
  "promptType": "multi-screen-app",
  "constraints": { "theme": "light", "density": "comfortable", "locale": "en-US" },
  "unresolved": []
}
```

Respond `ok`.

### A.3 What runs automatically next

**Track A in parallel** (with fingerprint cache):
- `tsx scripts/index-ds-mcp.ts` queries the MCP for components/tokens/icons.
- `scripts/extract-tokens.ts` + `scripts/extract-icons.ts` normalize.
- `scripts/generate-guidelines-fallback.ts` produces 7 guideline docs, every claim cited per [rules/guidelines-inference-rules.md](rules/guidelines-inference-rules.md).
- `market-researcher` produces `.monolith/scratchpad/market-research.md` with inlined `## Synthesis` appendix.

Then sequentially:
- `theming-resolver` → `<runRoot>/theme-spec.json` + `<runRoot>/themeability-report.md`.
- `researcher` → `.monolith/scratchpad/research.md`.

**Track B / C** runs as in §0.2.

### A.4 G2 — review the plan

The orchestrator writes `.monolith/scratchpad/PLANNING_REVIEW.md` and yields the turn. Open scratchpad files directly:

```
.monolith/scratchpad/prd.md
.monolith/scratchpad/differentiation-map.md
.monolith/scratchpad/design_decisions.md
.monolith/scratchpad/build_specs.md
```

Common iterations:
- **Personas feel generic.** `iterate on research: replace personas with one finance admin and one submitter; ground each in the brief`.
- **MVP is too wide.** `iterate on prd: MVP = submit receipt + manager approve; everything else later`.
- **Design has too many customs.** `iterate on design_decisions: collapse the summary cards into a DS Table; drop the custom Sparkline unless it's reused`.

Or just edit the file directly and reply `continue`.

### A.5 Code generation + unified QA

- `pattern-decider` → `pattern_decisions.md` + any new `.monolith-memory/patterns/<slug>.md`.
- `developer` (full-gen) → `<workspaceRoot>/<appName>/` (Vite + your DS + routes + fixtures + every screen) + `<patchManifest>` block.
- `start-dev-server.ts` boots Vite via the programmatic API once.
- Iteration 1 of the QA loop runs all 5 gates in parallel; subsequent iterations run only the gates affected by the patch's `changeType`.

### A.6 G3 — accept

```
[G3 — Delivery]
App running at http://localhost:5173
Run command: cd <appName> && npm run dev
Self-healing summary: ...
```

Respond `accept`. The orchestrator archives scratchpad, prints the Phase 2 handoff command.

### A.7 Output

```
<workspaceRoot>/
├── .monolith/
│   ├── state.json
│   └── archive/<runId>/             ← scratchpad files moved here on accept
└── <appName>/
    ├── src/                          ← running React app
    ├── ds-knowledge/{component-index, tokens, icons}.json
    ├── guidelines/{brand,voice,...}.md
    ├── theme-spec.json
    ├── themeability-report.md
    ├── qa/{dev_qa_report,design_qa_report,runtime-report,production-readiness,commercial-audit}.md
    └── DELIVERY.md
```

---

## Case B — DS repo + brief (no MCP)

**Shape D / E / F / G.**

You have a DS checked out locally. An adapter exists at `examples/ds-adapters/<your-ds>.json` (sample shipped with this repo) — or you write one in ~30 minutes.

### B.1 Prep

Copy `examples/ds-adapters/shadcn.json` and edit. See [examples/ds-adapters/README.md](examples/ds-adapters/README.md) for the schema.

### B.2 Invoke

```
/monolith build a team analytics dashboard.
  - DS: repo:../path-to-your-ds
  - Guidelines: repo-inline
  - Theme: both
  - Density: compact
  - Locale: en-GB
  - ProductType: b2b-saas
```

### B.3 Differences from Case A

- `scripts/index-ds-repo.ts` runs instead of `index-ds-mcp.ts` — uses ts-morph to walk the adapter's `componentsGlob`.
- `scripts/parse-guidelines-repo.ts` walks `docs/`, `guidelines/`, `brand/`, `README.md`, `*.mdx` and classifies paragraphs.
- Topics with low-confidence classification fall back to `generate-guidelines-fallback.ts`. Per-topic granularity.
- G2 reports which topics were `provided` vs `inferred` ("6/7 topics provided; voice inferred").

Everything else is identical.

### B.4 No docs at all

Use `Guidelines: auto` → fallback generator runs end-to-end for all 7 topics. Expect the resolver to warn at G1 if >3 topics hit "insufficient evidence".

---

## Case C — DS repo + docs website (split sources)

**Shape E.**

DS code is local; design guidelines live on a docs site.

### C.1 Invoke

```
/monolith build a marketing CMS editor.
  - DS: repo:../your-ds
  - Guidelines: url:https://docs.yourds.example.com/design
  ...
```

### C.2 Differences

- `scripts/fetch-guidelines-web.ts` crawls the URL (max 30 pages by default), respects robots.txt, classifies into topics.
- High-confidence extracts → `provided`; low-confidence → fallback generator.
- Output cached at `.monolith/cache/web/<domain-hash>/` for 7 days.

### C.3 Troubleshooting

| Symptom | Fix |
|---|---|
| 4xx/5xx | Switch to `repo-inline` or `auto`. |
| Crawler times out | Use a more specific URL (section root, not `/`). |
| JS-rendered docs | Export statically or fall back to `auto`. |

---

## Case D — Product goal only, no DS yet

**Shape: none defined.** You have an idea; you don't have a DS picked.

Triage will BLOCK at G1 with `unresolved[].field = "ds.source"`. **This is by design.** The skill's promise depends on having a real DS.

Three legitimate paths:

1. **Pick an existing adapter.** Browse `examples/ds-adapters/`. Reply at G1: `change ds.source to repo, ds.repo.path to <path>, ds.repo.adapterPath to <adapter>`.
2. **Author an adapter** — see `examples/ds-adapters/README.md`. ~30 minutes for a well-typed DS.
3. **Onboard a DS MCP.** Configure the MCP in your editor first; re-invoke with `--ds-mcp <name>`.

---

## Case E — DS swap (port existing product to a new DS)

Supported through the brief + reference mechanism.

### E.1 What to feed

1. **New DS source** (the DS you want to migrate TO).
2. **Existing-product reference** — live URL, screenshots, Figma frames, or old repo path.
3. **An explicit "port structure" brief.**

### E.2 Invoke

```
/monolith port the product at https://our-current-app.example.com
  to the new DS, keeping product structure identical. Every screen,
  section, flow, and copy string carries over. Only the DS changes.
  - DS: repo:../new-ds
  - Guidelines: repo-inline
  - ProductType: <type>
```

### E.3 Pipeline interpretation

- `researcher` treats the existing product as authoritative source material — no invented personas/JTBDs.
- `product-manager` writes a PRD that mirrors existing scope. MVP = parity.
- `ux-architect` matches the existing IA 1:1.
- `lead-designer` maps every section to the NEW DS's components. Old-DS primitives with no analog → `blocker: missing-DS-primitive`.
- `engineering-manager` mirrors the existing file layout semantically.
- `developer` generates the new app; fixtures mirror real data shape.

### E.4 G2 — critical for ports

Look at `.monolith/scratchpad/design_decisions.md § DS-First audit`. For each blocker:
- `drop` (feature isn't essential),
- `substitute` (accept different UX),
- `request` (block, ask new-DS team to add the primitive).

### E.5 Limits

- Skill does NOT auto-ingest the existing product's code.
- Copy carry-over is best-effort at the code level; Figma-level is Phase 2.
- If both old + new are React, `rewire-to-ds` (Phase 2) is faster.

---

## Case F — DS + brief + provided guideline files (most controlled)

**Shape A or D.**

### F.1 Invoke

```
/monolith build a data-product portal.
  - DS: mcp:<name> (or repo:<path>)
  - Guidelines: files:./brand.md,./voice.md,./a11y.md,./layout.md
  ...
```

### F.2 What the resolver does

- Loads each provided file.
- Classifies against the seven canonical topics.
- A single file can cover multiple topics.
- Topics not covered fall back to `generated`.

### F.3 Why this path

Strongest guarantee of voice/a11y/content alignment. Provided files always beat fallbacks.

### F.4 Gotchas

- Conflicts between provided + generated → `<runRoot>/guidelines/conflicts.md` appears. Provided wins.
- Unparseable file → warning + skipped.

---

## Case G — Both MCP and repo (maximum fidelity)

**Shape H.**

### G.1 Invoke

```
/monolith build <product>.
  - DS: both:mcp:<mcp-name>,repo:<path>
  - Guidelines: auto
  ...
```

### G.2 Reconciliation

- `index-ds-mcp.ts` + `index-ds-repo.ts` run in parallel (Track A).
- `ds-indexer` agent reconciles by name + importPath:
  - Same name, same shape → MCP wins.
  - Same name, different shape → `<runRoot>/ds-knowledge/conflicts.json` + block at G1.
  - Name only in one → include + flag origin.

### G.3 When to use

- DS is actively developed; MCP is live; repo is your pinned version.
- You want MCP-live metadata + repo-level prop extraction (types from sources).

---

## Part 1 — Iterating mid-run

### 1.1 At G2 — planning iterations

Two ways:

**a) Edit a scratchpad file directly, reply `continue`.** The orchestrator runs `scratchpad-lifecycle.ts detect-edits`, marks edited files' phases as dirty, re-runs them + downstream, then re-yields.

**b) Use `iterate on <doc>: <delta>`** for a directed change. Examples:

```
iterate on research: personas feel generic. replace with one senior
  analyst and one admin. ground each in the brief's mention of monthly
  reporting.

iterate on prd: MVP is too big. keep only (1) create report, (2) share
  report, (3) comment. move everything else to later.

iterate on differentiation-map: drop bet 3 — that's table-stakes, not differentiation.

iterate on design_decisions: drop the custom Sparkline proposal.
  use the DS's LineChart even if smaller.
```

### 1.2 At G3 — post-code iterations

```
iterate on developer: settings page has too much blank space.
  density=compact on that screen, comfortable everywhere else.

iterate on design-qa: re-score after I manually updated the dashboard
  copy. don't re-run dev-qa.

iterate on commercial-auditor: onboarding score 4/10. add a 3-step
  empty-state guide on first run.
```

### 1.3 Restart vs iterate

- **iterate** = change just this doc/stage + propagate. Cheaper.
- **restart from <phase>** = reset that phase + everything downstream.

Rule of thumb: fits in one doc → `iterate`. Changes what counts as "done" for earlier docs → `restart from`.

---

## Part 2 — Handoff to Phase 2 (Figma rewire)

Once G3 is `accept`, the orchestrator prints:

```
Localhost: http://localhost:<port>
Start: cd <appRoot> && npm run dev

Phase 2 handoff:
  1. Open http://localhost:<port>/<primary-route> in a browser.
  2. Use html.to.design (or equivalent) to import the page into Figma as
     `SKELETON — <screen-id>`.
  3. Run:
     /rewire-to-ds <figma-frame-url>
       --plan   <appRoot>/docs/screen-plan.json
       --tokens <runRoot>/ds-knowledge/tokens.json
       --index  <runRoot>/ds-knowledge/component-index.json
```

Phase 1.5 (html.to.design) is manual.

---

## Part 3 — Reading the output

### 3.1 Where to look first

1. `<workspaceRoot>/<appName>/DELIVERY.md` — one-page summary.
2. `<workspaceRoot>/<appName>/qa/qa.md` — consolidated QA.
3. `<workspaceRoot>/<appName>/src/` — the code.
4. `.monolith/archive/<runId>/build_specs.md` — the file-level map.
5. Localhost URL — interact.

### 3.2 What every doc means

| Doc | Who it's for | First question it answers |
|---|---|---|
| `market-research.md` (with `## Synthesis`) | PM / strategy | Who's already in this market and what are their loopholes |
| `research.md` | Anyone | Why this product, who is it for |
| `prd.md` | PM / eng | What are we building, how do we measure success |
| `differentiation-map.md` | PM / strategy | The 3–5 explicit bets and the competitor gaps each cites |
| `information_architecture.md` | Designer / eng | What pages, what lives where |
| `user_flow.md` | Designer / PM / QA | How does the user move through the product |
| `design_decisions.md` | Lead designer | Why this component here, why this token |
| `design-principal-critique.md` | Lead designer | Where the principal pushed back |
| `aesthetic-audit.md` | Lead designer | Premium-vs-AI-generic verdict |
| `ux-writing-pass.md` | Writer / dev | Every user-visible string with rationale |
| `build_specs.md` | Dev / EM | How the code is organized |
| `pattern_decisions.md` | Designer / dev | For every section, what we built and why |
| `commercial-audit.md` | PM / growth | Onboarding/conversion/retention/trust/expansion grades |
| `qa.md` | Everyone | Did it pass, where are the weak spots |
| `DELIVERY.md` | You | What you got, what's next |

### 3.3 The DS knowledge pack

`<runRoot>/ds-knowledge/`:

- `component-index.json` — every DS component, props, variants, slots, icons, token refs, level/category/when/not_when.
- `tokens.json` — normalized token map.
- `icons.json` — flat icon-name list.

Downstream agents read these three files and nothing else about the DS.

### 3.4 Guidelines

`<runRoot>/guidelines/` has the seven topic docs. Each carries `inferred: true/false` in frontmatter. `inferred: false` + body "Insufficient evidence" = the skill refused to make things up; author real guidelines.

---

## Part 4 — Frequently encountered situations

### 4.1 "My DS uses Tailwind and has no theme object."

Adapter sets `themeAccess.style = "tailwind"` and `themeAccess.kind = "css-vars-plus-tailwind-theme"`. Generator uses class utilities; `tokens.json` maps underlying values for planning. No inline styles.

### 4.2 "DS exposes half through main package, half through submodules."

Declare submodules in the adapter. `component-index.json` records each component's `importPath` individually.

### 4.3 "DS has 1000+ icons."

`icons.json` holds all names; generators pick only those the plan cites. Validator's `ICONS` gate confirms every emitted icon exists.

### 4.4 "Same brief against two DSs to compare."

Run twice. `runId` differs; outputs sit side-by-side. Compare `.monolith/archive/<runIdA>/design_decisions.md` against `<runIdB>/design_decisions.md`.

### 4.5 "Is `.monolith-memory/patterns/` safe to commit?"

Yes — it IS the durable memory. Commit it. Don't edit manually; let the skill append. To remove a stale pattern, `git mv` to `.monolith-memory/patterns/_archive/`.

### 4.6 "Something went wrong mid-run. Can I resume?"

Yes. `.monolith/state.json` is durable across editor restarts. Re-invoke with `--resume <runId>`; the orchestrator reads state and continues from the last `done` phase. Any scratchpad edits trigger phase re-runs (per G2 detect-edits semantics).

### 4.7 "I want to onboard a totally new DS."

Two options:

- **Adapter path:** copy `examples/ds-adapters/shadcn.json`, edit, validate with `npm run index-ds-repo -- --adapter <path> --dry-run`. ~30 minutes.
- **MCP path:** configure the MCP in your editor first; invoke with `--ds-mcp <name>`. Zero adapter work.

### 4.8 "DS_FIRST violation I think is legitimate."

Add a justification comment in the generated file:

```tsx
// ds-first-allowed: this custom dot is a data-viz marker, not a UI primitive;
// the DS has no equivalent; see design_decisions.md § DS-First audit / PulseDot.
<div className="pulse-dot" />
```

The validator accepts this. Without it, the run blocks.

### 4.9 "Prototype runs but design-qa score is 6/10."

Read `<appRoot>/qa/design_qa_report.md`. Per-axis scores tell you where: copy / rhythm / state completeness / token coverage / pattern reuse / aesthetic refinement / anti-pattern audit. Iterate at G3:

```
iterate on developer: state completeness is low (4/10). add empty,
  error, and loading variants to the Reports list page.
```

### 4.10 "I want to write guidelines AFTER a first run, not before."

Valid workflow:

1. First run with `Guidelines: auto`. Skill generates evidence-backed drafts in `<runRoot>/guidelines/`.
2. Copy drafts elsewhere, edit/rewrite.
3. Re-run with `Guidelines: files:<paths>` pointing at your edited versions.

---

## Part 5 — Anti-patterns (how NOT to use this)

### 5.1 Don't skip gates

Don't reply `ok` at G1 or `continue` at G2 without actually reading the manifest / scratchpad. The whole point is a cheap checkpoint before expensive downstream work.

### 5.2 Don't treat guidelines as optional

When the fallback emits "Insufficient evidence", that's NOT license to ignore the topic. It's a flag: author real content or accept the quality drop.

### 5.3 Don't edit generated app code and re-iterate

`<appName>/src/**` is rewritten by any iteration that reaches the developer phase. If you edit by hand and then iterate, your edits are lost. Iterate the upstream doc instead.

### 5.4 Don't cross-contaminate runs

Each run has its own `runId`. Don't copy files between runs. Reuse via Cache (research/market-research are TTL-cached) or via patterns folder.

### 5.5 Don't promote a pattern from a single run's single use

Pattern promotion requires ≥2 uses in the SAME run. Cross-run promotion isn't automated.

---

## Part 6 — Cheat sheet

### 6.1 One-liners

| Situation | Command |
|---|---|
| Full run, DS MCP, no guidelines | `/monolith <brief>. - DS: mcp:<name> - Guidelines: auto` |
| Full run, DS repo, inline docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: repo-inline` |
| Full run, DS repo, website docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: url:<link>` |
| Full run, DS repo, provided docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: files:<csv>` |
| Both sources + provided docs | `/monolith <brief>. - DS: both:mcp:<n>,repo:<p> - Guidelines: files:<csv>` |
| Plan-only (no app) | `/monolith <brief>. - DS: ... --planOnly` |
| Theme feasibility check | `/monolith <brief>. - DS: ... --themeOnly` |
| Research only | `/monolith <brief>. - DS: ... --UXR` |
| Resume | `/monolith --resume <runId>` |
| Skip cache | `/monolith <brief>. ... --no-cache` |

### 6.2 Gate responses

| Intent | G1 | G2 | G3 |
|---|---|---|---|
| Proceed | `ok` | `continue` | `accept` |
| Change one field | `change <field> to <value>` | `iterate on <doc>: <delta>` | `iterate on <stage>: <delta>` |
| Start over partially | n/a | `restart from <phase>` | `iterate on <stage>: <delta>` |
| Stop | `abort` | `abort` | `abort` |

### 6.3 Where to look when something breaks

| Failure mode | Look at |
|---|---|
| Triage blocks | `state.input.manifest.unresolved[]` |
| Indexing blocks | `<runRoot>/ds-knowledge/conflicts.json` |
| Guidelines empty | `<runRoot>/guidelines/*.md` frontmatter `inferred: false` + body "Insufficient evidence" |
| Plan feels off | Open the scratchpad doc directly; iterate on that doc |
| Dev server won't boot | `<appRoot>/qa/dev_qa_report.md § BUILD / SERVER gates` |
| DS_FIRST violation | `<appRoot>/qa/dev_qa_report.md § DS_FIRST gate` |
| Design-qa score low | `<appRoot>/qa/design_qa_report.md § per-axis scores` |
| Cache miss / hit unexpected | `state.phases.<name>.fingerprint` |
| Phase re-runs when it shouldn't | `state.artifacts.<name>.lastModified` vs scratchpad mtime |

See `TROUBLESHOOTING.md` (repo root) for the long playbook.

---

## Appendix — The life of one section

To ground everything above, here's how a single section — "summary-metric strip" on a dashboard — moves through v3.3:

1. **Market research (Track A).** `market-research.md § 6 JTBD alignment` flags "competitor X has a strong dashboard summary; competitor Y's is missing trends."
2. **Research (Track A).** `research.md` includes JTBD "glance at headline numbers before my first meeting".
3. **PRD (Track B).** User story "see three headline metrics on home, so that I start the day oriented." Acceptance: "three metrics visible above the fold at md."
4. **Differentiation map (Track B).** Bet 3: "trend-included summary cards" — cites competitor Y's loophole.
5. **IA (Track B).** Places the strip on `/` under `<main>` landmark. Empty/error/loading inventory flags it.
6. **Design decisions (Track B+C).** Row: `screen=dashboard section=metric-strip role=overview components=[Card, Statistic, Trend] differentiator=bet-3`.
7. **Extension judging (Track C batch).** `Statistic` exists in DS → no extension needed.
8. **Aesthetic audit (Track C parallel).** Confirms tabular-nums on `Statistic`, hairline borders, tier-1 shadow.
9. **UX writing (Track C).** Metric labels rewritten with intent.
10. **Build specs (Track C).** `src/screens/Dashboard/MetricStrip.tsx`, fixture at `src/fixtures/metrics.ts`.
11. **G2 yield.** User reviews `PLANNING_REVIEW.md`, no edits, replies `continue`.
12. **Pattern decider.** Decision matrix row: `decision=ds-composition target=[Row,Card,Statistic]`.
13. **Developer.** Writes `MetricStrip.tsx` using DS Row + Card + Statistic, `aria-label` per metric, tokens from `theme-spec.json`. Emits `<patchManifest>` `changeType: layout`.
14. **Unified QA iter 1.** All 5 gates run in parallel. `dev-qa § PROPS` confirms. `design-qa § visual-rhythm` includes this row. `aesthetic-director` runtime sample matches declared values.
15. **G3 accept.** Scratchpad → `.monolith/archive/<runId>/`.

One section, fifteen touchpoints. Multiply by every section on every screen. That discipline plus the three gates is what makes the output predictable across DSs and briefs.
