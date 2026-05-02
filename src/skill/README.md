# monolith — maintainer's README

Self-contained, DS-agnostic, zero-dependency skill that takes a product brief + any design system and produces a fully-documented, market-grade running React app.

This README is for the person **maintaining** the skill. If you are using it, read [SKILL.md](SKILL.md) and [QUICKSTART.md](QUICKSTART.md). If you want the spec, read [plan.md](plan.md) — that is the source of truth.

---

## Folder map

| Path | What lives here |
|---|---|
| [plan.md](plan.md) | The master plan + tracker. Every file, every gate. |
| [SKILL.md](SKILL.md) | User-facing skill definition (frontmatter is required). |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute happy-path walkthrough. |
| [TUTORIAL.md](TUTORIAL.md) | Scenario-driven guide — every input shape, every iteration, handoff, anti-patterns. |
| [user_tutorial.md](user_tutorial.md) | The bare invocation template + gate cheat sheet. |
| [agents/](agents/) | 24 sub-agent prompts the orchestrator invokes. |
| [rules/](rules/) | Enforceable doctrines. Every agent cites the ones that apply. |
| [templates/](templates/) | Code scaffolding — `.tsx.hbs`, `vite.config.ts.hbs`, etc. |
| [docs-templates/](docs-templates/) | Markdown artifact templates. |
| [scripts/](scripts/) | TypeScript utilities — 23 implemented scripts (state-manager, run-phase, run-qa, scratchpad-lifecycle, get-affected-gates, resolve-browser, render-planning-review, etc.). All JS-heavy work lives here, never in agents. |
| [guidelines-schema/](guidelines-schema/) | JSON schemas for the seven normalized guideline docs and the input manifest. |
| [references/](references/) | Curated playbooks, layout primers, a11y checklists, anti-generic examples, surface templates. Read-only. |
| [prompts/](prompts/) | Reusable system-prompt seeds. |
| [examples/](examples/) | Replayable end-to-end traces (populated after first real run) + sample DS adapter. |

The 24 agents are: `triage`, `ds-indexer`, `guidelines-resolver`, `theming-resolver`, `market-researcher`, `researcher`, `product-manager`, `ux-strategist`, `ux-architect`, `lead-designer`, `ds-extension-judge`, `design-principal`, `aesthetic-director`, `ux-writer`, `engineering-manager`, `pattern-decider`, `developer`, `dev-qa`, `production-readiness-auditor`, `runtime-inspector`, `design-qa`, `commercial-auditor`, `self-healer`, plus the `orchestrator` itself.

---

## How it runs (v3.3)

```
user → SKILL.md → orchestrator agent
  ─ triage [G1 blocking]
  ─ Track A (parallel): ds-indexer ‖ guidelines-resolver ‖ market-researcher
                        → theming-resolver → researcher
  ─ Track B (parallel): product-manager ‖ ux-strategist
                        → ux-architect ‖ lead-designer (early)
  ─ Track C: ds-extension-judge (batch)
             → design-principal ‖ aesthetic-director (parallel critique)
             → ux-writer → engineering-manager
  [G2 turn yield — user edits .monolith/scratchpad/*, replies continue/iterate]
  ─ pattern-decider → developer
  ─ Unified QA loop (5 gates parallel iter 1, delta iter 2+)
  [G3 turn yield — accept archives, iterate re-runs]
  ─ DELIVERY.md
```

State lives in `.monolith/state.json` (Rule 23). Every agent declares `reads:` / `writes:` (Rule 24). All planning artifacts size-capped (Rule 25). Output declarations from agents are reconciled into the tally by the orchestrator (Rule 26).

See [plan.md](plan.md) for the full flow.

---

## Agents at a glance

See [plan.md](plan.md) and the table above. Every agent file carries: role, invoked_by, reads, writes, system prompt, steps, fail modes, gates, and an outputs declaration block (Rule 26). No agent runs code; scripts do that. Agents call scripts via the orchestrator's tool-call interface.

---

## The hard problems this skill solves

1. **DS source pluralism** — MCP, repo, or both. `ds-indexer` normalizes.
2. **Guideline source pluralism** — provided files, website, repo-inline, or none-so-generate. `guidelines-resolver` normalizes.
3. **Theming pluralism** — palette JSON, CSS, Tailwind config, Figma export, design-tokens.json, brand URL, inline. `theming-resolver` normalizes (Rule 21) + classifies DS themeability tier (Rule 22).
4. **"Do we build custom or bend the DS?"** — codified in [rules/ds-extension-criteria.md](rules/ds-extension-criteria.md) + adjudicated in batch by `ds-extension-judge`.
5. **"We keep re-inventing the same custom composition"** — solved by `.monolith-memory/patterns/`.
6. **AI-generic aesthetic** — Rule 19 (premium standard) + Rule 20 (anti-pattern blacklist) enforced at planning time (`aesthetic-director`) and runtime (`dev-qa § ANTI_GENERIC` + `design-qa`).
7. **Market drift** — `market-researcher` + `ux-strategist` make differentiation explicit (Rule 13).
8. **Hallucinated specs** — countered by hard-typed contracts between phases via the state tree + zod schemas in `state-manager.ts`.
9. **Silent fallbacks masquerading as success** — countered by three approval gates and explicit blockers.

---

## What v3.3 does NOT do (and why)

- **No Figma writes.** Separation of concerns with Phase 2 (`rewire-to-ds`).
- **No Vue/Svelte/Solid.** React + Vite only.
- **No multi-app per run.** One app per run. Multi-route is fine.
- **No autonomous mode past G1.** G2 and G3 are turn-yields; the orchestrator stops and waits for the user.
- **No SQLite, no Git branching, no custom RAG.** Zero-dependency by design (per `MONOLITH-ZERO-DEPENDENCY-PLAN.md`).
- **No background work during gates.** Anything async would orphan when the editor tab closes.

---

## Adding a new DS

Minimum viable onboarding for a new DS is a single adapter file at `examples/ds-adapters/<name>.json` (sample shipped) + one indexer call:

```bash
npm run index-ds-repo -- --adapter examples/ds-adapters/<name>.json
```

If the DS exposes itself via MCP, no adapter is needed — `npm run index-ds-mcp -- --mcp-name <name>` is enough.

If the DS has neither an adapter nor an MCP, the run blocks at G1 with a clear message. Writing an adapter takes ~30 minutes for a well-typed DS. Schema fields: `name`, `framework`, `entry`, `importPath`, `componentsGlob`, `storiesGlob`, `docsGlob`, `propTypes` source, `variantProps`, `iconPackage`, `tokens` source, `themeAccess`, `layoutPrimitives`. Sample at `examples/ds-adapters/`.

---

## Changing the pipeline

Everything is a file. To change:

- **Add a stage** — add an agent file to `agents/` with `reads:` / `writes:` frontmatter, register it in `agents/orchestrator.md` § The run, add a row to [plan.md](plan.md) tracker.
- **Change an artifact** — edit the template in `docs-templates/`, update the owning agent's `writes:` declaration, update the schema if one exists.
- **Harden a rule** — edit the file in `rules/`, update any agent that cites it.
- **Add a pattern** — append to `.monolith-memory/patterns/log.jsonl`; the next run regenerates `INDEX.md` lazily.

After any change, run `node ../sync-skills.js` (from `src/monolith/` it's `node ../../sync-skills.js`) to propagate to the editor folders, then `npm run typecheck` and a smoke run.

---

## Known rough edges (v3.3)

- **MCP browser tools** are optional. When unavailable, `runtime-inspector` falls back to Playwright via `scripts/runtime-sweep.ts`.
- **Harness-native search** quality varies across editors. Cursor and Claude Code both work; smaller editors may not return ranked chunks.
- **Cache invalidation** is conservative (any input mtime change busts). Force a refresh with `--no-cache` or `--refresh-research`.
- **Pattern dedup across runs** — no automatic merge. Slug collisions get `-v2` suffixes; humans rename.
- **Resume across runs** — `--resume <runId>` reads `.monolith/state.json` and continues from the last `done` phase. State + scratchpad must both exist.
