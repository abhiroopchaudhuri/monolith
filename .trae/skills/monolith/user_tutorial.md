# How to Run the Monolith Skill

This guide contains everything you need to invoke and run the `monolith` skill effectively in any supported AI editor (Claude Code, Cursor, OpenCode, Trae, Gemini-class).

## The Initial Prompt

Copy this template into your editor's chat:

```text
Read monolith/SKILL.md and act as the orchestrator per monolith/agents/orchestrator.md.

Run the full v3.3 pipeline end-to-end against:

- DS: repo:./<your-ds-folder-name>      (or mcp:<name>, or both:mcp:<n>,repo:<p>)
- Guidelines: auto                      (or files:<csv>, url:<link>, repo-inline)
- Theme: light                          (or dark, both)
- Density: comfortable                  (or compact, spacious)
- Locale: en-US
- ProductType: <consumer-saas | b2b-saas | internal-tool | regulated-tool | developer-tool>

Brief:
<paste your brief, OR>
PRD: ./prd.md
Reference: ./reference.png

Pipeline contract:
- Block at G1 (Input).
- Yield the turn at G2 (Plan) and G3 (Delivery). Do not run anything in the
  background while waiting for my reply.
- Run the unified QA loop to convergence (max 5 iterations per gate).
- Spawn parallel sub-agents per the orchestrator's track plan.
- Use the state tree at .monolith/state.json as source of truth.
```

### Input Parameters Explained
- **DS** — where your Design System lives. `mcp:<name>`, `repo:<path>`, or `both:mcp:<name>,repo:<path>`.
- **Guidelines** — where your design guidelines live. `auto` (generate fallbacks from DS), `files:<paths-csv>`, `url:<link>`, or `repo-inline`.
- **Theme** — `light`, `dark`, or `both`.
- **Density** — `compact`, `comfortable`, or `spacious`.
- **Locale** — BCP-47, e.g. `en-US`.
- **ProductType** — calibrates research and commercial audits.

## Mode Flags

Append flags to change scope or interactivity. See `rules/approval-gate-rules.md § Mode flags interaction` for the full matrix.

- `--full` (default) — entire pipeline through G3 + running app.
- `--themeOnly` — triage + ds-indexer + guidelines-resolver + theming-resolver, then stop. Produces `theme-spec.json` + `themeability-report.md`. Useful to check "can my DS + brand work together?"
- `--planOnly` — discovery + research + design + specs through G2. No app built.
- `--lazy` — auto-approve G1 (if `unresolved[]` empty) and auto-`continue` at G2 (if no scratchpad edits). G3 stays interactive.
- `--UXR` — research synthesis only (`market-research.md` + `research.md`). No design, no build.
- `--noPRD` — skip PRD generation. Everything else runs.
- `--no-cache` — bypass fingerprint cache for cacheable phases.
- `--refresh-research` — invalidate research/market-research cache only.

Example with flags:
```text
Run the v3.3 pipeline --planOnly --lazy against...
```

## The Three Approval Gates

### G1 — Input (blocking)
- **When:** Right after triage.
- **What it does:** Shows the parsed input manifest and any `unresolved[]` items.
- **How to respond:** `ok` / `proceed` to continue, `change <field> to <value>` to edit, `rename app to <name>`, or `abort`.

### G2 — Plan (turn-yielding)
- **When:** After all planning artifacts (research, PRD, IA, user flow, design decisions, critique, aesthetic audit, ux-writing pass, build specs) are written.
- **What it does:** Renders `.monolith/scratchpad/PLANNING_REVIEW.md` and yields the turn. **Nothing runs in the background.**
- **What you can do during the yield:** Open any file in `.monolith/scratchpad/` (e.g. `prd.md`, `design_decisions.md`, `build_specs.md`) and edit it directly.
- **How to respond on your next turn:**
  - `continue` — orchestrator runs `scratchpad-lifecycle.ts detect-edits`. If you edited any file, the affected phase + downstream phases re-run. Otherwise it proceeds straight to `pattern-decider`.
  - `iterate on <doc>: <delta>` — e.g. `iterate on prd: shrink the MVP to 3 user stories`. Re-runs the owning agent + downstream.
  - `restart from <phase>` — resets that phase and everything downstream.
  - `abort` — stops; state and scratchpad are preserved.

### G3 — Delivery (turn-yielding)
- **When:** After the unified QA loop converges (or hits the 5-iteration cap with escalation).
- **What it does:** Presents localhost URL, the delivery summary, and per-gate self-healing iteration counts. Yields the turn.
- **How to respond:**
  - `accept` — archives `.monolith/scratchpad/` → `.monolith/archive/<runId>/`, clears scratchpad, marks the run completed, prints the Phase 2 handoff.
  - `iterate on <stage>: <delta>` — re-runs that stage + every downstream stage.
  - `abort` — stops; everything stays as-is.

## What Happens Between G2 and G3 (the unified QA loop)

You don't need to intervene during the QA loop unless the orchestrator explicitly asks. For context:

- **Iteration 1 (full sweep):** the five QA agents run in parallel against the just-built app:
  - `dev-qa` — TypeScript, ESLint, build, DS_FIRST static rules, ANTI_GENERIC literal scan.
  - `production-readiness-auditor` — every-button-wired, every-route-renders, every-state-reachable.
  - `runtime-inspector` — Playwright sweep across routes, viewports, modals, forms.
  - `design-qa` — visual rhythm, copy, token coverage, state completeness.
  - `commercial-auditor` — onboarding, conversion, retention, trust, expansion surfaces.
- All issues aggregate into `state.issues.open[]`. The `self-healer` merges them into a single patch brief; `developer` applies ONE patch and emits a `<patchManifest>` block declaring what changed.
- **Iteration 2+ (delta):** `scripts/get-affected-gates.ts` reads the patchManifest and runs only the gates the patch could have affected. Hard cap of 5 iterations per gate. Hard-block with escalation otherwise.

## Where Things Live

- `.monolith/state.json` — single source of truth for the run.
- `.monolith/scratchpad/*.md` — full planning artifacts (only present during the run).
- `.monolith/archive/<runId>/` — where scratchpad files move on `accept`.
- `.monolith/cache/<tier>/<hash>/` — content-addressable cache (DS knowledge, guidelines, research, etc.).
- `<workspaceRoot>/<appName>/` — the running React app + its `qa/` reports + `DELIVERY.md`.
- `<workspaceRoot>/.monolith-memory/patterns/` — cross-run pattern memory (append-only).

## Common iterations

Try these phrasings at G2:

```
iterate on prd: MVP is too big. keep only (1) create report, (2) share, (3) comment.
iterate on differentiation-map: drop bet 3, it's table-stakes not differentiation.
iterate on design_decisions: collapse the summary cards into the DS Table.
restart from ux-architect
```

At G3:

```
iterate on developer: settings page has too much blank space. set density=compact there.
iterate on design-qa: re-score; I manually updated the dashboard copy.
iterate on commercial-auditor: onboarding score was 4/10; add a 3-step empty-state guide.
```
