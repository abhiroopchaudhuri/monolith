# Planning Rules

Rules for the `planner` subagent when turning a brief into `screen-plan.json`. Output must validate against [../../shared/types/screen-plan.schema.json](../../shared/types/screen-plan.schema.json).

The plan is cheap to regenerate; the generated code is not. This file exists so planning mistakes get caught before any `.tsx` is written.

## 1. Source of truth

The **component-index.json** (at `.cache/ds-index/<ds>@<version>/component-index.json`) is the only source of truth for what components exist, what props they accept, and what variants they expose.

- If a component you want is not in the index → the plan cannot reference it. Either pick a different component or mark the section `blocked` in `section.blockers`.
- If a prop you want is not on the component's `props[]` → don't propose it. Omit, or pick a component that exposes it.
- If a variant value is not in the component's `variants[*].values` → don't propose it.

This is non-negotiable. The generator enforces the same rule; planning around it just moves the failure upstream.

## 2. Section decomposition

- Decompose the brief into sections in **DOM order**. Each section is one `section.role`.
- Prefer fewer, semantically-clear sections over many micro-sections. A dashboard is `[header, metric-strip, activity-list, bottom-nav]`, not twenty fields.
- Each section must have:
  - `id` — stable slug, unique within the plan. Phase 2 will reuse this.
  - `role` — open-ended but conventional (hero, metric-strip, item-list, bottom-nav, form, table, empty-state, toolbar, settings-row, …). Pick the one that best describes the section's *job*.
  - `proposedComponents[]` — ordered. The first entry is the primary; subsequent entries are children the section composes (e.g. for a metric strip: `[LayoutRow, Card, Statistic-or-equivalent]`).
  - `copy` — real, on-brand text keyed by slot. No lorem, no placeholders.

## 3. Variant selection

For each `proposedComponent`:
- Pick the variant that matches the section's *intent*, not the component's default.
- Intent comes from the brief's tone + the section's role. "Danger zone" → `danger/destructive` variant. "Primary CTA" → `primary`. "Secondary action" → default/secondary. "Informational" → `info` / neutral.
- If two variants both plausibly match, record both in a `notes` string and pick the higher-confidence one. The generator will then emit with that variant; the user can change it in the plan before approval.

## 4. Copy

- Write copy a product designer would ship. Short. Sentence case unless the DS convention is different. Imperative for CTAs ("Save changes", not "Save Changes Now!").
- No "Lorem ipsum". No `title1 / title2`. No generic names like "John Doe" unless the brief explicitly asks for anonymization.
- Numbers should be realistic: `1,284 <units>` not `42`. Currency + locale if the brief implies one.
- Dates should be absolute (`Apr 18, 2026`) unless the brief is relative ("yesterday's visits").

## 5. Data shape

Each section that consumes data gets a `dataShape` (TS-like) AND a `dataRef` pointing to a fixture key at `fixtures.<key>`. Fixtures live at the plan's top level so multiple sections can share a list.

- Fixtures must be seeded. The planner writes a fixed array of realistic entries; the generator reuses these verbatim. No runtime faker.

## 6. Accessibility

Every plan must set `a11y.landmarks` for the screen (typically `["banner", "main", "navigation", "contentinfo"]`). If the brief is a form, include `a11y.focusOrder` listing the section IDs in tab order.

## 7. Fail loud

If the brief asks for something the DS does not support (e.g. a "stepper" in a DS that has no stepper), add the section to the plan with `blockers: ["no-stepper-in-ds"]` and a short note explaining the gap. **Do not silently substitute.** The user decides whether to pick an alternate or add the section to a wishlist.

## 8. Keep plan small

Target: ≤15 sections for a single screen. Deeper structure belongs inside a section's children, not as top-level entries. If a brief produces >20 sections, the brief is actually multiple screens — ask the user.
