# Rule 2 — Pattern Memory Lifecycle

> The `patterns/` folder is the skill's only persistent cross-run memory. It is append-only. Only a human removes entries.

## What a pattern is

A recurring piece of UI composition that is NOT a DS primitive but IS worth naming because it appears across screens or projects. Examples: `metric-trio-sparkline`, `two-column-split-form-sticky-submit`, `skeleton-list-loader`, `bottom-nav-with-overflow-menu`.

Not a pattern:
- A DS component with your favorite props (that's just a usage).
- A one-screen layout that won't recur.
- A styled primitive (that's a DS-First violation, see [ds-first-mandate.md](ds-first-mandate.md)).

## When to write a pattern

A new pattern is written in **exactly three places** by **exactly two agents**:

1. **During planning** by `pattern-decider` (Stage 8) when:
   - No DS component, composition, or existing pattern fits, AND
   - The need is a LAYOUT (Step 5a in the decision tree), AND
   - The need is clearly recurring in THIS run's own screen list (appears ≥2 times).

2. **Post-generation** by `design-qa` (Stage 11) when:
   - A custom composition appears in ≥2 screens that wasn't promoted at planning time.

The design-qa path is the "safety net" — it catches patterns that the planner couldn't know would recur.

No other agent writes patterns. No autonomous promotion without ≥2 usages.

## Pattern file shape

Path: `../patterns/<kebab-slug>.md`

```markdown
---
slug: <kebab>
when: <one-line when-to-use>
created: YYYY-MM-DD
created_by_run: <runId>
last_reused_run: <runId>                    # updated at reuse
uses-ds: [<Component names from DS>]
uses-tokens: [<token paths>]
uses-custom: [<custom component names if any>]
reused_count: <N>                            # incremented at reuse
---

## When to use
Plain prose. When does this pattern fit? What signals indicate it?

## Don't use when
Anti-uses. Where the pattern would mislead or over-engineer.

## Structure
ASCII outline OR bulleted spatial description.

## Code skeleton
```tsx
// Adapter: <ds-name>@<version>  (patterns are written for one DS at a time;
// cross-DS variants get their own slug with a `-<other-ds>` suffix)

// — Skeleton using DS layout primitives + DS Card, pseudocode —
<LayoutRow gap="space-200">
  <LayoutCol span={4}>
    <Card>…</Card>
  </LayoutCol>
  <LayoutCol span={4}>
    <Card>…</Card>
  </LayoutCol>
  <LayoutCol span={4}>
    <Card>…</Card>
  </LayoutCol>
</LayoutRow>
```

## Variants
- `tight` / `comfortable` — density variants
- With/without trend-line

## A11y notes
- Each metric has aria-label including trend direction
- Focus order: metric1 → metric2 → metric3

## Tokens used
- color/brand/primary (trend-up)
- color/semantic/danger (trend-down)
- space/200 between metrics
- radius/md on Card
```

## Slug naming

- kebab-case
- describe the shape, not the domain (e.g. "metric-trio-sparkline", not "`<domain>`-summary-strip")
- short but full words ("two-column-form-sticky-submit", not "2col-form")
- if the pattern is DS-specific, suffix with the DS slug: `-<ds-slug>`

## Collisions

If a proposed slug already exists:
- Check if it's the same pattern. If yes, reuse — do not re-create.
- If it's a different pattern with the same name, suffix `-v2`. Flag for human rename.
- Never silently overwrite.

## Reuse signals

At the top of each run, `pattern-decider` reads `patterns/INDEX.md`. For each row in its decision matrix, it checks:
1. Does any pattern's `when:` match the need?
2. Does the pattern's `uses-ds` include DS components available in THIS run's component-index?

If YES to both, the decision is `reused-pattern`. The agent increments `reused_count` and updates `last_reused_run` in the pattern's frontmatter.

## No auto-deletion. Ever.

A pattern may become stale (the DS now exports the primitive, the pattern is wrong in hindsight, etc.). The skill does NOT delete. A human reviewer archives or deletes manually.

## INDEX.md regeneration

After every run, the orchestrator regenerates `patterns/INDEX.md` by walking `patterns/*.md` and emitting:

```markdown
# Patterns — index

> Auto-regenerated after every run. Do not hand-edit.

| Slug | When to use | DS | Reused | Last run |
|---|---|---|---|---|
| [metric-trio-sparkline](metric-trio-sparkline.md) | Dashboard summary with three metrics and a shared trend | `<ds-slug>` | 4 | `<YYYY-MM-DD>_<runId>` |
| … | … | … | … | … |
```

## Quality bar for promotion

Before promoting, design-qa checks:
- ≥2 actual uses in the generated app.
- The composition is distinctive (not trivially "two cards side by side").
- Tokens-only, no hex.
- A11y notes aren't trivially "standard".
- Code skeleton compiles against the current DS.

If any check fails, promotion is skipped + a note is added to the design_qa_report explaining why.

## Cross-DS patterns

A pattern is usually written for one DS. When a pattern re-appears under a different DS, create a sibling file with `-<ds-slug>` suffix. Link from the original's body:

```markdown
## Cross-DS variants
- [metric-trio-sparkline-<other-ds>.md](metric-trio-sparkline-<other-ds>.md)
```

This keeps each file self-contained (one DS's components, one code skeleton) without losing the lineage.
