# Rule 20 — AI-Generic Anti-Patterns (scannable blacklist)

> **When to consult.** Every agent whose output affects visible design reads this file before producing work AND re-reads it as a self-audit before returning. Weaker LLMs need a binary list, not prose. This is that list.

> **How to use.** Walk the checklist linearly. Count matches. If **≥3 items match**, the output is AI-generic and must be revised. Zero ambiguity; no gradient of "how bad."

**See also:** [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md) (the positive doctrine), [references/anti-generic-examples.md](../references/anti-generic-examples.md) (replacement patterns with code).

---

## Part 1 — The 25 AI-Tells (global)

Check each. If the design or generated code exhibits the pattern, mark it.

### Color
- [ ] **AI-01** — Primary CTA uses Tailwind `blue-500/600/700`, `indigo-500/600`, `violet-*`, or `sky-*` at default saturation.
- [ ] **AI-02** — Any gradient used on a button, card, background, or progress bar (`from-X to-Y`, `bg-gradient-*`).
- [ ] **AI-03** — Purple-to-blue combinations anywhere in the product (including avatar placeholders).
- [ ] **AI-04** — Background uses `bg-gray-50`, `bg-slate-50`, `bg-zinc-50`, or similar Tailwind-default off-white.
- [ ] **AI-05** — Borders use `border-gray-200` / `border-slate-200` at 100% opacity instead of hairlines at low opacity (≤12%).
- [ ] **AI-06** — Pure `#000`, `#FFF`, or `#808080` used as color values with no accent-hue tint.
- [ ] **AI-07** — Status color is red-500/green-500/yellow-500 at default saturation.

### Shape / radius
- [ ] **AI-08** — Same radius (`rounded-xl` or `rounded-2xl`) used on buttons, cards, inputs, and modals alike.
- [ ] **AI-09** — Pill-shape (`rounded-full`) applied to desktop primary CTA.
- [ ] **AI-10** — Card has a colored top stripe (`border-t-4 border-blue-500` or similar).

### Depth / shadows
- [ ] **AI-11** — `shadow-md` / `shadow-lg` on every card at the same elevation (no tier system).
- [ ] **AI-12** — Glassmorphism (`backdrop-blur-md bg-white/60`) used without underlying imagery/gradient justification.
- [ ] **AI-13** — Primary button has `shadow-md` to "make it pop."

### Typography
- [ ] **AI-14** — Only Inter is used; no mono for numbers, no tabular figures enabled.
- [ ] **AI-15** — Type scale has fewer than 4 sizes on a dense screen (e.g., only `text-base` + `text-5xl`).
- [ ] **AI-16** — Headings ≥24px use default letter-spacing (`normal`) instead of tight tracking.
- [ ] **AI-17** — Numbers (KPIs, table cells, prices, timestamps) rendered without `tabular-nums`.

### Layout
- [ ] **AI-18** — Primary content viewport-centered with equal top/bottom padding (symmetrical hero).
- [ ] **AI-19** — Every section uses identical vertical rhythm (`py-16` or similar) with no pacing variation.
- [ ] **AI-20** — Form submit button is full-width on desktop.

### Icons
- [ ] **AI-21** — Emoji used as UI icon (🚀 ✨ 📊 ✅ ❌ 🎉 🔥) outside user-generated content.
- [ ] **AI-22** — Feature icon placed inside a pastel colored circle (`w-16 h-16 rounded-full bg-blue-100`) above a heading — classic empty-state AI shape.
- [ ] **AI-23** — Icons used at uniform size regardless of semantic role (12px meta icon same size as 32px feature icon).

### Motion
- [ ] **AI-24** — CSS default easing used (`transition: all 300ms ease` or `ease-in-out` on hover).

### Copy
- [ ] **AI-25** — Generic AI copy present: "Oops!", "Something went wrong", "Welcome back!", "Let's get started", "Your dashboard awaits", "No items found".

---

## Part 2 — The Error State AI-Tell (THE canonical one)

If the design includes an error state that looks like the screenshot that motivated this rule — **a centered red circle with a white X, a headline that says "Something could not be loaded", a centered paragraph of advice, and a single solid blue pill "Retry" button in the middle of an empty viewport with a white card floating on a gray background** — that is the AI error state. Treat it as a single compound fail (equivalent to 5+ individual items) and refuse.

Required replacement: see [rules/premium-aesthetic-standard.md § Part 8](premium-aesthetic-standard.md) and [references/anti-generic-examples.md § Error States](../references/anti-generic-examples.md).

---

## Part 3 — The Empty State AI-Tell

Any of these shapes together = compound fail:
- Flat two-tone illustration of papers/boxes/rockets.
- Pastel colored circle with an emoji or single-hue icon above the heading.
- Headline reading "No items yet!" / "Nothing here yet" / "It's empty here!"
- Single solid-blue primary CTA centered below.
- Everything vertically centered in an otherwise empty viewport.

Replacement: ghost skeleton rows of realistic sample data + inline sentence + ghost button + optional keyboard hint chip.

---

## Part 4 — The Dashboard AI-Tell

If three or more of these co-occur on a dashboard, it reads as AI:
- 4 KPI cards in a grid, each with a white background, `rounded-2xl`, `shadow-md`, a small pastel-circle icon in the top-right, a label in gray, a big number, and a green/red up/down arrow + percentage.
- `bg-gray-50` page background.
- Identical card sizes, identical shadows, identical paddings.
- Purple-to-blue sparklines or gradient-filled chart areas.

Replacement: naked numeric blocks separated by hairline borders or whitespace; uppercase tracking-wide labels; tabular figures; neutral ink sparklines; accent color only on the currently-focused card.

---

## Part 5 — Self-Audit Script (what to grep)

`dev-qa` runs a `ANTI_GENERIC` gate using these regex probes against `<appRoot>/src/**/*.{tsx,ts,css}`. Any match is a finding; 3+ findings is blocker.

```txt
# Color bans
/\bbg-(blue|indigo|violet|sky)-(500|600|700)\b/                              → AI-01
/\btext-(blue|indigo|violet|sky)-(500|600|700)\b/                            → AI-01
/\bbg-gradient-to-[a-z]+\b/                                                  → AI-02
/from-(violet|purple|indigo)-.*(to|via)-(blue|indigo|purple)/                → AI-03
/\bbg-(gray|slate|zinc|neutral)-50\b/                                        → AI-04
/\bborder-(gray|slate|zinc)-(100|200)\b/ (on component-level borders)        → AI-05
/#(000000|ffffff|808080)\b/                                                  → AI-06

# Shape bans
/\brounded-(xl|2xl)\b/ count > 50% of rounded-* usages                       → AI-08
/className="[^"]*\brounded-full\b[^"]*bg-(blue|indigo|violet)/               → AI-09
/\bborder-t-4 border-(blue|indigo|red|green|purple)-/                        → AI-10

# Shadow bans
count of /\bshadow-(md|lg)\b/ uses > 3 distinct component files with identical shadow → AI-11
/\bbackdrop-blur.*bg-(white|black)\/[0-9]+/                                  → AI-12

# Typography bans
absence of /tabular-nums|font-feature-settings: ["']?tnum/ on any numeric component → AI-17
absence of /font-(serif|mono)/ anywhere + only default Inter                 → AI-14

# Icon / copy bans
/[🚀✨📊✅❌🎉🔥⭐💡⚡️]/ in a .tsx component (not user content)                 → AI-21
/rounded-full.*bg-(blue|red|green|purple|yellow)-100[^"]*"[^>]*>[\s]*<[A-Z][a-zA-Z]+\s+className="[^"]*w-(12|16|20|24)/ → AI-22
/Oops|Something went wrong|Let's get started|Your dashboard awaits|No items found|No data found/i → AI-25

# Motion bans
/transition:\s*all\b/                                                         → AI-24
/\btransition-all\b/ (Tailwind) on anything non-trivial                       → AI-24
```

Script home: `scripts/validate-generated.ts` adds an `antiGeneric()` probe. Output: `qa/anti_generic_findings.json`.

---

## Part 6 — Severity Mapping

| Count of tells | Severity | Action |
|---|---|---|
| 0 | pass | Ship |
| 1–2 | minor | Fix in the same attempt; do not block |
| 3–4 | major | Self-healer routes to developer; blocker at G3 if unresolved |
| 5+ | compound / blocker | Regenerate affected screen from scratch; do not patch |

The "canonical AI error state" (§Part 2) and "canonical AI empty state" (§Part 3) and "canonical AI dashboard" (§Part 4) each count as compound fails regardless of individual-item count.

---

## Part 7 — Allowlist (when an AI-tell is acceptable)

Rare exceptions exist. They must be documented in `design_decisions.md § Anti-pattern exceptions` with:

1. The specific item being used (e.g., "AI-09: `rounded-full` primary CTA").
2. The rationale tied to a differentiator or brand requirement ("Brand requires pill CTAs — see brand.md §2").
3. What we are doing differently elsewhere to offset the tell ("Accent is `oklch(0.52 0.15 25)` burnt-orange to differentiate from generic blue pills").

Without an entry in that section, the tell is a failure, not an exception.

---

## Part 8 — What this rule does NOT cover

- Layout-level ideas (whether a sidebar is needed, whether a screen should be a modal or a page) — see IA + lead-designer.
- Content quality (copy voice, microcopy precision) — see [rules/copy-excellence-standard.md](copy-excellence-standard.md).
- Accessibility — see [guidelines/accessibility.md].
- Component behavior — see [rules/ui-excellence-standard.md](ui-excellence-standard.md).

This rule is only about **the visual fingerprint of AI-generated UI**.

---

## Related

- [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md) — positive doctrine.
- [references/anti-generic-examples.md](../references/anti-generic-examples.md) — replacement patterns with code.
- [agents/aesthetic-director.md](../agents/aesthetic-director.md) — the enforcement agent.
- [agents/design-qa.md](../agents/design-qa.md) — runtime audit including this checklist.
- [scripts/validate-generated.ts](../scripts/validate-generated.ts) — the `ANTI_GENERIC` gate.
