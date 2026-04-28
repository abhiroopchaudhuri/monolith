# Rule — Differentiation Mandate

Every product ships with **3–5 explicit differentiators** — things this product does better than the competitors identified in market-research.md. "It has a sidebar and a table" is not a differentiator. "It shows every patient's exclusion step in a single click, which none of Epic, CareTrax, or HealthEdge expose" is.

## Why

A product without declared differentiators is a product that will compete on price. The workflow must force the question "why does this win?" and answer it with evidence before any screen is designed.

## Structure of differentiators

Each differentiator lives in `<runRoot>/docs/differentiation-map.md` with this shape:

```
## D-01 — <Short name>

Bet: <One sentence: what this product does that competitors don't or don't do well.>

Competitor gap: <Which competitors from market-research.md fail at this job and how.>
Evidence: <Citation or inference label from market-research.md>

How it shows up in the product:
- Screen(s): <IA section references>
- Interaction: <What the user experiences differently>
- Copy signature: <How we name it in a way that reinforces the bet>

Why DS-first still works here: <OR: why this requires ds-extension — with ruling reference>

Metric (if commercial): <Expected improvement: conversion / retention / task-completion time / user satisfaction>

Risk if wrong: <What happens if users don't value this differentiator>
```

## Differentiator count

- **3 is the floor.** Fewer means the product doesn't have a reason to exist.
- **5 is the ceiling.** More means no differentiator is actually distinctive.
- If you can't find 3, something is wrong: either market-researcher didn't identify real gaps, or the brief is just "rebuild competitor X."

## Types of differentiators (for orientation, not constraint)

1. **Transparency** — surface information competitors hide (e.g., pipeline visualization).
2. **Speed-to-value** — reduce time-to-first-benefit (e.g., dry-run without commit).
3. **Trust** — make consequences of actions clearer (e.g., "this will affect N users").
4. **Ergonomics** — remove friction in a common task (e.g., AI-generated rationale inline).
5. **Integration** — native behavior with adjacent tools (e.g., worklist without leaving chart).
6. **Pricing / packaging** — structural cost advantages.
7. **Personality / voice** — genuinely different brand presence.

A differentiator must pick ONE of these primary categories. Blended ones ("fast AND trustworthy AND cheap") are hedging.

## Consequences for design

Every screen in `information_architecture.md` must declare which differentiator(s) it serves — or explicitly state "at-parity screen, no differentiator." The design-principal uses this at critique time:
- A screen that serves a differentiator but designs identically to competitors → failed critique.
- A screen that has no differentiator and tries to be flashy → failed critique (wastes attention).

## Consequences for copy

ux-writer reads differentiation-map.md. Every user-visible string in a differentiator screen should reinforce the bet:
- If the differentiator is transparency, the copy names what's now visible.
- If the differentiator is speed, the copy counts saved time.
- If the differentiator is trust, the copy shows consequence.

## Consequences for commercial-auditor

commercial-auditor checks whether each differentiator is:
- Discoverable in a 2-minute first-use session.
- Explainable by the user to a colleague in one sentence.
- Defensible against a competitor's fast-follow (for how long, and what protects it — network effect / brand / tech / data).

## Anti-patterns (fail immediately)

- Differentiators that name no competitor gap.
- Differentiators that don't map to any screen.
- Differentiators that are all in the same category (three flavors of "faster").
- Differentiators that contradict the PRD ("we're faster" but the PRD scope has no performance feature).
- Differentiators that are preferences ("we use purple"). Unless purple *is* the brand bet.

## Success gate

- `differentiation-map.md` exists.
- 3–5 differentiators, each with the full shape above.
- Each references at least one competitor and one screen.
- Each is cited or labeled as inference.
- information_architecture.md labels every screen with differentiator(s) or "at-parity."

## Related

- [agents/ux-strategist.md](../agents/ux-strategist.md)
- [rules/market-research-mandate.md](market-research-mandate.md)
- [rules/commercial-viability-rules.md](commercial-viability-rules.md)
