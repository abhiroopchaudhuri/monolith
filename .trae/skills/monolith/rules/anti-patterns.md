# Anti-Patterns Catalog

A scannable lookup table. **If you're tempted to write the left column, write the right column instead.** This is the operational complement to [ds-first-mandate.md](ds-first-mandate.md).

This file has TWO sections:
- **Universal** — applies to ANY DS. Never delete or weaken these.
- **DS-specific** — adapter-contributed tables live under `../shared/ds-adapters/<name>/anti-patterns.md`. This file never hardcodes a specific DS.

---

## Universal anti-patterns

| Anti-pattern (custom) | DS-correct equivalent | Why the custom is wrong |
|---|---|---|
| `<button onClick={...} className="my-btn">` | DS `Button` component | Loses hover/focus/active states, a11y, keyboard nav, theme conformance |
| `<input>` wrapped in `<div>` with focus-ring CSS | DS `Input` (with `prefix` / `suffix` if needed) | DS Input handles focus ring via color tokens |
| `style={{ boxShadow: '0 1px 3px ...' }}` literal | DS shadow token (CSS var, theme object, or className — per adapter) | Theme migration breaks; literal doesn't track DS shadow scale |
| `style={{ borderRadius: 8 }}` literal | DS radius token | Same reason |
| `style={{ color: '#dc2626' }}` for error/danger | DS `Text`/`Typography` with a semantic intent prop, or DS error color token | Hardcoded color; doesn't adapt to dark mode / theme |
| Custom CSS class for "pill / tag / chip" | DS `Tag` / `Chip` / `Badge` (whichever the adapter indexes) | DS components have variants, sizes, colors built-in |
| `onMouseEnter` / `onMouseLeave` to fake hover | Use a DS component that has a hover state | Native DS hover follows token system; custom doesn't |
| Custom keyframe `@keyframes pulse` | DS's own animated / processing / loading component | DS animations are tokenized for duration / easing |
| Custom `<div>` styled like a card | DS `Card` (or equivalent) | Card has elevation tiers, slots, hover prop |
| `<div role="dialog">` styled as modal | DS `Modal` / `Dialog` / `Sheet` | Trap focus, ESC-to-close, scroll-lock all built-in |
| Colored `<div>` bars for "stages" | DS `Steps` / `Stepper` / `Progress` | Status states, current pointer, descriptions built-in |
| Custom empty-state SVG + text | DS `Empty` / `EmptyState` / `Placeholder` | Standard placeholder image, descriptive text slot |
| Custom horizontal nav tabs | DS `Menu` / `Tabs` / `SegmentedControl` | Active indicator, hover, keyboard, a11y built-in |
| Custom dark sidebar with hover handlers | DS sidebar/menu component + dark theme tokens via the adapter's provider | All dark states are token-driven |
| `style={{ textDecoration: 'line-through' }}` | DS Text/Typography with a `delete` / `strikethrough` intent | DS renders semantic `<del>`; styling alone isn't semantic |
| `<div>` with custom background for status / alert | DS `Alert` / `Message` / `Banner` / `Toast` | Comes with icon, severity color, dismissible affordance |
| Custom dropdown / kebab menu | DS `Menu` / `Dropdown` / `Popover` | Includes positioning, click-outside, focus trap, keyboard |
| Manual avatar overlap with negative margin | DS `AvatarGroup` / `Avatar.Group` | Built-in overflow `+N`, sizing, border |
| Custom progress `<div>` with width transitions | DS `Progress` / `ProgressBar` / `ProgressRing` | Built-in, token-driven |
| Manual `<input type="file">` with preview | DS `FileUploader` / `Dropzone` / `Upload` | Preview list, error handling, validation |
| Hand-rolled multi-select with `<select multiple>` | DS `MultiSelect` / `ChoiceList` / `Combobox` | Search, virtualization, keyboard nav |
| Custom date picker with `<input type="date">` | DS `DatePicker` / `DateRangePicker` | Locale, range, presets, keyboard |
| Custom segmented toggle button group | DS `SegmentedControl` / `Tabs` / `Radio.Group` | Built-in |
| Manual page-title row with breadcrumbs + actions | DS `PageHeader` / `Header` / `Toolbar` composite | Composite for the entire page-title row |

---

## Research anti-patterns (research.md)

| Anti-pattern | Correct approach |
|---|---|
| "Studies show…" with no citation | Drop the claim OR cite a real source |
| "Industry best practices say…" | Name the practice; cite who says so |
| Invented personas (1:1 restatements of the brief) | Add signal — context, constraints, frequency |
| Fabricated statistics in any section | Remove; mark `inferred` if load-bearing |
| Demographics not load-bearing to the product | Omit |

---

## PM anti-patterns (prd.md)

| Anti-pattern | Correct approach |
|---|---|
| MVP padded with "nice-to-haves" | Every MVP item ties to a JTBD; else move to `later` |
| Solution-shaped problem statement | Rewrite user-centric (the pain, not the fix) |
| Immeasurable success metrics | Name the instrument + threshold |
| Acceptance criteria as restated user stories | Concrete, testable bullets (Given/When/Then when helpful) |
| Open questions that hide assumptions | Surface at G2; do not embed as settled |

---

## DS-specific anti-patterns (contributed by adapter)

The skill is DS-agnostic. DS-specific anti-patterns live next to the adapter, not here. Pattern:

```
../shared/ds-adapters/
  <ds-name>.json                        ← adapter
  <ds-name>/
    anti-patterns.md                    ← DS-specific table
```

The `DS_FIRST` validator gate loads both this file AND the per-adapter anti-patterns file for the current run's DS. A violation may match either source.

### What belongs in a per-adapter anti-patterns file

Rows that ONLY apply to one DS. Examples of kinds of rows (generic shapes, not real DS names):

- "DS X uses `<PropA>` where other DSs use `<PropB>` — flag the wrong one."
- "DS X's `Card` has zero default padding, requires a nested `<CardBody>` — flag custom padding."
- "DS X exposes tokens as CSS vars at `--<ds>-<name>` — flag any hex that has a token equivalent."
- "DS X ships a specific named animation — flag custom keyframes for the same behavior."

### Format per adapter file

Use the same three-column shape (anti-pattern | DS-correct | reference) so the validator can parse it uniformly. The `reference` column points at DS docs, source files, or component-index paths — whatever the adapter makes inspectable.

---

## How the validator uses this catalog

The `DS_FIRST` validator gate (see [../agents/dev-qa.md](../agents/dev-qa.md)) scans generated code for the left-column patterns and reports each occurrence with a pointer to the right-column replacement from this catalog (or the adapter's file).

Each finding requires either:
1. The fix (replace with the DS component), or
2. A justification comment on the line above: `// ds-first-allowed: <one-line reason>` — accepted only when the three-test proof from [ds-first-mandate.md](ds-first-mandate.md) is documented in design_decisions.md's DS-First audit for that section.

No silent overrides. No "the DS doesn't quite have what I want so I rolled my own." Either there's a reason, or the code is wrong.

---

## Adding to this catalog

When a new violation pattern is caught in the wild:

1. Add a row to the **universal** table if it generalizes across DSs.
2. Add a row to the **per-adapter** file (`../shared/ds-adapters/<name>/anti-patterns.md`) if it's DS-bound.
3. Reference the DS API source (file path, doc URL, or component-index path) for the right-column equivalent so the next agent can verify.
4. If the violation appears in multiple sections of generated output, also add a regex pattern to the validator script so future runs catch it.

This catalog is a living artifact. Keep it dense and concrete — no philosophy here, only "tempted to write X → write Y instead."
