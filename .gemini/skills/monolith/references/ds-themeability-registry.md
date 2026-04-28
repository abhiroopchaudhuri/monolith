# DS Themeability Registry

> **Purpose.** A growing roster of known design systems with their tier classifications and per-property verdicts. `theming-resolver` consults this first; if a DS isn't listed, it classifies via the decision tree in [rules/ds-themeability-taxonomy.md § Part 3](../rules/ds-themeability-taxonomy.md) and appends the result here for future runs.
>
> **Append-only.** Rows are added across runs, never deleted. Corrections edit in place with a note. This file is cross-run memory — it lives in the workflow folder so any run benefits.

---

## Format

Each row:

```
## <DS Name> — Tier <N>

**Adapter kind:** <css-vars-plus-tailwind-theme | mui-theme | chakra-theme | themeprovider-object | tokens-json-export | ds-specific-adapter>
**Discovered:** <YYYY-MM-DD> in run <runId>
**Verified:** <YYYY-MM-DD> (if re-audited)

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | <verdict> | <how> |
| neutralScale | <verdict> | <how> |
| radius | <verdict> | <how> |
| typography | <verdict> | <how> |
| spacing | <verdict> | <how> |
| shadow | <verdict> | <how> |
| motion | <verdict> | <how> |
| darkMode | <verdict> | <how> |

### Notes
<caveats, common gotchas, known quirks>

### Fallback recipes (tier 3/4 only)
<what to fork, how to wrap>
```

---

## shadcn/ui — Tier 1

**Adapter kind:** `css-vars-plus-tailwind-theme`
**Discovered:** seed

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | themeable-via-css-var | `:root { --primary: oklch(…); }` + `.dark { --primary: …; }` |
| neutralScale | themeable-via-css-var | `--background`, `--foreground`, `--muted`, `--border`, … |
| radius | themeable-via-css-var | `--radius: 0.5rem;` — cascades into `--radius-sm/md/lg/xl` |
| typography | themeable-via-token | `tailwind.config.ts → theme.fontFamily` + `@theme { --font-sans: … }` |
| spacing | themeable-via-token | Tailwind spacing scale is the source; override via `@theme { --spacing: … }` |
| shadow | themeable-via-css-var | `--shadow-sm/md/lg/xl` or Tailwind `@theme { --shadow-* }` |
| motion | themeable-via-css-var | Not first-class; set `--ease-out` + component classes reference it |
| darkMode | themeable-via-token | `.dark` class + `prefers-color-scheme` — first-class |

### Notes
- shadcn is the canonical tier-1 DS. Almost any theme can be expressed via the `@theme` block + `:root` + `.dark`. Zero component forks needed.
- Default accent is OKLCH-based; no banned Rule 19 hexes in stock.

---

## Radix UI primitives (unstyled) — Tier 1

**Adapter kind:** `css-vars-plus-tailwind-theme` (when used with Tailwind) or `tokens-json-export`
**Discovered:** seed

### Per-property verdict
Same as shadcn; Radix ships unstyled, so theming is entirely consumer-side. Tier 1 by construction.

### Notes
- Radix is often wrapped by shadcn. If the DS is "Radix via shadcn," treat as shadcn.
- Radix Colors (the separate @radix-ui/colors package) gives OKLCH-aware scales and is the recommended starting point.

---

## MUI (Material UI) — Tier 2

**Adapter kind:** `mui-theme`
**Discovered:** seed

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | themeable-via-prop | `createTheme({ palette: { primary: { main: "oklch(…)" } } })` |
| neutralScale | themeable-via-prop | `palette.grey[*]` |
| radius | themeable-via-prop | `shape: { borderRadius: 6 }` — applies globally; per-component overrides via `components.MuiButton.styleOverrides` |
| typography | themeable-via-prop | `typography: { fontFamily: "...", h1: {...}, body1: {...} }` |
| spacing | themeable-via-prop | `spacing: 8` (scalar) or `spacing: (factor) => ...` |
| shadow | themeable-via-prop | `shadows: [...]` (25-element array required) |
| motion | themeable-via-fork | MUI's transitions are theme-linked (`theme.transitions`) but many components bake CSS; custom wrappers common |
| darkMode | themeable-via-prop | `palette: { mode: 'dark' }` + `ThemeProvider` swap |

### Notes
- MUI is a tier-2 ceiling: nearly everything themeable via `createTheme`, but motion and some deep component internals require `styleOverrides` or wrappers.
- When producing `bridge.themeProviderObject`, emit the full `createTheme({...})` object; the developer wraps the app in `<ThemeProvider theme={...}>`.

### Caveats
- Default MUI blue (`#1976d2`) is close to banned Rule 19 hexes; flag as info notification unless brand overrides.
- MUI v5+ supports CSS Vars mode (`experimental_extendTheme`) which moves toward tier 1 — check version.

---

## Chakra UI — Tier 2

**Adapter kind:** `chakra-theme`
**Discovered:** seed

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | themeable-via-prop | `extendTheme({ colors: { brand: { 500: "..." } } })` + semantic token `colors: { primary: "brand.500" }` |
| neutralScale | themeable-via-prop | `colors.gray.*` |
| radius | themeable-via-prop | `radii: { sm, md, lg }` |
| typography | themeable-via-prop | `fonts`, `fontSizes`, `fontWeights`, `lineHeights` |
| spacing | themeable-via-prop | `space: { 0, 1, 2, ... }` |
| shadow | themeable-via-prop | `shadows: { outline, ... }` |
| motion | themeable-via-fork | Similar to MUI; `transition` tokens exist but components bake some CSS |
| darkMode | themeable-via-prop | `useColorMode`, `semanticTokens` with `_dark` modifier |

### Notes
- Chakra's semantic tokens are first-class — cleaner than MUI for semantic layer.

---

## Mantine — Tier 2

**Adapter kind:** `themeprovider-object`
**Discovered:** seed

### Per-property verdict
Similar to Chakra. `MantineProvider theme={{...}}` exposes primaryColor, radius, fontFamily, headings, spacing, shadows.

---

## Ant Design (v5+) — Tier 2/3 (partial)

**Adapter kind:** `themeprovider-object`
**Discovered:** seed

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | themeable-via-prop | `ConfigProvider theme={{ token: { colorPrimary: "..." } }}` |
| neutralScale | themeable-via-prop | `token.colorBgContainer`, `colorBorder`, etc. |
| radius | themeable-via-prop | `token.borderRadius` — partial; some components ignore |
| typography | themeable-via-prop | `token.fontFamily`, `fontSize` |
| spacing | themeable-via-fork | Many components bake spacing; requires component-level `styles` API or wrappers |
| shadow | themeable-via-prop | `token.boxShadow*` |
| motion | themeable-via-fork | Many transitions baked |
| darkMode | themeable-via-prop | `algorithm: theme.darkAlgorithm` |

### Notes
- v4 is effectively tier 3. v5 is partial tier 2.
- Antd's signature blue (`#1677ff`) is near the banned Rule 19 band; flag as info unless brand override.

---

## Adobe Spectrum — Tier 3

**Adapter kind:** `spectrum-theme` (limited) + component forks
**Discovered:** seed

### Per-property verdict

| Property | Verdict | Mechanism |
|---|---|---|
| accentColor | themeable-via-prop | `Provider colorScheme + theme` — limited palette options |
| neutralScale | not-themeable | Spectrum neutrals are part of the Spectrum design language |
| radius | themeable-via-fork | Component source fork; Spectrum components use fixed radii |
| typography | themeable-via-prop | Limited — Adobe Clean is the default; custom families require provider-level override or fork |
| spacing | not-themeable | Spectrum dimension tokens are fixed |
| shadow | not-themeable | Spectrum elevation is fixed |
| motion | themeable-via-fork | Component source fork to change transition CSS |
| darkMode | themeable-via-prop | `Provider colorScheme="dark"` |

### Fallback recipes (tier 3)

- **Radius override**: Copy the affected Spectrum component source into `<appRoot>/src/components/forked/` and override `border-radius` in its stylesheet. Log the fork in `ds-extensions/<slug>.md` per Rule 0.
- **Custom accent outside Spectrum's palette**: Wrap Spectrum primitives with a custom `ThemedShell` that applies the accent as CSS var on an outer container; Spectrum primitive inside retains its own palette.

### Notes
- Adobe Spectrum is the canonical tier-3 reference DS. Expect `userNotifications` at G1 on any custom theming beyond accent and darkMode.

---

## Fluent UI (Microsoft) — Tier 3

**Adapter kind:** `themeprovider-object` (partial)
**Discovered:** seed

### Per-property verdict
Similar to Spectrum — opinionated aesthetic, partial theming. `FluentProvider theme={{...}}` exposes some tokens; most structural decisions baked.

---

## Bootstrap — Tier 2 (via SCSS override) / Tier 3 (via compiled CSS)

**Adapter kind:** `tokens-json-export`
**Discovered:** seed

### Per-property verdict
If compiling from source: tier 2 — `$primary`, `$border-radius`, `$font-family-base` Sass variables. If using compiled CSS: tier 3 — CSS vars exist (`--bs-primary`) but many properties baked.

---

## Generic "user-supplied custom DS" — classify per run

**Adapter kind:** determined at runtime.

When the user supplies a repo that isn't in this registry, theming-resolver classifies via the 6-step decision tree ([ds-themeability-taxonomy.md § Part 3](../rules/ds-themeability-taxonomy.md)). The result is appended to this file after the run.

---

## Adding a new DS to the registry

When a run encounters an unlisted DS:

1. Classify per the decision tree.
2. Append a new `## <DS Name> — Tier <N>` section here with `Discovered: <date>` and `runId`.
3. Fill per-property verdicts.
4. Add any notes and fallback recipes.
5. The orchestrator commits this change at the end of the run alongside pattern memory updates.

The registry's value compounds: a DS classified in run #1 is zero-cost in run #17.
