# DS-First Mandate (Rule 0)

> The prime directive. Read before any other rule. Quoted from every agent in this workflow.

## The contract (v3: DS-first, evidence-extended)

A team that adopts a Design System is signing a contract: **every UI primitive comes from the DS unless the DS genuinely lacks it AND a five-test gate proves the extension is justified.** This contract is what enables:

- Design audits (does this screen pass review?)
- Theme migrations (rebrand the company in one PR)
- Automated visual regression (catches drift across 10,000 screens)
- Accessibility guarantees (DS components are audited; raw HTML isn't)
- Onboarding (a new designer reads the DS once and understands every screen)
- Consistency (a button looks like a button looks like a button)

A single **unjustified** custom primitive silently voids that contract. The DS is no longer source of truth — it's a suggestion. **This is the offense the DS-First Mandate exists to prevent.**

### The v3 clarification

Pure DS-only is not always correct. A product that slavishly avoids every extension — even when a genuine differentiator demands one, even when evidence supports one, even when the DS has a real gap — produces awkward UX that weakens the product and ultimately the DS's reputation.

The correct posture is: **DS is the default. Extensions are allowed when they pass ds-extension-judge's five-test gate.** Extensions without a ruling = contract violation. Extensions with an approved ruling = legitimate evolution of the DS's reach.

See [rules/ds-extension-criteria.md](ds-extension-criteria.md) for the gate.

## The three-test proof

Before writing **any** of the following, the writer must prove all three statements are true:

1. The DS does not export a component for this need.
2. The DS does not expose a token / theme prop for this property.
3. No DS pattern in the official docs achieves this composition.

If any test fails, the code is wrong — not in style, in **contract**. Stop, replace with the DS path, document the substitution.

## What this applies to (concrete triggers)

The mandate fires for:

| You're about to write | Audit first |
|---|---|
| `<button>`, `<input>`, `<select>`, `<textarea>`, `<a href>` | Does the DS have a Button / Input / Select / Textarea / Link? |
| Custom CSS class for a visual primitive (focus ring, badge, pill, chip, divider, separator) | Does the DS export it? Does a Tag / Badge / Divider already do this? |
| `style={{ boxShadow, borderRadius, color, backgroundColor }}` with literal values | Does the DS have a token for this property? Component prop? |
| `onMouseEnter` / `onMouseLeave` to fake hover state | DS components have built-in hover. Use the right component. |
| Custom CSS keyframes for animation (pulse, spin, fade) | DS likely has a `Spin` / `Badge status="processing"` / animated component. |
| `style={{ textDecoration: 'line-through' }}` | DS Text typically has a `delete` prop. |
| Hardcoded hex / rgb colors anywhere | The DS has a token for this. Always. |
| Custom progress / stepper / empty-state UIs | `Progress`, `Steps`, `Empty` (or DS equivalents) exist in every mature DS. |
| `<div>` styled to look like a card / dialog / banner | `Card`, `Modal`, `Message` / `Alert` exist. |

## What this does NOT apply to (legitimate custom code)

- **Layout containers**: `<div>` for flexbox/grid wrappers when the DS layout primitives don't fit, with the layout encoded in tokens or DS utility classes.
- **Truly novel domain UI**: a domain-specific visualization, a complex diagram, a bespoke chart type — when the DS has no equivalent.
- **One-off layout glue**: `gap`, `minWidth`, `gridTemplateColumns` and other CSS properties no DS exposes as a prop.

The bar: **document why the DS doesn't cover it.** Add a `// ds-first-allowed: <reason>` comment on the line above. The validator will accept this; the reviewer will read the reason.

## Why "creativity in layout" is allowed but "creativity in primitives" isn't

A senior product designer working in a DS gets to make a thousand decisions per screen:

- **Allowed (composition / layout / content):** what sections to show, in what order, at what density. What to put in a card vs a modal vs a sidesheet. Which token to use for which surface. What copy to write. What columns of a table to expose. When to use a vertical Stepper vs a horizontal Progress vs a simple Badge. What patterns to compose from atoms.
- **Not allowed (primitive invention):** what a Button looks like on hover. How a focus ring is drawn. How a Tag's corners are rounded. What animation a processing Badge uses. Whether a Card has a shadow. Whether a strikethrough is `<del>` or `text-decoration`.

Those second-bucket decisions are owned by the DS team. Override them and you break the contract.

## The audit ritual (how to comply, every time)

Before generating any UI, the lead-designer agent must produce an **audit table** for the screen. Shape (fill with components from the current run's `component-index.json`):

| UI need | DS component | Confirmed via |
|---|---|---|
| Top nav / tabs | `<DS nav or tabs component + variant>` | indexer entry |
| Sidebar | `<DS sidebar/menu component + theme/variant>` | indexer entry + token map |
| Notification count | `<DS badge/counter component + props>` | indexer entry |
| Status indicator | `<DS badge/status component + status-prop value>` | indexer entry enum |
| Progress bar | `<DS progress component>` | indexer entry |
| Empty state | `<DS empty/placeholder component>` | indexer entry |
| Decorated / semantic text (strikethrough, danger, etc.) | `<DS Typography/Text component + intent prop>` | indexer entry props |
| Stages / steps | `<DS steps/stepper component>` | indexer entry |

Any row that cannot be filled becomes a `blocker` in design_decisions.md. The user sees blockers at G2 and decides what to do — the agent never silently substitutes custom code.

## Failure looks like this

A generated `screen.tsx` that:
- Has any `<button>` element where `Button` would do
- Has any `style={{ boxShadow: '...' }}` with a literal value when the DS has a shadow token
- Has any `.module.css` or inline `<style>` that re-styles a primitive the DS exports
- Has any `onMouseEnter` / `onMouseLeave` to recreate hover state on an element the DS has a hover-capable component for
- Has any keyframe animation duplicating a DS animated component

Each occurrence: **one violation**. The DS_FIRST validator gate (see [agents/validator.md](../agents/validator.md)) blocks the run on any violation without an explicit `// ds-first-allowed: <reason>` justification.

## When in doubt

Stop. Read the component-index. Read the tokens. Read the DS docs. The answer is almost always "yes, the DS has this." Custom code is the rare exception that earns its keep with a written justification — never the default.

> **The DS is the floor, not the ceiling. You don't reinvent the floor; you build on it.**
