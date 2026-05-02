# Rule 26 — Deliverable Tally Discipline

> **Why this rule exists.** Weak LLMs quietly skip artifacts. "Wrote PRD, now moving on" — but did they actually write `prd.md`? In v3.0 every agent printed a tally; in v3.3 the **orchestrator** computes the tally from `state.artifacts` and shows it after each phase. Agents only DECLARE their outputs in their final response.
>
> **Headline rule.** Agents MUST declare every artifact they wrote in their final response. The orchestrator computes `📋 Delivered: <name> | Remaining: <list>` from `state.artifacts` and `state.phases`. The agent does not return control until every declared output exists on disk.

---

## Part 1 — What the agent emits

At the end of its response, the agent emits a structured declaration block:

```
📋 Outputs
- name: design_decisions
  path: .monolith/scratchpad/design_decisions.md
  tokens: ~7800
  summary: 8 screens, 42 sections, 2 extensions proposed.
- name: best_practices
  path: .monolith/scratchpad/best_practices.md
  tokens: ~3100
  summary: Project-specific token + copy + a11y conventions.
```

The orchestrator parses this block, verifies each path exists, then writes:

```
state.artifacts.designDecisions = { summary, fullPath, tokenCount, lastModified }
state.artifacts.bestPractices = { ... }
```

---

## Part 2 — How the tally is shown to the user

After every phase, the orchestrator prints a single tally line computed from state:

```
📋 Delivered: design_decisions, best_practices | Remaining: design-principal-critique, aesthetic-audit, ux-writing-pass, build_specs
```

Agents themselves do NOT generate `📋` lines. This was the v3.0 contract; v3.3 moved tally generation to the orchestrator (Solution 19) so individual agents save tokens and the tally cannot drift from real state.

---

## Part 3 — What counts as a deliverable

Any file the agent's `writes:` frontmatter declares. Including:

- Primary planning artifacts under `.monolith/scratchpad/`.
- Per-slug files (e.g., `.monolith/scratchpad/ds-extensions/<slug>.md`).
- Pattern files under `.monolith-memory/patterns/`.
- QA reports under `<appRoot>/qa/`.
- App source under `<appRoot>/src/` (in full-gen mode, collapsed to a single `app-source` deliverable; counts emitted in the summary).

The order of delivery is the order in `writes:` unless dependencies dictate otherwise.

---

## Part 4 — No "return with remaining"

An agent that returns control with declared outputs missing on disk has failed its contract. The orchestrator treats this as a phase failure and re-invokes (per checkpoint-discipline §6).

If an agent genuinely cannot produce a remaining deliverable (blocker condition), it adds a `blocked:` entry to its outputs declaration:

```
📋 Outputs
- name: design_decisions
  path: .monolith/scratchpad/design_decisions.md
  tokens: ~7800
- blocked:
    name: best_practices
    reason: <one-line reason>
    severity: blocker | major
```

The blocker is then surfaced to the orchestrator and added to `state.issues.open`, never silently skipped.

---

## Part 5 — Multi-write artifacts

When an artifact is a directory of source files (developer full-gen), declare a single logical deliverable with file counts:

```
📋 Outputs
- name: app-source
  path: <appRoot>/src/
  fileCount: 47
  summary: 8 screens, 12 routes, fixtures wired.
```

This avoids flooding the response with per-file lines.

---

## Part 6 — Enforcement

- Orchestrator parses the `📋 Outputs` block from every agent response.
- Missing block → phase failure; agent re-invoked.
- Declared path that does not exist on disk → phase failure.
- Declared output not in agent's `writes:` list → violation logged (Rule 24).
- Mismatch between declared outputs and `phases.<name>.summary` after the orchestrator writes state → violation logged.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23.
- [rules/phase-manifest-discipline.md](phase-manifest-discipline.md) — Rule 24.
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25.
