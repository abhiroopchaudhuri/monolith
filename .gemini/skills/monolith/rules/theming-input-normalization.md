# Rule 21 — Theming Input Normalization

> **Why this rule exists.** Users bring theming intent in wildly different shapes — sometimes only a DS (use its defaults), sometimes a DS plus a brand color palette, sometimes a CSS file, a Tailwind config, a Figma variables export, a design-tokens.json, or even a PDF brand guide. The skill must absorb any of these, merge them coherently with the DS's own tokens, and emit ONE canonical normalized theme that every downstream agent reads. Without this, weaker LLMs silently drop user intent or invent values.
>
> **Cross-refs.** [guidelines-schema/theme-spec.schema.json](../guidelines-schema/theme-spec.schema.json) is the shape. [rules/ds-themeability-taxonomy.md](ds-themeability-taxonomy.md) governs what the DS can actually accept. [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md) governs what the values must satisfy. [agents/theming-resolver.md](../agents/theming-resolver.md) enforces this rule.

---

## Part 1 — The canonical output

Every run produces exactly one file:

```
<runRoot>/theme-spec.json
```

Schema: [guidelines-schema/theme-spec.schema.json](../guidelines-schema/theme-spec.schema.json).

Three tiers, modeled after a primitives → semantics → bridge architecture, generalized:

1. **primitives** — raw color scales (OKLCH + hex), type scale, space, radii, shadows, motion. No UI meaning.
2. **semantics** — UI roles (`bg`, `fg`, `accent`, `danger`, `border-hairline`, `focus-ring`, …) for light and dark modes, each mapping to primitive refs.
3. **bridge** — adapter-specific form (CSS vars, Tailwind `@theme` block, ThemeProvider object, tokens-json, MUI/Chakra/Spectrum-specific) — whatever the DS actually consumes.

A `themeability` block accompanies the three tiers, declaring the DS's ability to honor each property and any user-facing notifications. A `source` block audits which inputs contributed to which tier. A `constraints` block encodes the non-negotiables from Rule 19.

---

## Part 2 — Accepted input formats

The theming input can arrive as any of:

| Kind | Example | How it's consumed |
|---|---|---|
| `ds-defaults` | No theming input provided | Use the DS's native defaults (shadcn: base color preset; MUI: default palette; custom DS: its default) |
| `palette-json` | `{ "primary": "#0060D6", "danger": "#D62400" }` | Maps to primitives.color.brand + primitives.color.danger and the corresponding semantics |
| `palette-css` | A file exporting CSS vars (`--primary: #0060D6;`) | Parsed; var names mapped to semantic slots by regex + known-pattern lookup |
| `tailwind-config` | `tailwind.config.{ts,js}` with `theme.extend.colors` | Parsed; extends primitives.color.<family> scales |
| `design-tokens-json` | W3C Design Tokens Community Group format (`$value`, `$type`) | Parsed; `color` tokens → primitives.color; `typography` → primitives.type; etc. |
| `figma-variables-export` | JSON export of Figma variables (modes for light/dark) | Parsed; variables with mode → semantics.light / semantics.dark |
| `brand-pdf-extract` | Extracted text/values from a brand guide PDF | Best-effort; surfaces ambiguous values as user-notifications |
| `brand-guide-url` | URL to a brand guidelines page | Fetched + parsed (WebFetch); best-effort |
| `inline` | User types values in the invocation | Parsed from the brief |

Each input is recorded in `theme-spec.json § source.inputs[]` with `kind`, `ref`, and `coverage` (which tiers it contributed to).

**Multiple inputs are merged with a deterministic precedence** (later in the list overrides earlier):

1. DS defaults (always the base)
2. `design-tokens-json` (most canonical)
3. `figma-variables-export` (authoritative for color modes)
4. `tailwind-config` / `palette-json` (product-level)
5. `palette-css` (explicit overrides)
6. `inline` / `brand-pdf-extract` / `brand-guide-url` (highest — user's direct intent)

When overrides conflict (e.g., figma says accent is `#0060D6` but inline says `#D62400`), the higher-precedence value wins and a `source.inputs[].coverage` note is logged.

---

## Part 3 — Normalization mapping

### 3.1 Color inputs → `primitives.color.<family>`

Any color input lands in `primitives.color.<family>.<stop>`. Known families: `stone`/`neutral`, `brand`, `accent`, `success`, `warning`, `danger`, `info`. Unknown families are preserved as-is (e.g., `primitives.color.ivy`).

Each stop is **always** expressed as BOTH OKLCH and hex (computed from the other when only one is provided).

If the input provides fewer than 10 stops, the theming-resolver **generates the remaining stops** using perceptually-uniform OKLCH steps from the seed color — mirroring the approach Linear uses for LCH theme generation.

### 3.2 Semantics generation

Semantics are produced by mapping primitive refs to roles — once per mode (light + dark). Defaults when no explicit semantic input is given:

```
light.bg              = primitives.color.stone.100    (near-white, tinted toward accent hue)
light.fg              = primitives.color.stone.1400   (near-black, tinted toward accent hue)
light.fg-muted        = primitives.color.stone.900
light.accent          = primitives.color.brand.600
light.accent-foreground = primitives.color.stone.100
light.border-hairline = 'oklch(0 0 0 / 0.06)'  (always at low opacity)
light.focus-ring      = primitives.color.brand.500
(dark analogues)
```

These defaults are the canonical starting point. User inputs override specific slots; defaults fill the rest.

### 3.3 Non-color primitives

- `type.scale` — if brand guide provides a type scale, use it; else default to ratio 1.25 with base 14 or 16 depending on `productType`.
- `space` — always the 8px grid `[4, 8, 12, 16, 24, 32, 48, 64, 96]` unless brand explicitly prescribes otherwise.
- `radius` — if DS themeability allows, tier as `{ sm: 4–6, md: 8–10, lg: 12–16 }`. If DS is tier-3/4 (not themeable via props), pin to DS's native defaults and note in `themeability`.
- `shadow` — tier-1 resting, tier-2 hovering, tier-3 floating.
- `motion` — `easeOut` and `easeIn` are constants (Rule 19 §6.1). `durations` adjusts per product type.

### 3.4 Bridge emission

The `bridge.kind` is chosen by the DS adapter:

| DS family | Bridge kind |
|---|---|
| shadcn / Radix / Tailwind-native | `css-vars-plus-tailwind-theme` |
| MUI | `mui-theme` |
| Chakra | `chakra-theme` |
| Mantine | `themeprovider-object` |
| Ant Design | `themeprovider-object` (partial) |
| Adobe Spectrum | `spectrum-theme` (limited) |
| Custom | `ds-specific-adapter` |
| Unknown | `tokens-json-export` (generic) |

The bridge block includes the actual config (e.g., a full Tailwind `@theme { … }` block, a `createTheme({...})` call for MUI) ready to write into the generated app.

### 3.5 CSS-var prefix

When a bridge uses CSS variables, the prefix defaults to `--ds-` (or just unprefixed root vars in shadcn tradition). Never invent a DS-specific prefix unless the DS mandates it.

---

## Part 4 — The constraints block

Every `theme-spec.json` carries a `constraints` block enforced regardless of input. Non-negotiable:

```json
{
  "accentMaxChroma": 0.16,
  "neutralMaxChroma": 0.02,
  "bannedPrimaryHexes": ["#2563eb", "#1d4ed8", "#3b82f6", "#6366f1", "#4f46e5"],
  "tabularNumsMandatory": true,
  "motionEasingMustBeNamed": true
}
```

If a user input (brand palette or inline) specifies a banned primary hex as the accent:

- If the brand genuinely uses that color (explicit `brand-guide-url` / `brand-pdf-extract` citing the hex): register a `themeability.userNotifications` entry at severity `info` — "brand color matches AI-default tailwind blue; the rest of the theme will compensate (tinted neutrals, custom type pairing, tabular figures) per Rule 19."
- If the hex comes from a casual inline "use blue" request: replace with an OKLCH cousin that satisfies Rule 19 (`oklch(0.55 0.14 255)`) and log `source.inputs[<inline>].coverage` with a note.

---

## Part 5 — The userNotifications array

Every run surfaces notifications at G1 when:

- A requested property exceeds the DS's themeability (see Rule 22). E.g., "You asked for 6px radius; Adobe Spectrum does not expose radius as a theme property. Fallback options: (a) fork Spectrum components and modify, (b) wrap with a custom shell, (c) accept Spectrum's native 4px radius."
- Two input sources conflict (figma says one value, inline says another). User arbitrates at G1.
- A brand input is ambiguous (PDF parse gave two candidates).

Format:

```json
{
  "severity": "warn",
  "property": "radius.md",
  "requested": "6px",
  "available": "Spectrum's native 4px; Spectrum does not expose radius as a prop or CSS var",
  "fallback": "fork-component-source"
}
```

Each notification has exactly one of five fallbacks: `accept-ds-default`, `override-via-css-var`, `fork-component-source`, `custom-wrapper`, `skip-theme-for-this-property`.

---

## Part 6 — Zero-input path (no theming given)

When the user provides **only a DS** and **no theming input**, the skill does NOT invent a brand. It:

1. Uses the DS's native default theme as both `primitives` and `semantics`.
2. Still applies the Rule 19 constraints (tabular-nums, named easings, tiered radii, hairline borders) — these are structural and do not require a brand.
3. Writes the `theme-spec.json` with `source.inputs = [{ kind: "ds-defaults" }]` and a `themeability` block per Rule 22.
4. Logs an `info` notification at G1: "no brand input provided; using DS defaults."

This is the **shadcn example the user described**: user provides shadcn, no theme → skill uses shadcn's defaults.

---

## Part 7 — Who reads `theme-spec.json`

| Reader | What they do with it |
|---|---|
| `triage` | Writes initial inputs list. |
| `ds-indexer` | Populates `themeability.perProperty` by inspecting DS source. |
| `guidelines-resolver` | Produces the normalized guidelines alongside; does NOT duplicate color/type/motion (those live here). |
| `theming-resolver` | **Owner.** Merges inputs, computes primitives + semantics, emits bridge + themeability + notifications. |
| `lead-designer` | Reads `primitives.color`, `primitives.type`, `primitives.radius` when citing tokens in `design_decisions.md § Token applications`. |
| `aesthetic-director` | Reads the full spec to audit compliance with Rule 19 (primary accent chroma, neutral tint, type pairing, motion timings). Uses `themeability.perProperty` to know which deviations are fallback-required vs. willful. |
| `developer` | Reads `bridge` to emit the actual theme config in the generated app (Tailwind @theme, MUI createTheme, etc.). Reads `primitives` for any one-off value needed beyond the bridge. |
| `design-qa` | Verifies runtime values match the spec (accent OKLCH, radius tier, shadow tier, motion timings). |
| `dev-qa` | `ANTI_GENERIC` gate cross-references `constraints.bannedPrimaryHexes`. |

---

## Part 8 — Enforcement

- **`theme-spec.json` is mandatory.** No run proceeds past the discovery phase without it. If theming-resolver fails, the run blocks at G1.
- **Every token reference in `design_decisions.md` cites either a primitives path (`primitives.color.brand.600`) or a semantic role (`semantics.light.accent`).** Raw hex in design decisions = failure.
- **Developer's generated theme config is byte-equivalent to `bridge`.** design-qa greps the generated app's theme file and compares.
- **Rule 19 constraints are audited against `theme-spec.json`**, not against scattered design decisions. Single source of truth.

---

## Part 9 — What this rule does NOT cover

- The DS's component-level knowledge (that's `component-index.json`).
- Voice, tone, copy conventions (that's `brand.md` + Rule 18 copy-excellence).
- Motion micro-rules specific to components (that's Rule 19 § 6).
- How to pick among multiple brand candidates when the user gives contradictory inputs (that's a G1 arbitration; we surface, we don't silently choose).

## Related

- [guidelines-schema/theme-spec.schema.json](../guidelines-schema/theme-spec.schema.json)
- [rules/ds-themeability-taxonomy.md](ds-themeability-taxonomy.md)
- [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md)
- [rules/ai-generic-anti-patterns.md](ai-generic-anti-patterns.md)
- [agents/theming-resolver.md](../agents/theming-resolver.md)
- [references/ds-themeability-registry.md](../references/ds-themeability-registry.md)
