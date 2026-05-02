# Rule 22 — DS Themeability Taxonomy

> **Why this rule exists.** Not every design system supports every kind of theming. shadcn lets you change corner radius, color, spacing, and almost anything via CSS vars. Adobe Spectrum doesn't — its primitives don't expose radius or spacing as props or theme values. If the skill assumes "all DSs are themeable the same way," a user who says "use Spectrum with 12px radius and a custom blue" gets silent failure or a hallucinated implementation. This rule classifies every DS into a **tier** with explicit fallback paths, and produces a user-facing notification at G1 when the requested theme exceeds the DS's actual capacity.
>
> **Cross-refs.** [rules/theming-input-normalization.md](theming-input-normalization.md) defines the canonical theme shape that's being applied. [agents/theming-resolver.md](../agents/theming-resolver.md) classifies + reports. [references/ds-themeability-registry.md](../references/ds-themeability-registry.md) is the growing roster of known DSs with their tiers and recipes.

---

## Part 1 — The four tiers

### Tier 1 — Full themeability

The DS exposes every relevant theme property (color, radius, typography, spacing, shadow, motion, dark-mode) via **tokens, CSS variables, theme props, or equivalent first-class mechanisms**. Changing the theme never requires editing component source.

Examples: **shadcn/ui**, **Radix primitives (unstyled)**, **Tailwind-native custom DS**, **Geist (Vercel)**.

Fallback path: **none needed.** Apply the theme via `bridge.kind = css-vars-plus-tailwind-theme` (or `ds-specific-adapter`). Produce the full `@theme { … }` block and/or `:root { … }` CSS-var block. Write to the generated app's global CSS entry.

User notifications: **zero** unless a user input conflicts with Rule 19 constraints.

### Tier 2 — CSS-var OR ThemeProvider, but not full prop-level themability

The DS supports global theming — one color palette, one type ramp — via CSS variables or a ThemeProvider object. It does **not** expose every property per-component; some (commonly spacing scale, radius scale, or motion) are hard-coded and require a fork or wrapper to change.

Examples: **MUI (Material UI)** (ThemeProvider + some CSS-vars; radius and spacing partially themeable), **Chakra UI** (ThemeProvider; radius and spacing tokens exposed; some components hard-code values), **Mantine** (ThemeProvider; theme-aware but some components bake spacing), **NextUI** (partial).

Fallback path per property:

- **Color** — themeable via ThemeProvider or CSS vars. Apply from `bridge.themeProviderObject` or `bridge.cssVarPrefix`.
- **Radius** — themeable via theme tokens (MUI `shape.borderRadius`, Chakra `radii`). Map from `primitives.radius`.
- **Typography** — themeable via `typography.fontFamily`, `typography.fontSize` scales.
- **Spacing** — usually themeable but component-baked offsets sometimes require wrapper overrides.
- **Motion** — rarely themeable; usually CSS-default-linked. May require component wrappers with custom `transition` CSS.
- **Dark mode** — themeable via ThemeProvider's `palette.mode: 'dark'` or equivalent.

User notifications at G1: **info-level only** when a specific property (commonly motion) requires a wrapper.

### Tier 3 — Forked themeability

The DS's primitives are **opinionated and not individually themeable**. The DS ships a single fixed aesthetic. Changing color, radius, typography etc. **requires copying the component source and modifying it locally** (a fork in the generated app, not upstream).

Examples: **Adobe Spectrum** (closed aesthetic; limited `theme="light" | "dark"` + a few token overrides but most structural decisions baked), **Ant Design** (partial — limited ConfigProvider theming in v5+ but many components are still opinionated), **Fluent UI** (opinionated), **older enterprise DSs**.

Fallback path per property:

- The skill emits a `themeability.userNotifications` entry at severity **warn** with `fallback: fork-component-source` listing exactly which DS components must be forked to honor the requested theme.
- If user accepts the fork: developer copies the DS component source into `<appRoot>/src/components/forked/<Component>.tsx`, applies the theme values there, and the generated app imports from the forked version for that primitive only. **This is a Rule 0 exception logged in `ds-extensions/`.**
- If user declines the fork: the property in question accepts the DS's default value and `source.inputs[].coverage` drops that property.

User notifications at G1: **warn-level** with explicit options.

### Tier 4 — Not themeable without a custom wrap

The DS's primitives are effectively immutable from outside (no tokens, no CSS vars, no ThemeProvider, no public API for styling). Rare but real for some internal enterprise DSs.

Fallback path: **custom wrapper**. The developer produces a wrapper component that composes the DS primitive inside a styled shell. Styling that can be overridden (margin, layout, container color) lives on the wrapper; the DS primitive retains its own appearance inside.

User notifications at G1: **warn-level with blocker escalation** if the requested theme cannot be applied via a wrapper alone.

---

## Part 2 — The per-property verdict

Every `theme-spec.json` carries `themeability.perProperty` with one entry per property, each:

```json
{
  "verdict": "themeable-via-token | themeable-via-prop | themeable-via-css-var | themeable-via-fork | not-themeable",
  "mechanism": "<concrete how>",
  "notes": "<optional caveats>"
}
```

Example for shadcn (tier 1):

```json
{
  "accentColor":  { "verdict": "themeable-via-css-var", "mechanism": ":root { --primary: oklch(0.55 0.14 255); }" },
  "radius":       { "verdict": "themeable-via-css-var", "mechanism": ":root { --radius: 6px; }" },
  "typography":   { "verdict": "themeable-via-token",   "mechanism": "tailwind.config.ts → theme.fontFamily" },
  "spacing":      { "verdict": "themeable-via-token",   "mechanism": "tailwind.config.ts → theme.spacing" },
  "shadow":       { "verdict": "themeable-via-css-var", "mechanism": ":root { --shadow-*: ... }" },
  "motion":       { "verdict": "themeable-via-css-var", "mechanism": ":root { --ease-out: cubic-bezier(...) }" },
  "darkMode":     { "verdict": "themeable-via-token",   "mechanism": ".dark { --primary: ...; }" }
}
```

Example for Adobe Spectrum (tier 3):

```json
{
  "accentColor":  { "verdict": "themeable-via-prop",   "mechanism": "Provider theme + colorScheme; limited palette" },
  "radius":       { "verdict": "themeable-via-fork",   "mechanism": "copy Button.tsx; override border-radius literal", "notes": "Spectrum ships fixed radii per component" },
  "typography":   { "verdict": "themeable-via-prop",   "mechanism": "Provider typographyStyles (limited families)" },
  "spacing":      { "verdict": "not-themeable",        "mechanism": "—", "notes": "Spectrum uses fixed dimension tokens tied to its design language" },
  "shadow":       { "verdict": "not-themeable",        "mechanism": "—" },
  "motion":       { "verdict": "themeable-via-fork",   "mechanism": "copy component source; override transition CSS" },
  "darkMode":     { "verdict": "themeable-via-prop",   "mechanism": "Provider colorScheme='dark'" }
}
```

---

## Part 3 — Classification procedure (how `theming-resolver` decides)

For a given DS:

1. **Look up the registry.** Check [references/ds-themeability-registry.md](../references/ds-themeability-registry.md) for a known tier + per-property map. If present, use that as the starting point; confirm with spot checks against `component-index.json`.
2. **Inspect `component-index.json`.** Does any primitive's props schema include `color` / `radius` / `size` that accepts token-like values? Tier 1 or 2 signal.
3. **Inspect DS source (if repo available).** Grep for CSS variables (`--primary`, `--radius`, etc.) or ThemeProvider exports. Presence → tier 1 or 2.
4. **Inspect DS tokens file if exposed.** design-tokens.json, theme.json, tokens.css — tier 1 or 2.
5. **Check for Provider / ThemeProvider export.** tier 2.
6. **Check for docs signals.** If DS docs say "theming not supported" or "forking required" → tier 3 or 4.
7. **If none of the above resolves:** default to **tier 3** with a warn-level notification asking the user to confirm or provide DS docs.

Each decision is recorded in `themeability.perProperty[].mechanism` with the actual file/line cited.

---

## Part 4 — The user-notification contract at G1

The orchestrator surfaces all `themeability.userNotifications` entries at **G1** (input approval), not later. This is because any fallback the user chooses (fork / wrapper / accept-default) shapes the entire downstream run. G1 shows:

```
Theme readiness:
  DS:                <name> — Tier <N> (<full | css-var-only | forked | custom-wrap>)
  Properties themeable as requested: <N>/<M>
  Properties requiring fallback:     <M - N>

Requires your decision:
  • radius.md = 6px — Spectrum does not expose radius. Options:
      (a) fork Button/Card/Modal (adds 3 forked components to generated app)
      (b) accept Spectrum native 4px (theme-spec.json drops radius.md override)
      (c) abort run
    Your choice? (a/b/c)
  • motion.ease-out = cubic-bezier(…) — MUI does not theme motion. Options:
      (a) wrap primitives with custom transition CSS
      (b) accept MUI's default motion
      (c) abort run
    Your choice? (a/b/c)
```

The user's choices are persisted in `theme-spec.json § themeability.userNotifications[].resolution` (extension field) and flow into the build.

---

## Part 5 — Enforcement and violations

- **If theming-resolver produces no `themeability` block**, the run blocks. No proceed-past-G1.
- **If the `theme-spec.json § constraints` are violated by any `themeability.perProperty.mechanism`**, the run blocks and the conflict is surfaced.
- **If developer emits theme code that contradicts `bridge`**, design-qa flags it as a major issue.
- **If a DS is misclassified** (turns out a tier-3-declared DS is actually tier-2 because we missed a theme export), the registry is updated and the run may re-resolve (at G2 or by user request).

---

## Part 6 — The "I just want defaults" path

If the user provides only a DS and no theming input, and the DS is tier 1 or 2:

- Skill uses DS defaults. `themeability.userNotifications = []` (no decisions required at G1).
- Rule 19 constraints still apply to whatever the DS exposes (tabular-nums, named easings, tiered radii, hairline borders). If the DS's defaults violate Rule 19 (e.g., ships with Tailwind `blue-600` as the default accent), the notification is at severity `info`: "DS default accent is a banned primary under Rule 19 §2.1; recommend override."

If the DS is tier 3 or 4:

- Skill uses DS defaults AND logs an `info` notification that Rule 19 premium-aesthetic enforcement is limited by the DS.
- `aesthetic-director` takes this into account and grades accordingly — the run is not failed for a DS-level constraint, but the verdict may be `At-threshold` rather than `Premium`.

---

## Related

- [rules/theming-input-normalization.md](theming-input-normalization.md) — Rule 21.
- [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md) — Rule 19.
- [rules/ds-first-mandate.md](ds-first-mandate.md) — Rule 0. Forks under tier 3 are Rule 0 exceptions logged in ds-extensions/.
- [rules/ds-extension-criteria.md](ds-extension-criteria.md) — when a fork becomes necessary under tier 3, it goes through the five-test gate.
- [agents/theming-resolver.md](../agents/theming-resolver.md) — owner.
- [references/ds-themeability-registry.md](../references/ds-themeability-registry.md) — known DSs.
