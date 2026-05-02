# Token Usage Rules

How the generator accesses design tokens from a DS. One rule per access style declared by the adapter's `themeAccess.style`.

---

## 1. `theme-object`

DS exposes tokens through a `useToken()` / `useTheme()` hook or a `<Provider theme={...}>` wrapper.

**Rule:** Use the hook inside the component. Reference tokens by their DS-declared name (what's in the seed / theme object), not by our normalized path. Our `tokens.json` is for planning; at generation time the source names matter.

Shape (pseudocode — the adapter supplies real names):
```tsx
import { <useTokenHook> } from "<ds-import-path>";

function Screen() {
  const { token } = <useTokenHook>();
  return <div style={{ color: token.<colorPrimaryName>, padding: token.<paddingLgName> }}>…</div>;
}
```

**Never** hardcode the hex/px. The validator flags raw hex values.

---

## 2. `css-vars`

DS ships CSS custom properties (e.g. `--<prefix>-color-brand-primary`).

**Rule:** Reference tokens via `var(--name)` inside `style` attributes or in class-based styling. Names come straight from the `tokens.json` `raw` keys, prefixed per the adapter.

```tsx
<div style={{ color: "var(--<prefix>-color-brand-primary)" }}>…</div>
```

---

## 3. `classnames`

Tokens are surfaced as utility classes (e.g. `bg-primary`, `text-muted-foreground`) and the DS does not expose a theme object.

**Rule:** Use the DS's class utilities. `tokens.json` maps the underlying values; generation composes classes. Do not inline `style={{ color: "…" }}` unless the DS docs explicitly call for it.

---

## 4. `tailwind`

If the adapter's `themeAccess.style = "tailwind"`, treat the Tailwind preset shipped with the DS as authoritative. Use class utilities; never hardcode values that have a Tailwind utility equivalent.

---

## Cross-cutting rules

- **One token source per file.** Don't mix hook access (`token.<name>`) with CSS var access (`var(--<name>)`) in the same generated screen.
- **Never alias tokens locally.** No `const BRAND = token.<name>` hoisted outside the component. It obscures drift.
- **Prefer semantic tokens over primitives.** Semantic roles (e.g. "text", "bg-surface", "padding-lg") beat primitive scale names (e.g. "gray-900", "space-3"). Primitives are escape hatches, not defaults.
- **Dark mode** is governed by `plan.theme`. The generator does not branch on it at runtime; the screen renders against whatever theme the DS provider wraps it in.
- **Typography** follows the same access style. If the DS has a `Typography` / `Text` / `Heading` component, use it instead of styling a raw `<h1>–<h6>`.
