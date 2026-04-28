# monolith — maintainer's README

Self-contained, DS-agnostic skill that takes a product brief + any design system and produces a fully-documented, running React prototype.

This README is for the person **maintaining** the skill. If you are using it, read [SKILL.md](SKILL.md) and [QUICKSTART.md](QUICKSTART.md). If you want the spec, read [plan.md](plan.md) — that is the source of truth.

---

## Folder map

| Path | What lives here |
|---|---|
| [plan.md](plan.md) | The master plan + tracker. Every file, every gate. |
| [SKILL.md](SKILL.md) | User-facing skill definition (frontmatter is required). |
| [QUICKSTART.md](QUICKSTART.md) | Happy-path walkthrough for a maintainer smoke-test. |
| [TUTORIAL.md](TUTORIAL.md) | Scenario-driven guide — every input shape, every iteration, handoff, anti-patterns. |
| [agents/](agents/) | 13 subagent prompts the orchestrator invokes. |
| [rules/](rules/) | Enforceable doctrines. Every agent cites the ones that apply. |
| [templates/](templates/) | Code scaffolding — `.tsx.hbs`, `vite.config.ts.hbs`, etc. |
| [docs-templates/](docs-templates/) | Markdown artifact templates — research, PRD, IA, etc. |
| [scripts/](scripts/) | TypeScript utilities. All JS-heavy work lives here, never in agents. |
| [guidelines-schema/](guidelines-schema/) | JSON schemas for the seven normalized guideline docs. |
| [patterns/](patterns/) | **Persistent** pattern memory. Appended to across runs. Never deleted by the skill. |
| [references/](references/) | Curated playbooks, layout primers, a11y checklists. Read-only. |
| [prompts/](prompts/) | Reusable system-prompt fragments. |
| [examples/](examples/) | Replayable end-to-end traces for maintainer reference. |

---

## How it runs

```
user -> SKILL.md -> orchestrator agent ->
  triage → ds-indexer → guidelines-resolver
  → researcher → PM → ux-architect → lead-designer → EM
  [G2]
  → pattern-decider → developer
  → dev-qa → design-qa
  [G3]
  → delivery
```

See [plan.md §2](plan.md) for the full diagram.

---

## Agents at a glance

See [plan.md §3](plan.md) for the table. Every agent file carries: role, inputs, outputs, system prompt, steps, fail modes, gates, example. No agent runs code; scripts do that. Agents call scripts.

---

## The hard problems this skill solves

1. **DS source pluralism** — MCP, repo, or both. Stage 1 normalizes.
2. **Guideline source pluralism** — provided files, website, repo-inline, or none-so-generate. Stage 2 normalizes.
3. **"Do we build custom or bend the DS?"** — codified in [rules/custom-component-decision.md](rules/custom-component-decision.md).
4. **"We keep re-inventing the same custom composition"** — solved by [patterns/](patterns/).
5. **Hallucinated specs** — countered by hard-typed contracts between stages + schema validation.
6. **Silent fallbacks masquerading as success** — countered by three approval gates and explicit blockers.

---

## What v1 does NOT do (and why)

- **No Figma writes.** Separation of concerns with Phase 2.
- **No Vue/Svelte/Solid.** Template surface would 3x.
- **No auto-publish to git.** All output is local under `out/`; promotion is user-decided.
- **No autonomous mode past G1.** Two more gates exist for a reason.
- **No cross-run memory other than `patterns/`.** If you need project-long memory, use CLAUDE.md in the app folder.

---

## Adding a new DS

Minimum viable onboarding for a new DS is a single adapter file at `../shared/ds-adapters/<name>.json` + one call to the indexer:

```bash
ts-node scripts/index-ds-repo.ts --adapter ../shared/ds-adapters/<name>.json
```

If the DS exposes itself via MCP, no adapter is needed — `scripts/index-ds-mcp.ts --mcp <name>` is enough.

If the DS has neither an adapter nor an MCP, the run will block at Stage 1 with a clear message. Writing an adapter takes ~30 minutes. Schema is simple: name, framework, entry, importPath, componentsGlob, storiesGlob, docsGlob, propTypes source, variantProps list, iconPackage, tokens source, themeAccess, layoutPrimitives. See `../shared/ds-adapters/` for any existing adapters in this repo.

---

## Changing the pipeline

Everything is a file. To change:

- **Add a stage** — add an agent file to `agents/`, register it in `agents/orchestrator.md` § Pipeline, add a row to [plan.md §10](plan.md).
- **Change an artifact** — edit the template in `docs-templates/`, update the owning agent's `outputs`, update the schema if one exists.
- **Harden a rule** — edit the file in `rules/`, update any agent that cites it.
- **Add a pattern** — just add `patterns/<slug>.md`; the next run regenerates `patterns/INDEX.md`.

---

## Known rough edges (v1)

See [plan.md §13 Open questions](plan.md) for the current list. At the time of writing:

- No auto-wipe of `.cache/` — user responsibility.
- MCP failure mid-run falls back to repo only if both are provided; otherwise blocks.
- Guideline inference is Sonnet-prompted — quality varies across DS.
- No opinion yet on how to dedupe nearly-identical patterns across runs.
