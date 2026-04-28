# TUTORIAL — every way to use `monolith`

A scenario-driven walkthrough. If [QUICKSTART.md](QUICKSTART.md) is the 5-minute version, this is the full map: every realistic input shape, how to invoke, what the gates ask, how to iterate, and how to hand off.

> **Before you start.** This tutorial describes the workflow *as specified*. The runtime scripts (indexing, scaffolding, validation, etc.) are stubs in M0 — see [plan.md §11 Build order](plan.md). Read this tutorial as "here is exactly how the skill will behave once M1–M4 land." The agents' prompts, rules, and templates are already final and usable directly.

---

## Part 0 — Read once before any case

### 0.1 Prerequisites (all cases)

- Node ≥ 20, npm ≥ 10, `tsx` or `ts-node` on PATH.
- Claude Code with this skill discoverable (`/monolith` resolves).
- **At least one** DS source — MCP, local repo, or both. (If you have none, skip to [Case D](#case-d--product-goal-only-no-ds-yet).)
- **Zero or more** guideline sources — provided .md files, a website URL, docs inside the DS repo, or nothing (fallback generator runs).

### 0.2 The shared lifecycle (every case follows this)

```
  invocation → triage → [G1] → ds-indexer + guidelines-resolver (parallel) →
  researcher → PM → ux-architect → lead-designer → eng-manager → [G2] →
  pattern-decider → developer → dev-QA → design-QA → [G3] → DELIVERY.md
```

Three gates. Nothing silently advances. Full contract in [rules/approval-gate-rules.md](rules/approval-gate-rules.md).

### 0.3 The eight input shapes (from [plan.md §0.4](plan.md))

| Shape | DS source | Guidelines source |
|---|---|---|
| A | MCP only | provided .md files |
| B | MCP only | website URL to crawl |
| C | MCP only | none → generate from MCP metadata |
| D | Repo only | provided .md files |
| E | Repo only | website URL to crawl |
| F | Repo only | inline docs inside the repo (`docs/`, `README`, `*.mdx`) |
| G | Repo only | none → generate from repo + source code |
| H | MCP + Repo | any of the above — prefer MCP at runtime, reconcile with repo |

Every tutorial case below names the shape it exercises.

### 0.4 Invocation syntax (universal)

```
/monolith build <product brief>.
  - DS: {mcp:<name> | repo:<path> | both}
  - Guidelines: {files:<paths-csv> | url:<link> | repo-inline | auto}
  - Theme: {light | dark | both}
  - Density: {compact | comfortable | spacious}
  - Locale: <BCP-47>
```

**Anything you omit is asked at G1.** You don't need to fill everything up front; triage will surface `unresolved[]` and wait.

### 0.5 What each gate wants from you

| Gate | When | What to say |
|---|---|---|
| **G1 — Input** | Right after triage | `ok` / `proceed` to continue, `change <field> to <value>` to edit, `abort` to stop |
| **G2 — Plan** | After all planning docs | `ok` / `go` to continue, `iterate on <doc>: <delta>`, `restart from <stage>`, `abort` |
| **G3 — Delivery** | After dev QA + design QA | `accept`, `iterate on <stage>: <delta>`, `log` (accept-as-known-incomplete), `abort` |

---

## Case A — DS MCP + brief (cleanest path)

**Shape A (MCP + provided) or C (MCP + generated).**

You have a DS MCP already configured in Claude Code. You may or may not have guideline files.

### A.1 Invoke

```
/monolith build an internal expense-reporting tool for a mid-sized org.
  - DS: mcp:<your-ds-mcp-name>
  - Guidelines: auto
  - Theme: light
  - Density: comfortable
  - Locale: en-US
```

### A.2 G1 — triage output

Triage detects: MCP reachable → shape C (`generated` guidelines because you said `auto`). You see something like:

```json
{
  "runId": "<YYYY-MM-DD>_expense-reporting-tool",
  "brief": "build an internal expense-reporting tool for a mid-sized org.",
  "ds": {
    "source": "mcp",
    "name": "<ds-name>",
    "version": "<version>",
    "mcp": { "name": "<your-ds-mcp-name>", "reachable": true },
    "repo": null
  },
  "guidelines": { "source": "generated" },
  "promptType": "multi-screen-app",
  "constraints": { "theme": "light", "density": "comfortable",
                   "breakpoints": ["sm","md","lg"], "locale": "en-US" },
  "unresolved": []
}
```

Respond `ok`.

### A.3 What runs automatically next

- `scripts/index-ds-mcp.ts` — queries the MCP for components/tokens/icons.
- `scripts/extract-tokens.ts` + `scripts/extract-icons.ts` — normalize.
- `scripts/generate-guidelines-fallback.ts` — produces 7 guideline docs, every claim cited per [rules/guidelines-inference-rules.md](rules/guidelines-inference-rules.md).

Planning agents (researcher → PM → architect → designer → EM) run serially.

### A.4 G2 — plan summary

You'll get a condensed summary with counts and links — see example shape in [rules/approval-gate-rules.md § G2](rules/approval-gate-rules.md).

Common iterations here:
- **Personas feel generic.** Respond: `iterate on research: replace personas with one finance admin and one submitter; ground each in the brief`.
- **MVP is too wide.** Respond: `iterate on prd: MVP = submit receipt + manager approve; everything else later`.
- **Design has too many customs.** Respond: `iterate on design-decisions: collapse the summary cards into a DS Table; drop the custom Sparkline unless it's reused`.

Every iteration re-runs ONLY the named agent + strictly-downstream agents. See [rules/approval-gate-rules.md § Iteration economics](rules/approval-gate-rules.md).

### A.5 Code generation + QA

- `pattern-decider` produces the section-by-section decision matrix.
- `developer` scaffolds Vite + your DS + routes + fixtures + screens under `out/<runId>/app/`.
- `dev-qa` runs tsc, ESLint, build, dev-server boot, axe, DS_FIRST static gate.
- `design-qa` evaluates rhythm, copy, token coverage, state completeness; promotes any new recurring patterns into `patterns/`.

### A.6 G3 — accept

```
✓ Prototype ready at http://localhost:5173
  run: cd out/<runId>/app && npm run dev
```

Respond `accept`. The orchestrator prints the Phase 2 handoff command.

### A.7 Output

```
out/<runId>/
  input-manifest.json
  ds-knowledge/{component-index,tokens,icons}.json
  guidelines/{brand,voice,ux-principles,accessibility,content,motion,layout}.md
  docs/{research,prd,information_architecture,user_flow,
        design_decisions,best_practices,build_specs,
        pattern_decisions,qa,delivery}.md
  docs/screen-plan.json
  app/                      ← running prototype
  qa/{dev_qa_report,design_qa_report}.md + a11y_report.json + screenshots/
  writes.log
  DELIVERY.md
```

---

## Case B — DS repo + brief (no MCP)

**Shape D / E / F / G** depending on your guideline source.

You have a DS checked out locally. An adapter exists (or you'll write one — ~30 lines).

### B.1 Prep

Ensure `../shared/ds-adapters/<your-ds>.json` exists. If it doesn't, copy the schema from [plan.md §3.3 DS Adapter](../WORKFLOW_MASTER_PLAN.md#33-ds-adapter-the-plug-in-point) of the original master plan and fill in:

- `name`, `framework`, `repoRoot`, `entry`, `importPath`
- `componentsGlob`, `storiesGlob`, `docsGlob`
- `propTypes.source` (`typescript` / `prop-types` / `storybook`)
- `variantProps[]` (discriminator props like `variant`, `type`, `appearance`, `size`)
- `iconPackage`
- `tokens.source` + file list
- `themeAccess.style` (`theme-object` / `css-vars` / `classnames` / `tailwind`)
- `layoutPrimitives[]`

### B.2 Invoke

```
/monolith build a team analytics dashboard.
  - DS: repo:../path-to-your-ds
  - Guidelines: repo-inline
  - Theme: both
  - Density: compact
  - Locale: en-GB
```

### B.3 G1

Triage detects: repo path valid + adapter present + `docs/` or `README.md` detected → shape F.

### B.4 Differences from Case A

- `scripts/index-ds-repo.ts` runs instead of `index-ds-mcp.ts` — uses ts-morph to walk the adapter's `componentsGlob`.
- `scripts/parse-guidelines-repo.ts` walks the repo's `docs/`, `guidelines/`, `brand/`, `README.md`, `*.mdx`, classifies paragraphs into the seven topics.
- Any topic with low-confidence classification falls back to `generate-guidelines-fallback.ts` — per-topic granularity.
- Expect G2 to note which topics were `provided` / `inferred` — e.g. "6/7 topics provided; voice inferred."

Everything else (planning, code, QA, gates, handoff) is identical to Case A.

### B.5 When the repo has NO docs at all

Use `Guidelines: auto` → `generate` fallback runs end-to-end for all 7 topics. Expect the resolver to warn at G2 if >3 topics hit "insufficient evidence" — consider at least adding a README before re-running.

---

## Case C — DS repo + docs website (split sources)

**Shape E** (repo for DS, website for guidelines).

Your DS code is local but your design guidelines live on a docs site (e.g., `docs.yourds.example.com`).

### C.1 Invoke

```
/monolith build a marketing CMS editor.
  - DS: repo:../your-ds
  - Guidelines: url:https://docs.yourds.example.com/design
  - Theme: light
  - Density: comfortable
  - Locale: en-US
```

### C.2 Differences

- `scripts/fetch-guidelines-web.ts` crawls the URL (respecting robots.txt, max 30 pages by default). Extracts per-topic content.
- High-confidence extracts become `provided`; low-confidence → generated fallback.
- Output caches under `.cache/guidelines/<domain>/` for 7d.

### C.3 Troubleshooting

| Symptom | Fix |
|---|---|
| Website returns 4xx/5xx | `--guidelines-url` blocked. Switch to `repo-inline` or `auto`. |
| Crawler times out | Use a more specific URL (section root, not `/`). |
| Content is JS-rendered and crawler sees empty HTML | Export the docs statically or fall back to `auto`. |

---

## Case D — Product goal only, no DS yet

**Shape: none defined.** You have an idea; you don't have a DS picked.

### D.1 What happens

Triage will BLOCK with:

```
unresolved[]:
- field: "ds.source"
  question: "No DS source detected. Provide one of:
             --ds-mcp <name>, --ds-repo <path> (with adapter), or both.
             If you don't have a DS yet, options:
             (a) use a well-known DS whose adapter exists here
                 (see ../shared/ds-adapters/);
             (b) author a new adapter (~30 minutes);
             (c) pause this run and onboard a DS first."
  blockingStage: 0
```

You cannot proceed without answering this. **This is by design.** The skill's promise — DS-first, zero hallucinated components — depends on having a real DS to index.

### D.2 Three legitimate paths forward

1. **Pick an existing adapter.** Run `ls ../shared/ds-adapters/`. Pick one. Respond at G1 with `change ds.source to repo, ds.repo.path to <path>, ds.repo.adapterPath to <adapter>`.
2. **Author an adapter.** Use the schema in [plan.md §1](plan.md) + `scripts/index-ds-repo.ts --adapter <your-new-adapter>` to validate it. Then re-invoke the skill.
3. **Onboard a DS MCP.** Configure the MCP in Claude Code first; re-invoke with `--ds-mcp <name>`.

### D.3 What you should NOT do

- Do not feed a raw React component library without an adapter or MCP — the skill cannot verify props, icons, or tokens.
- Do not ask the skill to "just pick a DS" — it won't, by design. That's a human decision.

---

## Case E — DS swap (port existing product to a new DS, keep structure)

**Shape: repo for the new DS + brief that references the existing product.**

You have an existing product (built with DS X, or in raw HTML/another framework, or as a Figma). You want the same product structure in DS Y.

This case is **supported through the brief + references mechanism**, not as a first-class input. The researcher treats the existing product as authoritative source material.

### E.1 What to feed

Three pieces go into the invocation:

1. **New DS source** — the DS you want to migrate TO.
2. **Existing-product reference** — one of:
   - Live URL: `https://your-current-app.example.com`
   - Screenshots: attach as `.png` files
   - Figma frame URL(s)
   - Old repo path (read-only reference, not a build target)
3. **An explicit "port structure" brief.**

### E.2 Invoke

```
/monolith port the product at https://our-current-app.example.com
  to the new DS, keeping the product structure identical. Every screen,
  section, flow, and copy string should carry over. Only the DS changes.
  Reference screenshots attached.
  - DS: repo:../new-ds
  - Guidelines: repo-inline
  - Theme: light
  - Density: comfortable
  - Locale: en-US
```

### E.3 How the pipeline interprets this

- **Researcher** reads the brief + reference material. Produces `research.md` that treats the existing product as prior-art + source-of-structure. Personas + JTBDs are extracted from what the existing product DOES, not invented.
- **PM** writes a PRD that mirrors the existing scope. MVP = parity. "Later" = new features (there shouldn't be any in a pure port).
- **UX-architect** produces IA + flows that match the existing product's structure 1:1.
- **Lead-designer** maps EVERY section to the NEW DS's components. This is where the work happens:
  - Direct equivalents → `ds-component`
  - Near-equivalents with different prop naming → `ds-component` (note the rename)
  - Old-DS primitives with no new-DS equivalent → `blocker: missing-DS-primitive` (user decides)
  - Custom compositions that DO carry over → `reused-pattern` if already indexed; else `new-pattern` or `layout-inline`
- **EM** produces build specs that match the existing file layout at a semantic level.
- **Developer** generates the new app; fixtures mirror real data shape from the existing product.

### E.4 G2 review (critical for this case)

Look especially at `design_decisions.md § DS-First audit`. Any row there means the old product used something the new DS doesn't have. Decide per blocker:

- `drop` — the feature isn't essential; remove.
- `substitute` — accept a different UX (e.g., old product had a custom carousel, new DS has Tabs — use Tabs + a note).
- `request` — block this run, ask the new-DS team to add the primitive, retry later.

### E.5 Known limits of this case in v1

- The skill does NOT automatically ingest the existing product's code. The researcher works from the brief + the screenshots/URL you provide, interpreted.
- Copy carry-over at the **code** level is best-effort (the researcher extracts copy from screenshots/Figma into `research.md § content anchors`; the developer uses it). Copy carry-over at the **Figma** level is Phase 2's job — hand off after Phase 1 completes.
- If both old and new are React: the fastest path is actually NOT this skill. Use `rewire-to-ds` (Phase 2) on the existing product's Figma instead — that's a direct component swap. This skill is right when you want the full docs (PRD, IA, build specs) regenerated against the new DS, or when the source product isn't in Figma.

---

## Case F — DS + brief + provided guideline files (the most controlled path)

**Shape A or D** (depending on DS source).

You have both pieces already: a DS source AND curated guideline .md files.

### F.1 Invoke

```
/monolith build a data-product portal for analyst personas.
  - DS: mcp:<your-ds-mcp> (or repo:<path>)
  - Guidelines: files:./brand.md,./voice.md,./a11y.md,./layout.md
  - Theme: light
  - Density: comfortable
  - Locale: en-US
```

### F.2 What the resolver does

- Loads each provided file.
- Classifies each against the seven canonical topics.
- A single file can cover multiple topics (e.g., `brand.md` covers brand + voice anchors).
- Topics NOT covered by provided files fall back to `generated` — flagged in the output as "generated for this topic — no provided coverage".

### F.3 Why you'd choose this path

You get the strongest guarantee that the product follows your team's voice/a11y/content rules. The fallback generator is good; provided files are better.

### F.4 Gotchas

- Conflicts between provided files and generated fallbacks → `guidelines/conflicts.md` appears. Prefer provided in the final set.
- If a provided file doesn't parse as .md → warning + skipped. Fix and re-invoke (or accept partial coverage + fallback).

---

## Case G — Both MCP and repo (maximum fidelity)

**Shape H.**

You have both: the DS is available via MCP for live info + the repo is local for full ts-morph introspection.

### G.1 Invoke

```
/monolith build <product>.
  - DS: both:mcp:<mcp-name>,repo:<path>
  - Guidelines: auto
  ...
```

### G.2 Reconciliation

- `index-ds-mcp.ts` + `index-ds-repo.ts` run in parallel.
- The `ds-indexer` agent reconciles by name + importPath:
  - Same name, same shape → MCP wins (live source of truth).
  - Same name, different shape → `ds-knowledge/conflicts.json` + block at G1.
  - Name only in one → include, flag origin.
- >20 conflicts blocks catastrophically — usually means MCP version ≠ repo version.

### G.3 When to use this

- The DS is actively developed and the MCP is live; the repo is your pinned version.
- You want MCP-live component metadata + repo-level prop extraction (types, defaults, examples from stories).

---

## Part 1 — Iterating mid-run

### 1.1 At G2 — planning iterations

Syntax: `iterate on <doc>: <plain-english delta>`. Examples:

```
iterate on research: personas feel generic. replace with one senior
  analyst and one admin. ground each in the brief's mention of monthly
  reporting.

iterate on prd: MVP is too big. keep only (1) create report, (2) share
  report, (3) comment on report. move everything else to later.

iterate on information-architecture: move "Reports" to the primary nav,
  not under a Tools submenu.

iterate on design-decisions: drop the custom Sparkline proposal.
  use the DS's LineChart even if smaller. single source of truth.
```

The orchestrator re-runs the named agent + strictly-downstream agents. It prints what will re-run and asks `y/n` before proceeding.

### 1.2 At G3 — post-code iterations

```
iterate on developer: the settings page has too much blank space.
  density=compact on that screen, comfortable everywhere else.

iterate on design-qa: re-score after I manually updated the Dashboard
  copy. don't re-run dev-qa — the code is fine.

iterate on pattern-decider: I want the card-with-sparkline to be a
  promoted pattern. evidence: three screens use it.
```

### 1.3 Restarting vs iterating

- **iterate** = change just this doc + propagate. Cheaper.
- **restart from** = re-run a stage + everything downstream from scratch. Used when the change is structural.

Rule of thumb: if your change fits in a single doc's section, `iterate`. If it changes what counts as "done" for earlier docs, `restart from`.

---

## Part 2 — Handoff to Phase 2 (Figma rewire)

Once G3 is `accept`, the orchestrator prints:

```
Localhost: http://localhost:<port>
Start: cd out/<runId>/app && npm run dev

Next step — Phase 2 handoff:
  1. Open http://localhost:<port>/<primary-route> in a browser.
  2. Use `html.to.design` (or equivalent plugin) to import the page
     into a new Figma frame named `SKELETON — <screen-id>`.
  3. Run:
     /rewire-to-ds <figma-frame-url>
       --plan   out/<runId>/docs/screen-plan.json
       --tokens out/<runId>/ds-knowledge/tokens.json
       --index  out/<runId>/ds-knowledge/component-index.json
```

Phase 1.5 (the html.to.design step) is manual in v1. Phase 2 handles the reconciliation against the Figma DS library. See [../phase-2-rewire-to-ds/SKILL.md](../phase-2-rewire-to-ds/SKILL.md).

---

## Part 3 — Reading the output

### 3.1 Where to look first

Open in this order:

1. `out/<runId>/DELIVERY.md` — one-page summary.
2. `out/<runId>/docs/qa.md` — consolidated QA.
3. `out/<runId>/app/` — open in your editor.
4. `out/<runId>/docs/build_specs.md` — the file-level map.
5. Localhost URL — interact.

### 3.2 What every doc means

| Doc | Who it's for | First question it answers |
|---|---|---|
| `research.md` | Anyone | Why this product, who is it for |
| `prd.md` | PM / eng | What are we building, how do we measure success |
| `information_architecture.md` | Designer / eng | What pages, what lives where |
| `user_flow.md` | Designer / PM / QA | How does the user move through the product |
| `design_decisions.md` | Lead designer | Why this component here, why this token |
| `best_practices.md` | Team | What conventions did we settle for this project |
| `build_specs.md` | Dev / EM | How is the code organized |
| `pattern_decisions.md` | Designer / dev | For every section, what did we build and why |
| `qa.md` | Everyone | Did it pass, and where are the weak spots |
| `delivery.md` | You | What did you get, what's next |

### 3.3 The DS knowledge pack

`out/<runId>/ds-knowledge/` is deliberately boring but load-bearing:

- `component-index.json` — every DS component, props, variants, slots, icons, token refs.
- `tokens.json` — normalized token map.
- `icons.json` — flat icon-name list.

Downstream agents read these three files and nothing else about the DS.

### 3.4 The guidelines

`out/<runId>/guidelines/` has the seven topic docs. Each carries `inferred: true/false` in frontmatter. When `inferred: false` and the body says "Insufficient evidence — recommend human authoring", that's exactly what it means: the skill refused to make things up. Treat as a prompt to author real guidelines.

---

## Part 4 — Frequently encountered situations

### 4.1 "My DS uses Tailwind and has no theme object."

Fine. Adapter sets `themeAccess.style = "tailwind"`. The generator uses class utilities; `tokens.json` maps underlying values for planning. No inline styles emitted.

### 4.2 "My DS exposes half its components through the main package and half through submodules."

Declare the submodule(s) in the adapter. `component-index.json` records each component's `importPath` individually. Deep imports are fine when the adapter authorizes them.

### 4.3 "My DS's icon catalog is huge (1000+ icons)."

`icons.json` holds all names; generators pick only what the plan cites. Validator's `ICONS` gate confirms every emitted icon name exists. Size isn't a constraint.

### 4.4 "I want to run the same brief against two DSs to compare."

Run twice, once per DS. `runId` differs, so the outputs sit side-by-side under `out/`. Compare `docs/design_decisions.md` and `docs/pattern_decisions.md` between runs — the meaningful difference is which components were picked and which patterns were promoted.

### 4.5 "Is the patterns/ folder safe to commit to git?"

Yes — it IS the skill's durable memory. Commit it. Don't edit manually; let the skill append. To remove a stale pattern, `git mv` it into `patterns/_archive/` (the skill excludes archived patterns from INDEX.md).

### 4.6 "Something went wrong mid-run. Can I resume?"

Every sub-agent's completion is logged in `out/<runId>/writes.log`. If a run aborts at stage N, you can re-invoke the orchestrator with `--resume <runId>` and it will skip stages 0..N-1 whose outputs exist and re-run N onward. (Note: this is M4+ functionality — until then, re-run from the last approval gate.)

### 4.7 "I want to onboard a totally new DS."

Two options:

- **Fast path:** author `../shared/ds-adapters/<name>.json` following the schema in [plan.md §1](plan.md). Test with `scripts/index-ds-repo.ts --adapter <path>`. Typical time: 30 minutes for a well-typed DS; longer for one with informal prop-types.
- **If there's an MCP:** no adapter needed. Confirm the MCP reachable, invoke with `--ds-mcp <name>`.

### 4.8 "The skill blocked on a DS_FIRST violation I think is legitimate."

Add a justification comment in the generated file:

```tsx
// ds-first-allowed: this custom dot is a data-viz marker, not a UI primitive;
// the DS has no equivalent; see design_decisions.md § DS-First audit / PulseDot.
<div className="pulse-dot" />
```

The validator accepts this. Without the comment, the run blocks. See [rules/ds-first-mandate.md](rules/ds-first-mandate.md) for the three-test proof this comment implicitly claims to satisfy.

### 4.9 "My prototype runs but the design-qa score is 6/10. What now?"

Read `qa/design_qa_report.md`. Per-axis scores tell you where: copy / rhythm / state completeness / token coverage / pattern reuse. Iterate at G3 on the specific axis:

```
iterate on developer: state completeness is low (4/10). add empty,
  error, and loading variants to the Reports list page. fixtures
  already have the empty/error variants — just wire the renders.
```

### 4.10 "I want to write guidelines AFTER a first run, not before."

Valid workflow:

1. First run with `Guidelines: auto`. Skill generates evidence-backed drafts in `out/<runId>/guidelines/`.
2. Copy the drafts into a real location, edit/rewrite them.
3. Re-run with `Guidelines: files:<paths>` pointing at your edited versions.

This is often the fastest path to good guidelines — the fallback generator gives you a skeleton; you put the soul in.

---

## Part 5 — Anti-patterns (how NOT to use this)

### 5.1 Don't skip gates

Do not respond `ok` at G1 or G2 without actually reading the manifest / plan summary. The whole point is a cheap checkpoint before expensive downstream work.

### 5.2 Don't treat guidelines as optional

When the fallback generator emits "Insufficient evidence" in a doc, that's NOT license to ignore the topic. It's a flag: author real content or accept the downstream quality drop.

### 5.3 Don't edit generated code and re-invoke

The `out/<runId>/app/` tree is rewritten by any iteration that reaches stage 9. If you edit by hand and then iterate, your edits are lost. Instead, iterate the upstream doc that should have produced the behavior you want.

### 5.4 Don't cross-contaminate runs

Each run has its own `runId`. Don't copy files between runs. If you want to reuse research from a prior run, start a new run and point the brief at the old `research.md` as a reference document.

### 5.5 Don't promote a pattern from a single run's single use

Pattern promotion requires ≥2 uses in the SAME run. Cross-run promotion isn't automated. If a pattern from an earlier run is relevant to a new run, it's already in `patterns/INDEX.md` and will be considered — you don't need to do anything.

---

## Part 6 — Cheat sheet

### 6.1 One-liners

| Situation | Command |
|---|---|
| Full run, DS MCP, no guidelines | `/monolith <brief>. - DS: mcp:<name> - Guidelines: auto` |
| Full run, DS repo, inline docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: repo-inline` |
| Full run, DS repo, website docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: url:<link>` |
| Full run, DS repo, provided docs | `/monolith <brief>. - DS: repo:<path> - Guidelines: files:<csv>` |
| Both sources + provided docs (maximum fidelity) | `/monolith <brief>. - DS: both:mcp:<n>,repo:<p> - Guidelines: files:<csv>` |
| Resume after abort (M4+) | `/monolith --resume <runId>` |

### 6.2 Gate responses

| Intent | G1 | G2 | G3 |
|---|---|---|---|
| Proceed | `ok` | `ok` | `accept` |
| Change one field | `change <field> to <value>` | `iterate on <doc>: <delta>` | `iterate on <stage>: <delta>` |
| Start over partially | n/a | `restart from <stage>` | `iterate on <stage>: <delta>` |
| Stop | `abort` | `abort` | `abort` |
| Accept with known gaps | n/a | n/a | `log` |

### 6.3 Where to look when something breaks

| Failure mode | Look at |
|---|---|
| Triage blocks | `input-manifest.json § unresolved[]` |
| Indexing blocks | `ds-knowledge/index-warnings.md` or `ds-knowledge/conflicts.json` |
| Guidelines empty | `guidelines/*.md` frontmatter → `inferred: false` + body "Insufficient evidence" |
| Plan feels off | Read the full doc, not the G2 summary; iterate on the specific doc |
| Dev server won't boot | `qa/dev_qa_report.md § BUILD / SERVER gates` |
| DS_FIRST violation | `qa/dev_qa_report.md § DS_FIRST gate`; fix upstream (pattern-decider / developer) |
| Design-qa score low | `qa/design_qa_report.md § per-axis scores` |

---

## Appendix — The life of one section (walkthrough)

To ground everything above, here's how a single section — say, "summary-metric strip" on a dashboard — moves through the pipeline:

1. **Research.** `research.md` includes a JTBD like "glance at headline numbers before my first meeting" — from persona + brief.
2. **PRD.** `prd.md` has a user story: "As <persona>, I want to see three headline metrics on home, so that I start the day oriented." Acceptance criteria include "three metrics visible above the fold at md breakpoint."
3. **IA.** `information_architecture.md` places this on `/` under the banner landmark. Empty / error / loading inventory flags the strip.
4. **User flow.** `user_flow.md` mentions the strip as the landing-read in the happy path.
5. **Design decisions.** `design_decisions.md` row: `screen=dashboard section=metric-strip role=overview components=[Card, Statistic, Trend] variant=emphasis alt=LargeNumbers rationale=DS has Statistic with trend built in`. State plans added per screen.
6. **Build specs.** `build_specs.md` shows `src/screens/Dashboard/MetricStrip.tsx`, a fixture at `src/fixtures/metrics.ts` with empty/error variants, state placement = component-local.
7. **Pattern decisions.** `pattern_decisions.md` row: `decision=ds-composition target=[Row,Card,Statistic]`. If `patterns/INDEX.md` had `metric-trio-sparkline`, this might have been `reused-pattern` instead.
8. **Developer.** Writes `MetricStrip.tsx` using the DS's Row + Card + Statistic, with `aria-label` per metric, using tokens from `guidelines/layout.md` for spacing.
9. **Dev QA.** PROPS gate confirms `<Statistic title value precision />` are all indexed. DS_FIRST confirms no raw HTML. TOKENS advisory passes.
10. **Design QA.** Copy sampling picks one of the metric labels, scores it against voice.md. Visual rhythm score includes this row. If the skill later sees the same composition on another screen, it promotes to `patterns/metric-trio.md`.

One section, nine touchpoints. Multiply by every section on every screen. That discipline — plus the three gates — is what makes the output predictable across DSs and briefs.
