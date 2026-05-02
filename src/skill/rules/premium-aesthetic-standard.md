# Rule 19 — Premium Aesthetic Standard

> **Who this rule exists for.** Every LLM, especially weaker ones (Haiku-class, GPT‑3.5-class), defaults to a recognizable aesthetic: `rounded-2xl` cards, Tailwind `blue-600` buttons, centered red-circle-X error states, `bg-gray-50` everywhere, Inter at every weight, `shadow-md` on every card, emoji-as-icon inside pastel circles, symmetric viewport-centered layouts. This is the **AI-generic look** and it reads as cheap within seconds. This rule exists to force every run — at any model tier — to output work that looks like a product a design team shipped on purpose.

This rule is **not** about taste. It is a set of **prescriptive, checkable constraints** with exact numerical ranges, named techniques, and DO/DON'T comparisons. Follow the numbers. When in doubt, follow the numbers.

Related: [rules/ai-generic-anti-patterns.md](ai-generic-anti-patterns.md) (the blacklist you self-audit against), [rules/ui-excellence-standard.md](ui-excellence-standard.md) (behavior dimensions you were already graded on), [references/premium-design-playbook.md](../references/premium-design-playbook.md) (deep knowledge), [references/anti-generic-examples.md](../references/anti-generic-examples.md) (concrete DO/DON'T code).

---

## Part 1 — The 1-1-1 Discipline (non-negotiable)

Premium interfaces obey this across every screen in the same product:

- **1 type family.** (Plus at most 1 mono for data and 1 serif display for editorial moments. Never 3 sans-serifs.)
- **1 accent color.** Used on less than 5% of visible surface area per viewport.
- **1 radius scale** derived from a base unit. Never mix `rounded-lg` on a card with `rounded-full` on a button with `rounded-2xl` on a modal unless each is a deliberate step of the same scale.

If a proposed design breaks any of the three, it is rejected unless there is an explicit written rationale tied to a differentiator.

---

## Part 2 — Color (prescriptive, not "use good colors")

### 2.1 Forbidden primary color choices

The following are **banned as the primary accent** because they are the AI-tell:

- Tailwind `blue-500` / `blue-600` / `blue-700` (hex `#3b82f6`, `#2563eb`, `#1d4ed8`)
- Tailwind `indigo-500` / `indigo-600` (hex `#6366f1`, `#4f46e5`)
- Any `from-X to-Y` gradient used as a button background
- Purple-to-blue gradients in any form (`from-violet-* via-purple-* to-blue-*`)
- Any pure saturated hue at `#2563EB`-level chroma

### 2.2 How to choose an accent

The accent color comes from **brand.md** (guideline doc) and is expressed in **OKLCH** where possible, or tuned hex otherwise.

**Target OKLCH range for product accents:**
- Lightness `L`: **0.48 – 0.62** (neither too dark to disappear on dark mode, nor too light to hide on light mode).
- Chroma `C`: **0.08 – 0.16**. Never `C > 0.18`. Saturation is the first giveaway of AI-generic color.
- Hue `H`: determined by brand. If unbranded, pick an uncommon hue — **teal (180-200)**, **deep plum (300-330)**, **burnt orange (40-60)**, **forest (130-150)** — and avoid the default SaaS blue band (220-260) unless the brand requires it.

Examples of accents that read premium:
- `oklch(0.55 0.14 255)` — muted cobalt (not Tailwind blue)
- `oklch(0.60 0.11 150)` — Oscar-style forest green
- `oklch(0.52 0.15 25)` — restrained brand red, not `red-500`
- `oklch(0.58 0.12 280)` — subdued indigo, readable on both themes

If the DS tokens resolve to a banned hex, surface an extension request citing this rule; do not simply use the token.

### 2.3 Grayscale-first, then add color

Design every screen in grayscale first. Color is added **only**:
1. To a single primary CTA per view (if there is one),
2. To the **currently selected** nav or tab item,
3. To the **focused** input ring,
4. To status signals (success/warning/error/info) — and only the status pixel, never the entire surface.

If color is used anywhere else, it must be named in `design_decisions.md § Token applications` with rationale.

### 2.4 Neutrals are tinted, not pure

Do not use pure `#000`, pure `#FFF`, pure `#808080`, or `gray-50/100/500/900` at default saturation.

Neutrals must be **shifted toward the accent hue at very low chroma** (`C ≤ 0.02`). Example: if the accent is `oklch(0.55 0.14 255)`, the near-black is `oklch(0.18 0.01 255)`, the near-white is `oklch(0.99 0.005 255)`. This subtle tint is invisible individually and transformative in aggregate — it is one of the clearest separators between premium and generic.

### 2.5 Backgrounds

- **Product pages:** pure token-backed surface. Light theme: `oklch(0.99 0.005 <hue>)` — NEVER `bg-gray-50`. Dark theme: `oklch(0.14 0.01 <hue>)` — NEVER `bg-zinc-900` / `bg-slate-900` at default.
- **Panels/cards sitting on that surface:** either the same surface with a **hairline border** (see §5.1) OR a 1–2% lightness shift. Never a drop-shadowed white card floating on gray — that is the #1 AI dashboard tell.

### 2.6 Dark mode is not a setting; it is a design

If the product supports dark mode, the dark theme is designed independently, not an inverted copy. Dark surfaces should be `L: 0.14 – 0.22`, never pure black. Cards in dark mode use `+2% lightness` or a hairline at `rgba(255,255,255,0.08)`.

---

## Part 3 — Typography (prescriptive type scale)

### 3.1 Mandatory type ramp

Any dense product screen must use **at least 4 type sizes** drawn from a consistent ratio. The allowed ratios are:

- **1.200 (minor third)** — compact enterprise UIs
- **1.250 (major third)** — default for SaaS dashboards
- **1.333 (perfect fourth)** — marketing / airy consumer product

Two-step scales (only `text-base` + `text-5xl`) are an AI-tell. Use at least: **12, 14, 16, 20, 24, 32** or equivalent.

### 3.2 Font pairings that do NOT read as AI

Ship with **one** of these pairings unless brand.md specifies otherwise. Never default to "Inter only."

| Tier | Primary | Mono | Display (optional) |
|---|---|---|---|
| Default premium | Inter Variable | JetBrains Mono / Geist Mono | Fraunces / Tiempos Headline |
| Technical/dev | Geist | Geist Mono | — |
| Editorial | Inter | IBM Plex Mono | GT Super Display / Tiempos |
| Healthcare/serious | IBM Plex Sans | IBM Plex Mono | — |
| Finance/data | Söhne (if licensed) or Inter | Söhne Mono / Berkeley Mono | — |

If only Inter is available, then: use Inter **Display** variant for ≥20px sizes (tighter tracking), Inter for body, and enable `font-variant-numeric: tabular-nums` on every number.

### 3.3 Tabular figures — mandatory

Every numeric surface uses tabular figures:

```css
font-feature-settings: "tnum" 1, "ss01" 1;
/* or */
font-variant-numeric: tabular-nums;
```

Required on: tables, KPI values, prices, counts, timestamps, percentages, IDs, ISBNs, versions.

Non-tabular numbers in a table or KPI card = fail.

### 3.4 Line-height and tracking

- Body (14–16px): `line-height: 1.5`, `letter-spacing: -0.003em`.
- Heading (20–32px): `line-height: 1.15 – 1.25`, `letter-spacing: -0.015em`.
- Display (>40px): `line-height: 1.0 – 1.1`, `letter-spacing: -0.03em`.
- All-caps labels (uppercase 11–12px): `letter-spacing: 0.06em – 0.08em`.

Defaults (letter-spacing `normal` on headings ≥24px) read as AI.

### 3.5 Weight discipline

Use no more than **3 weights** in the product. Recommended: **400 (body), 500 (labels/emphasis), 600 or 700 (headings)**. Avoid 800/900 except for display marketing moments. Italic is rare and editorial — do not italicize meta text by default.

---

## Part 4 — Space & Layout

### 4.1 Spacing scale

Use an **8px base grid**: `4, 8, 12, 16, 24, 32, 48, 64, 96`. Do not use `6, 10, 14, 18, 22` in padding/margin. Inconsistent spacing is one of the first things a reviewer notices.

### 4.2 Asymmetry over symmetry

- **Marketing and empty-state pages:** anchor content to the 12-column grid, columns 1–7 or 3–9, not 1–12 centered.
- **Content pages:** left-align primary content. Reserve viewport-centering for a single hero moment per product, if at all.
- **Forms:** labels above inputs, left-aligned. Submit button NOT full-width on desktop unless mobile-first.

### 4.3 Optical alignment

Icons beside text are nudged **1–2px** for perceived balance (usually down by 1px for stroked icons). Buttons with leading icons have asymmetric padding — `pl-3 pr-4` not `px-4`.

### 4.4 Density

Density is a decision per screen per density mode (`compact`/`comfortable`/`spacious`):

- Compact row height: **28–32px** (internal tools, tables, finance).
- Comfortable: **36–44px** (default SaaS).
- Spacious: **48–56px** (consumer, marketing, onboarding).

Pick one per screen and enforce it. Mixed row heights within a single table = fail.

### 4.5 Vertical rhythm

Do not stamp `py-16` on every section. A landing page rhythm should vary: `py-24 → py-16 → py-20 → py-32` to create pacing. Identical gap between every section is an AI-tell.

---

## Part 5 — Borders, Depth, and Elevation

### 5.1 Hairlines beat shadows (this is THE premium move)

For peer elements (cards next to cards, rows next to rows), prefer **hairline borders** over drop shadows:

```css
/* light mode */
border: 1px solid rgb(0 0 0 / 0.06);   /* 6-8% of ink */
/* dark mode */
border: 1px solid rgb(255 255 255 / 0.08);
```

NEVER use `border-gray-200` at 100% opacity. That is Tailwind-default and reads as AI.

### 5.2 Shadow tier system

Shadows communicate **elevation**, not decoration. Every shadow in the product is one of three tiers:

- **Tier 1 — Resting** (buttons, inputs, cards): `0 1px 0 rgb(0 0 0 / 0.04)` or no shadow.
- **Tier 2 — Hovering** (popovers, dropdowns): `0 4px 12px rgb(0 0 0 / 0.08)`.
- **Tier 3 — Floating** (modals, sheets): `0 24px 48px rgb(0 0 0 / 0.12), 0 8px 16px rgb(0 0 0 / 0.08)`.

`shadow-md` on every card = fail. Same shadow on a button and a modal = fail.

### 5.3 Light comes from above

For any element with depth, the top edge is slightly lighter than the bottom. A primary button gets:

```css
/* optional — tactile inner-top highlight */
box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.12);
```

This single inset costs nothing and instantly non-generic.

### 5.4 Radii tier system

Use **3 radii at most**, derived from the base:

- **Input / chip / small-button:** `4–6px`
- **Card / button-large / panel:** `8–10px`
- **Modal / sheet / image:** `12–16px`

`rounded-2xl` (16px) on every button, card, input, and modal alike = fail. `rounded-full` on a desktop primary CTA = fail.

---

## Part 6 — Motion

### 6.1 Duration & easing (exact values)

Never use CSS defaults (`ease`, `ease-in-out`, `transition: all 300ms`). Use:

- **UI feedback (hover, press):** `120–180ms`
- **Dropdown / popover:** `160–200ms`
- **Modal / sheet / panel:** `220–320ms`
- **Page transition:** `300–500ms` max

Easing:
- **Enter (ease-out):** `cubic-bezier(0.16, 1, 0.3, 1)` — the Linear/Vercel decelerate curve.
- **Exit (ease-in):** `cubic-bezier(0.7, 0, 0.84, 0)`.
- **Through (ease-in-out) when needed:** `cubic-bezier(0.83, 0, 0.17, 1)`.

`transition: all 300ms ease` = fail.

### 6.2 Motion that shouldn't exist

Do not animate: text color on hover, text content changing, body background hue, anything over 500ms, anything that overshoots/bounces in a serious product context.

### 6.3 Motion that must exist

- Focus ring appearance: 120ms ease-out.
- Dropdown open: 180ms with slight translateY (-4px → 0).
- Toast enter: 200ms ease-out; exit: 150ms ease-in; auto-dismiss 4–6s for info, sticky for error.
- Spinners rotate faster than you think (≈600–800ms per revolution, not 1.2s).

### 6.4 `prefers-reduced-motion`

Respected everywhere via a single media query wrapper. Not optional.

---

## Part 7 — Iconography

### 7.1 Single set, single stroke

Use **one** icon library across the product (Lucide, Phosphor, Radix Icons, or a custom set). Mixing Feather + Heroicons + emoji is an instant tell.

Stroke weight: **1.5 – 1.75px** at 24×24 viewBox. Lucide/Phosphor default `2px` is acceptable but `1.5px` reads more premium.

### 7.2 Sizing

- Inline with 12–14px text: **14 or 16px icon**.
- Inline with 16–18px text: **16px icon**.
- Toolbar / button icon: **16 or 18px**.
- Feature / illustration icon: **24 or 32px**.

Never put a 32px icon inside a 64px colored circle above a heading. That is the AI empty-state.

### 7.3 Color

Icons inherit `currentColor`. They are not colored unless they are a status signal or the accent itself.

### 7.4 No emoji as UI icon

`🚀 ✨ 📊 ✅ ❌ 🎉 🔥` are banned as UI icons. They are acceptable only in user-generated content, playful marketing, or if brand.md explicitly specifies emoji as part of the tone.

---

## Part 8 — Empty, Error, Loading States (the 3 AI-tell hotspots)

The screenshot that triggered this rule — a centered red circle with a white X, "Strategies could not be loaded" headline, generic blue "Retry" pill — is the canonical AI error state. Here is the explicit replacement doctrine:

### 8.1 Error states — DO

- **Left-aligned**, inside the normal product shell (keep the nav, keep the page chrome).
- A **small 16px inline icon** in the accent color (not red; use red only for destructive status), adjacent to a specific sentence.
- Sentence names the **what, why, and next step**: "We couldn't load your strategies — the request timed out after 30s. Retry, or check service status."
- **Two low-weight actions:** a subtle primary ("Retry") and a ghost ("Open status page" or "Contact support").
- Optional: a mono-styled code chip showing the error code for support.
- NO red circle with a white X. NO centered alert-modal shape. NO "Oops!" copy.

### 8.2 Empty states — DO

- Show the **UI shell with skeleton/ghost rows of realistic data**, greyed to ~20% opacity.
- Overlay a single sentence of guidance: "Create a strategy to see it here." or "No results match 'amlodipine'."
- A **ghost button**, not a primary CTA.
- Bonus: a keyboard-shortcut hint chip `Press N to create`. Huge premium signal.
- NO flat illustration. NO emoji-in-circle. NO "Welcome! Let's get you started!" hero.

### 8.3 Loading states — DO

- **Skeleton matches the final shape of the data** — same column widths, same row counts, same paddings. Not "three gray rectangles."
- Shimmer animation: `1.4s linear infinite`, very subtle (~8% lightness sweep).
- For operations >3s: show a meaningful label ("Processing 2,450 patients…").
- NO generic spinner on a page where the shape of the final content is known.

---

## Part 9 — Component-Specific DO/DON'T (reference)

See [references/anti-generic-examples.md](../references/anti-generic-examples.md) for concrete code snippets for: error states, empty states, buttons, inputs, cards, tables, nav, modals, toasts, KPI tiles. Every lead-designer / developer invocation must consult that file when designing or implementing these components.

---

## Part 10 — The Self-Audit (binary pass/fail)

Before lead-designer hands off, and again before developer returns full-generation output, run the checklist in [rules/ai-generic-anti-patterns.md](ai-generic-anti-patterns.md). If **≥3 items** are present, the output is AI-generic. Regenerate or revise. This is not graded; it is binary.

---

## Part 11 — Enforcement Chain

| Stage | Who enforces | What happens |
|---|---|---|
| Design planning | `lead-designer` reads this rule and [ai-generic-anti-patterns.md](ai-generic-anti-patterns.md) before writing `design_decisions.md`. Every token choice cites §2–§3 ranges. |
| Design critique | `design-principal` uses this rule as part of the visual-refinement dimension (added to [ui-excellence-standard.md](ui-excellence-standard.md)). |
| Aesthetic gate | `aesthetic-director` (new agent) audits `design_decisions.md` + `design-principal-critique.md` against this rule and produces required revisions. Up to 2 revision rounds with `lead-designer`. |
| Build | `developer` reads this rule and references concrete code in [references/anti-generic-examples.md](../references/anti-generic-examples.md). |
| Static QA | `dev-qa` adds a `ANTI_GENERIC` gate that greps the generated app for banned literals (`bg-blue-600`, `rounded-2xl` blanket, `border-gray-200`, `shadow-md` overuse, emoji-in-icon-slot, gradient primary, etc.). |
| Visual QA | `design-qa` includes **Aesthetic refinement** and **Anti-pattern audit** axes in its per-axis score (see [agents/design-qa.md](../agents/design-qa.md)). |
| Commercial | `commercial-auditor` references this rule when judging whether the product looks sellable. |

---

## Part 12 — What this rule is NOT

- Not a replacement for brand guidelines. Brand.md wins when it conflicts, but brand.md must still be OKLCH-disciplined per §2.
- Not an excuse to copy Linear/Vercel. Mimicry is separately forbidden (see `market-research.md § Visual signatures`). This rule prescribes the *grammar* (tabular figures, hairlines, optical alignment, motion curves, 1-1-1 discipline), not the *voice*.
- Not permission to break the DS. Every value here resolves through DS tokens where available. If the DS lacks a required token, emit an extension request (see `ds-extension-criteria.md`).

---

## Success gate (how this rule is passed)

- `design_decisions.md § Token applications` shows every accent, neutral, radius, and motion value used, with each value traceable either to a DS token **or** a specific §-reference in this rule.
- `aesthetic-audit.md` (from aesthetic-director) shows ≤2 minor findings and 0 blockers at G2.
- `dev-qa` reports `ANTI_GENERIC: pass` (0 banned literals in generated code).
- `design-qa` scores the **Aesthetic refinement** and **Anti-pattern audit** axes ≥8/10.

## Related

- [rules/ai-generic-anti-patterns.md](ai-generic-anti-patterns.md) — the blacklist self-audit.
- [rules/ui-excellence-standard.md](ui-excellence-standard.md) — the behavior-dimension rubric, now with a fifth dimension: Visual refinement.
- [references/premium-design-playbook.md](../references/premium-design-playbook.md) — deep reference (Linear, Vercel, Stripe, Raycast, Bloomberg, Rauno, Emil, Kennedy).
- [references/anti-generic-examples.md](../references/anti-generic-examples.md) — per-component DO/DON'T code.
- [agents/aesthetic-director.md](../agents/aesthetic-director.md) — the gate that enforces this rule.
