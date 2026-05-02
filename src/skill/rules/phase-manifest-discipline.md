# Rule 24 — Phase Manifest Discipline

> **Why this rule exists.** Weaker LLMs given access to the full workspace over-read: they consume planning docs from later phases, conflate design decisions with build specs, or re-derive research that's already settled. The Phase Manifest model declares exactly which files and state-tree branches each phase is allowed to read. Phase 2 cannot touch Phase 4 templates; Phase 4 cannot re-research.
>
> **Headline rule.** Every agent's frontmatter declares its `reads:` and `writes:` lists, plus an optional `search:` list for harness-native lookups. Reading outside the list is a violation. Writing outside the list is a violation.

---

## Part 1 — The agent frontmatter contract (v3.3)

Every agent file under `agents/` carries frontmatter with explicit `reads`, `writes`, and (optionally) `search`:

```yaml
---
role: lead-designer
invoked_by: orchestrator (Track B, after ux-architect; parallel-safe with engineering-manager early draft)
reads:
  state:
    - state.phases.uxArchitect.summary
    - state.phases.dsIndexer.summary
    - state.phases.themingResolver.summary
    - state.phases.marketResearcher.summary
    - state.phases.uxStrategist.summary
  files:
    - .monolith/scratchpad/information_architecture.md
    - .monolith/scratchpad/user_flow.md
    - .monolith/scratchpad/differentiation-map.md
    - .monolith/scratchpad/market-research.md
    - <runRoot>/ds-knowledge/component-index.json
    - <runRoot>/ds-knowledge/tokens.json
    - <runRoot>/theme-spec.json
    - <runRoot>/guidelines/brand.md
    - <runRoot>/guidelines/voice.md
    - <runRoot>/guidelines/layout.md
    - .monolith-memory/patterns/INDEX.md
    - ../rules/<rules this agent enforces>
    - ../references/<references this agent consults>
  search:
    - "screen components and props for {{screenName}}"
    - "token applications accent color"
writes:
  files:
    - .monolith/scratchpad/design_decisions.md
    - .monolith/scratchpad/best_practices.md
    - .monolith/scratchpad/ds-extensions/<slug>.md  # one per proposed extension
  state:
    - state.artifacts.designDecisions
    - state.artifacts.bestPractices
    - state.phases.leadDesigner
---
```

The orchestrator passes only these paths and state-tree branches to the sub-agent. The sub-agent must not open files or read branches outside them.

---

## Part 2 — What the lists encode

- **Purpose.** A phase's reads are the minimal inputs needed to do the job. Reading `commercial-audit.md` from the design phase would be premature and introduce context bleed.
- **Dependency ordering.** If phase X declares it reads Y's output, then X invariably runs after Y (or in the same parallel wave when both depend on a common ancestor). The orchestrator validates the dependency graph has no cycles.
- **Determinism.** Same reads + same model + same prompt → same outputs. Over-reading introduces variance.

### The `search:` field (v3.3 — Solution 8)

Used by high-context agents (`developer`, `lead-designer`, `engineering-manager`, `design-qa`) to delegate **detail-level** retrieval to the harness's native workspace search instead of stuffing 30K–80K tokens of documents into context. The harness (Cursor, Claude Code, etc.) resolves each query against its workspace index and returns the relevant chunks.

`search:` is additive to `reads:` — agents always have the compact summaries from `state.*`, plus any small docs declared in `files:`. They use `search:` to fetch specific details on demand. If the harness does not support search, the agent falls back to reading the full files declared in `files:`.

---

## Part 3 — What the lists do NOT encode

- The `files:` paths are paths, not content-level selectivity. An agent may read `design_decisions.md` in full — it just cannot read `commercial-audit.md` at all.
- The lists are **not runtime-locked**. Enforcement is via agent discipline + tool-call audit logs in `state.healLog`. A violation is logged but not prevented.
- The lists **include rule files and reference files** the agent depends on. These are shared, read-only, cross-run.

---

## Part 4 — Why this helps weaker LLMs

Weaker LLMs use every file they can access. If they can see `commercial-audit.md` during the design phase, they'll try to "optimize for commercial outcomes" instead of doing their actual design job. Phase manifests prevent this by omission.

This discipline also shrinks the context budget. At Haiku-tier, every unnecessary file eats the budget; explicit scoping plus harness search keeps the agent focused.

---

## Part 5 — The canonical phase manifest (v3.3)

| Phase | Agent | Track | Primary reads (summary — full lists in each agent file) |
|---|---|---|---|
| 1 | triage | — | brief, env, `input-manifest.schema.json` |
| 2a | ds-indexer | A (parallel) | DS source (MCP/repo), `component-index.schema.json` |
| 2b | guidelines-resolver | A (parallel) | guideline inputs, `*.schema.json` |
| 2c | market-researcher | A (parallel) | brief, productType, competitor seeds (produces market-research.md with inlined `## Synthesis` appendix) |
| 2d | theming-resolver | A (sequential after a–c) | dsIndexer, guidelinesResolver, theme inputs, `theme-spec.schema.json`, themeability-registry |
| 3 | researcher | A (sequential) | brief, market-research.md, guidelines, research-cache |
| 4 | product-manager | B (parallel with 5) | research, market-research, brief, commercial-viability rule |
| 5 | ux-strategist | B (parallel with 4) | research, market-research § Synthesis, brief |
| 6 | ux-architect | B (parallel with 7 early-draft) | prd, differentiation-map, brief, layout guideline |
| 7 | lead-designer | B (parallel with 6) | ux-architect (early), theme-spec, component-index, all guidelines, patterns INDEX |
| 7b | ds-extension-judge | C (batch) | all extension requests in one batch, theme-spec, component-index |
| 8a | design-principal | C (parallel with 8b) | design_decisions, differentiation-map, research, market-research |
| 8b | aesthetic-director | C (parallel with 8a) | design_decisions, theme-spec, rules 19/20, anti-generic-examples |
| 9 | ux-writer | C (sequential) | design-principal-critique, design_decisions, voice guideline, copy rules |
| 10 | engineering-manager | C (sequential) | design_decisions, ux-writing-pass, theme-spec, component-index |
| — | **G2** | yield | scratchpad files visible to user; orchestrator yields turn |
| 11 | pattern-decider | — | build_specs, patterns INDEX, design_decisions |
| 12 | developer | — | build_specs, pattern_decisions, theme-spec, component-index, ux-writing-pass, templates/ — emits `<patchManifest>` |
| 13–17 | dev-qa, production-readiness, runtime-inspector, design-qa, commercial-auditor | unified QA loop | appRoot, build_specs, ux-writing-pass, rules — run in parallel iteration 1, delta routed by patchManifest iteration 2+ |
| 18 | self-healer | — | issues from all gates + scope files + patchManifest history |
| — | **G3** | yield | DELIVERY.md; orchestrator yields turn |

Every agent's own `reads:` block is the authoritative version. This table is a reference.

---

## Part 6 — Orchestrator enforcement

The orchestrator, when invoking an agent:

1. Passes only the paths in the agent's `reads:` list (resolved against `<workspaceRoot>` / `<runRoot>` / `.monolith/`).
2. Passes the agent's declared `state:` branches as a serialized snapshot (it does not give the agent full read access to `state.json`).
3. Validates the agent's `writes:` outputs after it returns — any file written outside the list is a violation.
4. Logs tool-call stats in `state.healLog`: if the agent attempted `Read` on a file not in `reads:`, the orchestrator records it.
5. On violation: routes the issue to self-healer with severity `scope-error`.

---

## Part 7 — Migration note

v3.0 agent files used a flat list of `<runRoot>/checkpoints/<NN>-<name>.json` paths. v3.3 replaces those with `state.<branch>` references. During migration:

1. Every existing agent file gets its `reads:` and `writes:` rewritten to the structured form above.
2. `<runRoot>/checkpoints/*.json` references are mapped to `state.phases.*.summary`.
3. `<runRoot>/docs/*.md` references are mapped to `.monolith/scratchpad/*.md`.
4. Any agent file missing the new structure is treated as "reads everything" (temporary) with a deprecation warning logged in `state.healLog`.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23 (state tree).
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25.
- [agents/orchestrator.md](../agents/orchestrator.md) — enforcer.
