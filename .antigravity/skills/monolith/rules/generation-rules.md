# Generation Rules

Rules for the `generator` subagent when turning an approved `screen-plan.json` into `screen.tsx`. Output must pass all gates in [`scripts/validate-generated.ts`](../scripts/validate-generated.ts).

## 0. DS-First Mandate (read first, applies always)

**Custom code is a contract violation, not a design choice.**

Before writing any raw HTML interactive element (`<button>`, `<input>`, `<select>`, `<textarea>`, `<a href>`), any custom CSS class for a visual primitive (focus ring, badge, pill, divider, status dot), any inline `style` whose property the DS exposes as a token, or any `onMouseEnter`/`onMouseLeave`/`onFocus` handler that recreates a hover/focus state — the writer MUST prove all three:

1. The DS does not export a component for this need.
2. The DS does not expose a token / theme prop for this property.
3. No DS pattern in the docs achieves this composition.

If any test fails, the code is wrong — not in style, in **contract**. Full doctrine: [ds-first-mandate.md](ds-first-mandate.md). Concrete violation→replacement table: [anti-patterns.md](anti-patterns.md).

When the DS genuinely lacks a primitive, document the substitution with a `// ds-first-allowed: <reason>` comment on the line above the custom code, and reference the rationale in the section's `notes` in the screen-plan. The validator's `DS_FIRST` gate accepts this; without the comment, the run fails.

This rule supersedes any aesthetic preference. "It looks better with a custom focus ring" is not a valid reason — it's the exact failure mode this rule exists to prevent.

## 1. No hallucinated props

- **Props:** Every JSX attribute must correspond to a prop in the component's index entry, OR be one of the always-allowed set: `className`, `style`, `children`, `key`, `ref`, `data-*`, `aria-*`, `on*` event handlers.
- **Enum values:** If the prop has an `enum` in the index, the value passed must be in that list.
- **Deprecated props:** Do not emit them unless the approved plan specifies them (with a reason). The validator warns; the generator refuses.
- **Icons:** Only names present in `component-index.icons.names`. If the name isn't known (e.g. when the DS's icon manifest was not enumerable), and the plan requested an icon, **emit a TODO comment in the icon slot** instead of guessing. Example: `icon={/* TODO: icon 'search' not in index */ null}`.
- **Subcomponents:** Use `Component.Subcomponent` form only if `subcomponents[]` lists it.

## 2. Imports

- Everything imported from the DS must come from `component-index.ds.importPath`. **No deep imports** unless the adapter explicitly lists an extra entrypoint.
- Icon imports: from `component-index.icons.package`.
- React: `import React from "react"` at the top.
- No other third-party packages unless declared in the plan's `notes`.

## 3. Layout

- Prefer the DS's layout primitives (from `adapter.layoutPrimitives`) for all structural work. Raw `<div>` is the last resort.
- Root element: a DS layout primitive (e.g. `Layout`, `Flex`, `Stack`) that wraps all sections in plan order.
- Each top-level section gets a stable `id` attribute matching `section.id`, and when meaningful, a `role` / `aria-label`.

## 4. Copy

- Copy comes **verbatim** from `section.copy`. No transformations (no casing changes, no truncation, no inference).
- If a slot in `copy` has no value, leave the slot unfilled rather than inventing text.

## 5. Data

- Fixtures from the plan's top-level `fixtures` block are inlined at the top of the file as named consts.
- Each section references its fixture by variable name, not by re-declaring data.
- No runtime faker, no `Math.random()`, no `new Date()` — the file must be deterministic.

## 6. Tokens

See [token-usage-rules.md](token-usage-rules.md). Short version: use the DS's idiomatic token access (theme object, CSS var, or class). Never emit raw hex / px values that duplicate a known token.

## 7. Accessibility

- Headings: one `<h1>` per screen, rest nested appropriately via the DS's typography components.
- Labels: inputs get a paired label. Use whatever the DS ships — `Form.Item`, `Field.Label`, `FormControl`, or the documented pattern — as indexed for this run.
- Buttons that render only an icon get `aria-label`.
- Landmarks from `plan.a11y.landmarks` are realized via `role` attrs or DS landmark components where the DS ships them (header/main/nav/aside/footer equivalents).

## 8. File shape

```
[imports]

[fixtures]

export default function <ScreenName>() {
  return (
    <DSLayoutPrimitive>
      {/* one JSX subtree per plan.sections[*], in order */}
    </DSLayoutPrimitive>
  );
}
```

One file per screen. No nested components unless the plan has a section that is explicitly reusable (rare in v1 — avoid).

## 9. Formatting

- Match the DS repo's Prettier / ESLint style when detectable; otherwise default to 2-space indent, double quotes in TSX strings, trailing commas.
- No emojis in code. No comments beyond what the plan marked as `notes` or TODOs for unresolved slots.

## 10. When in doubt

- Prefer **omitting** a prop over **inventing** one.
- Prefer **a simpler composition** over **a clever one**.
- Prefer **a single known-good variant** over **a speculative custom treatment**.

The goal is "exactly what a lead developer who has used this DS for a year would ship" — not "everything the DS can do".
