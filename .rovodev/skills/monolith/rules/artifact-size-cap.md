# Rule 25 — Artifact Size Cap

> **Why this rule exists.** Weak LLMs generate massive prose when unconstrained — a PRD balloons to 30K tokens, a design_decisions file to 25K, and downstream agents can't re-read them in a single pass. Capping specs at 10K tokens forces compression and improves downstream reliability.
>
> **Headline rule.** Every planning artifact under `<runRoot>/docs/` has a hard size cap. Source code under `<appRoot>` is exempt (code has its own correctness signals).

---

## Part 1 — The caps

| Artifact | Cap (tokens, approx) | Rationale |
|---|---|---|
| `market-research.md` | 8,000 | Top competitors + loopholes + visual signatures |
| `competitive-synthesis.md` | 3,000 | Lightweight summary |
| `research.md` | 8,000 | Personas, JTBDs, risks, gap inferences |
| `prd.md` | 10,000 | Problem, stories, MVP, metrics, open questions |
| `differentiation-map.md` | 4,000 | 3–5 bets with citations |
| `information_architecture.md` | 6,000 | Sitemap, nav, state inventory |
| `user_flow.md` | 5,000 | Paths, decision points |
| `design_decisions.md` | 10,000 | Per-section table, tokens, states, extensions |
| `best_practices.md` | 5,000 | Project-specific practices |
| `design-principal-critique.md` | 6,000 | Grades + revisions |
| `aesthetic-audit.md` | 6,000 | Tells + verdict + revisions |
| `ux-writing-pass.md` | 8,000 | Strings rewritten with rationale |
| `build_specs.md` | 10,000 | File tree, routes, state model |
| `pattern_decisions.md` | 5,000 | Decision matrix |
| `commercial-audit.md` | 6,000 | Five surfaces |
| `qa.md` (consolidated) | 10,000 | Roll-up of dev-qa / prod / runtime / design / commercial |
| `DELIVERY.md` | 8,000 | Run summary |
| Any checkpoint `<NN>-*.json` | 4,000 | Phase summary only |

**Token-counting convention.** Use a character-based heuristic: 1 token ≈ 4 characters of English. A 10K-token cap = ~40KB of text.

---

## Part 2 — How to compress

When an agent would exceed the cap:

- **One decision per line** instead of paragraphs. Tables beat prose.
- **`{{variables}}`** for repeated string patterns. Don't write the same boilerplate three times.
- **Edge cases as flat lists**, not nested narratives.
- **Cite, don't re-include.** If content already exists in another doc, reference the path + section rather than duplicating.
- **No examples in planning docs.** Examples belong in references/. Planning docs state decisions.
- **Remove preamble.** No "This document describes…" framing. Jump to structure.

---

## Part 3 — What is NOT capped

- Generated source code under `<appRoot>`.
- Schema files under `guidelines-schema/`.
- Reference documents under `references/` (authored once, consumed many).
- Rule files under `rules/` (authored once, consumed many).
- DS knowledge under `<runRoot>/ds-knowledge/` (machine-generated, size tied to DS).
- QA report attachments (axe output, screenshots manifests) — stored as separate files.

---

## Part 4 — Enforcement

- Each agent self-checks size before writing. If over cap, compress; if compression is not possible without information loss, raise a blocker to the orchestrator.
- Orchestrator validates after the write. Over-cap → file is rejected; phase re-runs with compression instruction.
- Two consecutive over-cap returns for the same phase = blocker, escalated at the next gate with the agent's compression reasoning.

---

## Part 5 — Caps and the premium-visual work

Rules 19 + 20 produce `aesthetic-audit.md` at 6K. This is enough for per-screen verdict + required revisions. The full premium-aesthetic-standard is in `rules/`, not duplicated into the audit.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23.
- [rules/phase-manifest-discipline.md](phase-manifest-discipline.md) — Rule 24.
- [rules/deliverable-tally.md](deliverable-tally.md) — Rule 26.
