# Rule — Evidence-Weighted Decisions

Every non-trivial decision in the workflow — a persona trait, a differentiator bet, a DS extension, a copy choice, a motion duration, a priority ranking — is weighted by the evidence behind it. Stronger evidence = stronger decision. Weak evidence = tentative decision, re-examined at revision time.

## Why

Workflows without evidence weights produce plausible-looking docs where every decision is stated with equal confidence. That leads to two failure modes:
- **False certainty** — a shaky inference is written with the same tone as a load-bearing user insight, and downstream agents treat both as equally valid.
- **Silent drift** — a decision made on weak evidence at stage 4 is compounded into design decisions at stage 8, and by the time it fails at runtime, no one remembers it was a guess.

This rule forces every decision to carry its evidence weight openly.

## The evidence weight scale

Every decision is tagged with one of:

| Weight | Meaning | What it looks like |
|---|---|---|
| `[grounded]` | Direct evidence from brief, PRD, reference, or user-provided doc | Cited verbatim or via precise reference |
| `[cited-inference]` | Reasoned inference from specific evidence with citation | "Because competitor X does Y, and our persona Z does Q, therefore..." |
| `[domain-pattern]` | Relies on well-known genre/domain conventions | "Admin tools typically use sidebar nav" — acceptable for at-parity decisions |
| `[judgment]` | No direct evidence; a judgment call by the role | Acceptable for minor details; flagged so downstream agents can second-guess |
| `[speculative]` | Placeholder, to be revisited or replaced | Used sparingly; decision is provisional until stronger evidence appears |

## Where weights appear

### research.md
Persona attributes, JTBDs, and gap inferences each carry a weight tag.

```
## Persona — Alex (CE Specialist)
- Goal: Cut debugging time on strategy runs. [grounded — from PRD §1.1]
- Pain: Spends 2–3 hours/week on protocol ID reconciliation. [cited-inference — PRD §1 reports ~50 tickets/month; inferred hours from ticket volume]
- Prefers keyboard-heavy workflows. [domain-pattern — CE specialists typically favor speed over discovery]
- Has strong opinions on query performance. [judgment — reasonable for the role; not cited]
```

### differentiation-map.md
Each differentiator cites its evidence + weight.

```
## D-01 — Pipeline transparency
Evidence: Competitor CareTrax exposes aggregate counts only. [cited-inference — CareTrax product tour, 2024-12]
Bet: Showing per-step filtered counts + patient-level drill-down. [grounded — PRD §F1]
Risk: Users might feel overwhelmed by raw step-level data. [judgment — mitigated by progressive disclosure]
```

### design_decisions.md
Every section decision tags its component choice + layout choice.

### ds-extensions/*.md
Every extension ruling includes evidence weight per test.

### ux-writing-pass.md
Every string's rationale tags its weight.

## Weight requirements per decision class

Some decision classes require a minimum weight to ship:

| Decision class | Minimum acceptable weight |
|---|---|
| Differentiator bets | `[cited-inference]` minimum |
| DS extensions | `[grounded]` or `[cited-inference]` |
| Destructive action copy | `[grounded]` (derived from brief's safety requirements) |
| Empty state content | `[cited-inference]` minimum |
| Non-critical filter defaults | `[domain-pattern]` acceptable |
| Visual microdetails (icon sizes, shadow depths) | `[judgment]` acceptable |

If a differentiator is tagged `[judgment]` only, ux-strategist must escalate: either find stronger evidence, or downgrade the differentiator to "provisional" (flagged at G2 for user review).

## Downstream use

Downstream agents must respect weights:
- lead-designer reading `[speculative]` persona traits should flag them, not build load-bearing screens around them.
- developer reading `[judgment]` copy choices may substitute a better-researched option if they find one.
- design-principal can challenge any `[judgment]` decision during critique.
- commercial-auditor can downgrade a differentiator's grade if its evidence is weaker than `[cited-inference]`.

## How weights get promoted

A `[speculative]` decision can be promoted to a higher weight over iterations if:
- Additional research surfaces direct evidence → `[grounded]`.
- A downstream agent's work produces supporting inference → `[cited-inference]`.
- A pattern from the memoryRoot confirms a prior run's success with this decision → `[domain-pattern]`.

Promotions are logged in the owning doc with a `weight-history:` trail:

```
Bet: Showing per-step filtered counts + patient-level drill-down.
[grounded — PRD §F1]
weight-history:
  - 2026-04-22: [grounded] from PRD §F1
```

## Anti-patterns (fail immediately)

- Docs with no weight tags at all.
- Every decision tagged `[grounded]` to avoid scrutiny.
- `[grounded]` with no citation.
- Downstream agents ignoring upstream weights.
- Promoting `[speculative]` → `[grounded]` without new evidence.

## Success gate

- Every non-trivial decision in research.md, differentiation-map.md, design_decisions.md, ds-extensions, and ux-writing-pass has a weight tag.
- No `[speculative]` weights remain at G3 (they're either promoted or removed).
- Minimum-weight rules are satisfied for each decision class.

## Related

- [rules/market-research-mandate.md](market-research-mandate.md)
- [rules/differentiation-mandate.md](differentiation-mandate.md)
- [rules/research-rules.md](research-rules.md)
