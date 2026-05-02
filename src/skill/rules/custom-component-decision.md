# Rule 1 — The Custom-Component Decision Tree

> Every UI need is evaluated by this algorithm. The output is one of seven outcomes. Six build UI; one blocks the run. No other outcomes exist.

## Why this rule exists

The DS-First Mandate ([ds-first-mandate.md](ds-first-mandate.md)) tells us **what not to do**. This rule tells us **what to do instead** when the DS doesn't cover a need.

Without this tree, agents drift. They either go too far ("everything is custom") or too timid ("I'll force a SearchBox to render a datepicker"). Both are bad.

## The tree (authoritative)

For each UI need **S** in each screen:

---

**Step 1 — Direct DS component**

Is there a DS component `C` whose NAME, SEMANTICS, and VARIANTS map cleanly to S?

- YES → **Outcome: `ds-component`.** Use C directly. Record the index entry you consulted.
- NO → Step 2.

---

**Step 2 — Composition of DS components**

Can C1 + C2 + … Cn from the DS be composed — **without new CSS** — to satisfy S?

Legal composition means: DS components nested inside DS layout primitives (Row/Col/Stack/Flex/Grid), wired via standard props, with styling from DS tokens only.

- YES → **Outcome: `ds-composition`.** Document the composition in design_decisions.md. You may use inline `style={{ gap, minWidth, gridTemplateColumns }}` for layout glue; nothing else.
- NO → Step 3.

---

**Step 3 — DS-documented pattern**

Do the DS docs or guidelines describe a pattern for S? (e.g., "standard settings form layout", "card-detail page template")

- YES → **Outcome: `ds-pattern`.** Cite the doc URL or guideline file. Follow the pattern verbatim.
- NO → Step 4.

---

**Step 4 — Cross-run pattern memory**

Does [../patterns/INDEX.md](../patterns/INDEX.md) have an entry whose `when:` matches S?

- YES → **Outcome: `reused-pattern`.** Cite the slug. Follow the pattern's structure + code skeleton.
- NO → Step 5.

---

**Step 5 — Classify the gap**

S is NOT covered by DS component, composition, DS pattern, or reused pattern. Classify S:

**5a — Is S a LAYOUT COMPOSITION?** (arrangement of DS components in space, responsive behavior, stacking order, alignment)

- YES → **Outcome: `layout-inline`.** Build inline in the screen file with DS layout primitives + token-based spacing. This is normal, boring, allowed work.
- Additionally: if this composition is likely to appear in ≥2 screens of the project OR is a generalizable shape (e.g., "metric trio with sparkline"), propose to promote it at QA time. Write a provisional note in design_decisions.md under § Pattern candidates.

**5b — Is S a PRIMITIVE?** (button, input, select, chip, badge, dialog, shadow, focus ring, hover state, animation, spinner, empty state, text decoration, progress bar, stepper, tab)

- YES → **Outcome: `blocker`.** Reason: `missing-DS-primitive: <name>`. STOP. The DS team owns primitives. We do not ship custom primitives. Surface at G3 with a recommendation: (a) ask the DS team to add it, or (b) accept the run with this gap documented.

**5c — Is S a NOVEL DOMAIN UI?** (a domain-specific visualization, a complex diagram, a multi-axis dependency graph, a bespoke chart type — a thing the DS genuinely cannot anticipate)

- YES → **Outcome: `custom-novel`.** Build under `app/src/custom/<name>/`. RULES:
  - Uses only DS tokens (no hex, no magic numbers from a design tool).
  - Has its own `<name>.md` under `app/src/custom/<name>/` describing purpose, props, a11y, tokens used.
  - Is flagged in design_decisions.md § DS-First audit with the three-test proof.
  - Is flagged in delivery.md under "consider contributing to DS."

---

**Step 6 — Unclear**

If after Steps 1–5 you cannot place S, that is itself an outcome:

- **Outcome: `blocker`** with reason `unclear-requirement`. Do NOT guess. Surface at G3.

---

## Seven outcomes, total

1. `ds-component` — direct use
2. `ds-composition` — DS components composed
3. `ds-pattern` — DS-documented pattern
4. `reused-pattern` — from `patterns/` folder
5. `layout-inline` — normal layout work in the screen file
6. `custom-novel` — truly novel domain UI under `app/src/custom/`
7. `blocker` — STOP

`new-pattern` is a provisional label used in design_decisions.md § Pattern candidates. It becomes a pattern only when design-qa promotes it post-generation (see [pattern-memory-rules.md](pattern-memory-rules.md)).

## Worked examples

| Need | Step chosen | Why |
|---|---|---|
| "Primary button that says Save" | 1 | DS has Button + `type="primary"`. |
| "Settings row: label on left, input on right, helper text below" | 2 | Row + Col + Input + Typography.Text compose cleanly. |
| "Three metrics in a strip with colored trend chips" | 2 or 4 | Compose if simple; reused-pattern if slug `metric-trio` exists. |
| "A sticky header that blurs on scroll" | 5a | Layout-inline; propose pattern candidate. |
| "A 'Confirm Delete' modal" | 1 | DS has Modal + danger Button. |
| "A custom pulsing focus ring on our buttons" | 5b | BLOCKER. Primitive. DS team's job. |
| "A domain-specific waveform / graph over 24h" | 5c | Custom-novel (no DS analog). |
| "A spin animation on hover" | 5b | BLOCKER. Primitive motion — DS motion tokens + components own it. |
| "An empty state when no items exist yet" | 1 or 3 | DS has Empty/EmptyState/Placeholder; or a documented empty-state pattern. |
| "Two cards side-by-side on desktop, stacked on mobile" | 5a | Layout-inline with DS layout primitives + breakpoint tokens. |

## Anti-gaming

The algorithm is written to be un-gameable. Common gaming attempts and their counters:

- **"It's a layout, it's a little custom"** — If S is a visual primitive (has its own recognizable identity as a UI element), it is a primitive, not layout. Layout has no identity — it's spatial arrangement of things that do.
- **"The DS's Button is fine but I want rounder corners"** — rounder corners is a token change, which is a DS theme override, which is fine via adapter — not a custom component.
- **"I'll just write a thin wrapper"** — if the wrapper re-styles the DS component's primitive properties (shadow, color, shape), it IS a primitive violation wearing a wrapper hat.
- **"It's novel, it's a dashboard"** — dashboards are layout (5a), not novel UI (5c). Novel UI is when the shape/interaction genuinely has no DS analog.

When unsure, default to the stricter outcome (blocker over custom, composition over new-pattern).
