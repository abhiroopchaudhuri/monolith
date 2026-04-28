# Rule 24 — Phase Manifest Discipline

> **Why this rule exists.** Weaker LLMs given access to the full runRoot over-read: they consume planning docs from later phases, conflate design decisions with build specs, or re-derive research that's already settled. The Phase Manifest model declares exactly which files each phase is allowed to read — Phase 2 cannot touch Phase 4 templates; Phase 4 cannot re-research. `monolith` adopts the same discipline.
>
> **Headline rule.** Every agent's frontmatter declares its `reads:` and `writes:` lists. Reading outside the list is a violation. Writing outside the list is a violation.

---

## Part 1 — The agent frontmatter contract

Every agent file under `agents/` carries frontmatter with explicit `reads` and `writes`:

```yaml
---
role: lead-designer
invoked_by: orchestrator (after ux-architect, before design-principal)
produces: <runRoot>/docs/design_decisions.md, <runRoot>/docs/best_practices.md
reads:
  - <runRoot>/checkpoints/09-ia.json
  - <runRoot>/ds-knowledge/component-index.json
  - <runRoot>/ds-knowledge/tokens.json
  - <runRoot>/theme-spec.json
  - <runRoot>/guidelines/brand.md
  - <runRoot>/guidelines/voice.md
  - <runRoot>/guidelines/layout.md
  - <runRoot>/docs/information_architecture.md
  - <runRoot>/docs/user_flow.md
  - <runRoot>/docs/differentiation-map.md
  - <runRoot>/docs/market-research.md
  - <memoryRoot>/patterns/INDEX.md
  - ../rules/<rules this agent enforces>
  - ../references/<references this agent consults>
writes:
  - <runRoot>/docs/design_decisions.md
  - <runRoot>/docs/best_practices.md
  - <runRoot>/docs/ds-extensions/<slug>.md  (one per proposed extension)
  - <runRoot>/checkpoints/10-design-decisions.json
---
```

The orchestrator passes only these paths to the sub-agent. The sub-agent must not open files outside them.

---

## Part 2 — What the lists encode

- **Purpose.** A phase's reads are the minimal inputs needed to do the job. No more. Reading `commercial-audit.md` from the design phase would be premature and introduce context bleed.
- **Dependency ordering.** If phase X declares it reads Y's output, then X invariably runs after Y. The orchestrator validates the dependency graph has no cycles.
- **Determinism.** Same reads + same model + same prompt → same outputs. Over-reading introduces variance.

---

## Part 3 — What the lists do NOT encode

- The lists are **file paths**, not content-level selectivity. An agent may read `design_decisions.md` in full — it just cannot read `commercial-audit.md` at all.
- The lists are **not runtime-enforced yet** — the orchestrator may not lock the filesystem. Enforcement is via agent discipline + tool-call audit logs. A violation is logged but not prevented.
- The lists **include rule files and reference files** the agent depends on. These are shared, read-only, cross-run.

---

## Part 4 — Why this helps weaker LLMs

Weaker LLMs use every file they can access. If they can see `commercial-audit.md` during the design phase, they'll try to "optimize for commercial outcomes" instead of doing their actual design job. Phase manifests prevent this by omission.

This discipline also shrinks the context budget. At Haiku-tier, every unnecessary file eats the budget; explicit scoping keeps the agent focused.

---

## Part 5 — The canonical phase manifest

| Phase | Agent | Primary reads (summary — full lists in each agent file) |
|---|---|---|
| 1 | triage | brief, env, `input-manifest.schema.json` |
| 2a | ds-indexer | DS source (MCP/repo), `component-index.schema.json` |
| 2b | guidelines-resolver | guideline inputs, `*.schema.json` |
| 2c | theming-resolver | checkpoint-02, checkpoint-03, theme inputs, `theme-spec.schema.json`, themeability-registry |
| 2d | market-researcher | brief, productType, competitor seeds |
| 3 | competitive-synthesizer | checkpoint-05, brief |
| 4 | researcher | checkpoint-01, checkpoint-03, checkpoint-05, brief, research-cache |
| 5 | product-manager | checkpoint-04, checkpoint-06, checkpoint-08, brief, commercial-viability rule |
| 6 | ux-strategist | checkpoint-05, checkpoint-06, checkpoint-07, brief |
| 7 | ux-architect | checkpoint-06, checkpoint-07, checkpoint-08, brief, layout guideline |
| 8 | lead-designer | checkpoint-09, theme-spec, component-index, all guidelines, patterns INDEX |
| 8b | ds-extension-judge | (invoked per extension request) extension request, theme-spec, component-index |
| 9 | design-principal | checkpoint-10, checkpoint-08, research, market-research |
| 9b | aesthetic-director | checkpoint-10, checkpoint-11, theme-spec, rules 19/20, anti-generic-examples |
| 10 | ux-writer | checkpoint-11, checkpoint-12, voice guideline, copy rules |
| 11 | engineering-manager | checkpoint-10, checkpoint-11, checkpoint-12, theme-spec, component-index |
| 12 | pattern-decider | checkpoint-14, patterns INDEX, design_decisions |
| 13 | developer | checkpoint-14, checkpoint-15, theme-spec, component-index, ux-writing-pass, templates/ |
| 14 | dev-qa | appRoot, component-index, rules 0/9/19/20 |
| 15 | production-readiness-auditor | appRoot, build_specs, rules 9/11 |
| 16 | runtime-inspector | appRoot, build_specs, runtime rules |
| 17 | design-qa | appRoot, checkpoint-11, checkpoint-12, theme-spec, rules 15/19/20 |
| 18 | commercial-auditor | appRoot, checkpoint-07, checkpoint-08, commercial rules |
| 19 | self-healer | the issues list from the failed QA agent + scope files only |

Every agent's own `reads:` block is the authoritative version. This table is a reference.

---

## Part 6 — Orchestrator enforcement

The orchestrator, when invoking an agent:

1. Passes only the paths in the agent's `reads:` list (resolved against `runRoot` / `memoryRoot` / `workflowRoot`).
2. Validates the agent's `writes:` outputs after it returns — any file written outside the list is a violation.
3. Logs tool-call stats: if the agent attempted `Read` on a file not in `reads:`, the orchestrator records it.
4. On violation: routes the issue to self-healer with severity `scope-error`.

---

## Part 7 — Migration note

Existing agent files predate this rule. During v3.2 rollout:

1. Every existing agent file gets `reads:` and `writes:` frontmatter fields, reverse-engineered from its current "Read before starting" + "Produces" sections.
2. Orchestrator begins enforcing on the next run.
3. Any agent file missing the lists is treated as "reads everything" (temporary) with a deprecation warning.

The new agents (`theming-resolver`, `aesthetic-director`) are born with the lists in place.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23.
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25.
- [agents/orchestrator.md](../agents/orchestrator.md) — enforcer.
