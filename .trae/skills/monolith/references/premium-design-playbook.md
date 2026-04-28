# Premium Design Playbook

> **Read-only reference.** Knowledge base distilled from practitioners (Rauno Freiberg, Emil Kowalski, Erik D. Kennedy, Adam Wathan / Steve Schoger, Brian Lovin, Mariana Castilho) and from the visual grammar of products that consistently read as premium (Linear, Vercel, Stripe, Raycast, Superhuman, Attio, Arc, Cron/Notion Calendar, Height, Pitch, Framer, Abridge, Oscar, Bloomberg Terminal, Retool, Observable).
>
> **Used by:** `lead-designer`, `design-principal`, `aesthetic-director`, `design-qa`, `developer`. Read sections relevant to the decision you are making. For prescriptive rules see [rules/premium-aesthetic-standard.md](../rules/premium-aesthetic-standard.md). For code see [references/anti-generic-examples.md](anti-generic-examples.md).

---

## Part 1 — Why LLM-default UI looks cheap

Large language models learn a statistical average of "SaaS dashboard" from training data dominated by Tailwind tutorials, landing-page templates, and generic ChatGPT UI demos. The average is:

- Tailwind `blue-600` primary, `rounded-2xl`, `shadow-md`, `bg-gray-50`, Inter everything.
- Centered hero compositions with symmetric padding.
- Emoji-in-pastel-circle empty states.
- Red-circle-X error states with "Oops" copy.
- Feature cards with icon-in-colored-circle + big title + paragraph + link.

Premium design is not "fancier than average" — it is **a specific grammar** that diverges from the average on ~8 axes: color discipline, tinted neutrals, type pairing, tabular figures, hairline borders, tiered shadows, tiered radii, named motion curves. Hit those 8 and output reads premium even at Haiku-class model capability. Miss any 3 and it falls back to AI-generic.

---

## Part 2 — Lessons from specific products

### Linear

- **OKLCH-derived theming.** Explicitly rebuilt from HSL to LCH to avoid hue drift across lightness steps; themes derive from a single seed accent with predictable perceptual spacing.
- **Accent discipline.** Linear indigo covers less than 5% of pixels; everything else is neutral grayscale. Accent appears only on focused issue, primary CTA, and selection.
- **8px spacing scale** enforced strictly. No `6px`, no `10px`, no `14px` in padding/margin.
- **Dark-first.** Light mode feels secondary. Dark surfaces at `L: 0.14–0.18`.
- **1px inner-top highlight** on cards/buttons to imply light from above.
- **Keyboard-first.** Inline `kbd` hints that fade after first use.

### Vercel (Geist)

- **Custom typeface (Geist).** Near-black primary buttons on light mode, near-white on dark. Reserves the accent for status and the single "contact sales" CTA.
- **Hairline borders everywhere** in place of shadows. Cards separated from surface by `1px rgb(0 0 0 / 0.06)` borders, not `shadow-md`.
- **Empty states show the UI scaffold** with faint sample data, not a flat illustration.

### Stripe

- **Söhne (Klim) as primary typeface** — instantly non-generic.
- **Restrained palette.** Primary action uses a single indigo at disciplined chroma; everything else is grayscale.
- **Real-time field validation** as a premium UX signal — errors appear while you type, not on submit.
- **Tabular figures on every price.** Non-negotiable in financial products.

### Raycast

- **Command palette as primary UI.** Keyboard shortcuts are surfaced, not hidden.
- **Density.** Raycast list rows are 32px; the whole product is compact and reads as for-power-users.
- **Custom icon set** with consistent stroke and sizing.

### Superhuman

- **Dense two-pane.** No wasted whitespace; every pixel carries information.
- **Keyboard-only interactions feasible for every task.**
- **Subtle motion** — list selection shifts, reading pane slides in at 180ms.

### Attio

- **Serif display** for big numerics and editorial headings alongside a technical sans for UI.
- **Hairline-border tables** with no alternating row colors.
- **Accent only on the focused cell.**

### Arc

- **Asymmetric canvas.** Sidebar takes visual weight; tabs feel like something new, not a browser default.
- **Motion with personality.** Overshoot-and-settle for actions (Rauno's Disney follow-through principle).
- **Reserved accent.** The teal-purple gradient is editorial, not a button gradient.

### Bloomberg Terminal

- **Density as trust signal.** Packed with 5–10× consumer-SaaS information. Non-users find it overwhelming; professionals find it premium.
- **Custom typeface (commissioned Matthew Carter)** with fraction glyphs for finance.
- **Zero chrome on data regions.** Tables bleed to viewport edges; no card shells.
- **High-chroma colors reserved for signals only** — green up, red down, amber warning.

### Abridge / Oscar / Ro (healthcare)

- **Monochrome + one domain-appropriate accent** (Oscar's neon-green, Ro's deep indigo, Abridge's terracotta). Never default blue.
- **Typography carries hierarchy** in dense clinical screens — no alternating rows, hairline dividers only.
- **Status communicated by icon + text + color together**, never color alone (trust + accessibility).

### Craft / Notion Calendar / Cron

- **Editorial serif for big headlines**, sans for UI, mono for timestamps.
- **Micro-interactions on hover** — row reveal, inline affordances.

---

## Part 3 — Practitioner rules (distilled)

### Refactoring UI (Adam Wathan, Steve Schoger)

1. **Design in grayscale first.** Color is applied after the gray-scale hierarchy is complete. Color should never be what creates hierarchy; spacing, weight, and size should.
2. **Use a restricted color palette.** 8–10 shades per hue, not a full ramp-for-each.
3. **Don't rely on color for meaning alone.** Pair with icon or text.
4. **Shadows communicate elevation.** Use multiple shadow layers, not one blanket `shadow-md`.
5. **Borders can often be replaced by shadow + spacing.** Don't stack both.
6. **Constrained scales.** Pick 4–6 font sizes, 5–8 spacing values, 2–3 radii. Don't invent new values per component.
7. **Supercharge defaults.** A cheap-looking form is `<input>`; a premium form has intentional padding, tinted border, focused ring at accent color.
8. **Colored top-stripe on a card** is explicitly called out as cheap/AI-made.
9. **Design is in the details.** The gap between "close enough" and "correct" is where polish lives.

Source: Refactoring UI book + refactoringui.com writings.

### Rauno Freiberg — "Invisible Details of Interaction Design"

1. **Follow-through and overlapping action (Disney principle).** When a user action completes, the result shouldn't stop dead — it should overshoot and settle, or trail. This is what makes Arc and Linear feel alive.
2. **Robustness.** "80% right means broken." A hover state that half-works, a dropdown that closes when it shouldn't, a keyboard shortcut that works 90% of the time — these are the things that separate apps that feel premium from those that feel sloppy.
3. **Reward-learning-with-reused-metaphors.** Once a user learns that `⌘K` opens the command palette, reuse `⌘K` everywhere — don't invent new shortcuts for similar patterns.
4. **Details compound.** Focus ring + hover state + keyboard navigation + tabular figures + tight letter-spacing on headings — none is visible individually; together they define "premium."

Source: rauno.me, devouringdetails.com.

### Emil Kowalski — animations.dev

1. **UI animations under 300ms.** Dropdowns at 180ms, modals at 200–250ms, sheets at 300ms.
2. **Never use CSS default easing** (`ease`, `ease-in-out`). Use custom cubic-beziers.
3. **Ease-out for user-response motion** (`cubic-bezier(0.16, 1, 0.3, 1)`). The user pushes; the UI responds and decelerates smoothly.
4. **Spinners rotate faster than you think.** 600–800ms per revolution makes a slow operation feel snappy.
5. **Don't animate text content.** It just looks glitchy.
6. **Spring animations for success/celebration,** ease-out for navigation, ease-in for exits.

Source: emilkowal.ski, animations.dev.

### Erik D. Kennedy — Learn UI Design

1. **Light comes from above.** Every surface with depth has a slightly lighter top edge and a slightly darker bottom edge. This is why embossed text and inset buttons look "right."
2. **Two-level hierarchy is minimum.** A design with only one type size or weight has no hierarchy; it all reads as the same importance.
3. **The 3 Laws of Locality** — related controls are placed near each other; grouping is by proximity, not by lines.
4. **White space by degrees.** Not "more is better" — "more between unrelated things, less between related things."

Source: learnui.design, Medium articles.

### Brian Lovin

1. **"The gap between close enough and correct is where polish lives."**
2. **Every screen has a primary action.** If there are three equal-weight buttons, the user does nothing. Demote two to secondary/ghost.
3. **Avatar placeholders are themed, not random.** Don't use gradient-hue-from-initials.

### Mariana Castilho / Vercel design

1. **Empty states show the shell.** Ghost rows, not flat illustration.
2. **Primary buttons are near-black on light, near-white on dark** by default. Reserve color for "the one action that matters on this screen."

---

## Part 4 — The grammar of premium (synthesis)

If you can only remember eight things:

1. **OKLCH-disciplined color.** Accent `C ≤ 0.16`. Neutrals tinted toward accent at `C ≤ 0.02`. Never pure Tailwind defaults.
2. **Grayscale-first hierarchy.** Spacing, weight, and size do the work. Color accents less than 5% of pixels.
3. **Type pairing.** One sans + one mono minimum. Serif display for editorial moments. Never Inter-only.
4. **Tabular figures on every number.** `font-variant-numeric: tabular-nums`.
5. **Hairline borders over shadows** for peer elements. Shadow tier system for elevation.
6. **Radii tier system.** Inputs smaller radius than cards smaller than modals. Not `rounded-2xl` on everything.
7. **Named motion curves.** `cubic-bezier(0.16, 1, 0.3, 1)` for ease-out. Never `transition: all 300ms ease`.
8. **1-1-1 discipline.** One type family, one accent color, one radius scale.

---

## Part 5 — Pattern notes by category

### Dashboards
- Drop the card shell. Use hairline-bordered regions or whitespace separation.
- Uppercase tracking-wide label (`text-xs font-medium tracking-wide uppercase text-fg-muted`), big tabular-figure value (serif display or sans `font-medium`), delta on second line with tiny arrow glyph.
- Sparkline at neutral ink, no axes, no gradient fill.
- Accent appears only on the currently focused tile.

### Tables / lists
- Hairline horizontal dividers only — no vertical grid, no alternating rows.
- Sticky header with backdrop-blur and hairline below.
- Row hover at 4–6% lightness shift; never a fill color.
- Right-align numerics, left-align text; tabular figures mandatory.
- Density: 32px (compact) / 40px (comfortable) / 48px (spacious).

### Forms
- Labels above inputs, `font-weight: 500`, 13–14px.
- Inputs with hairline border, 6–8px radius, focus ring 2px offset at accent at `C: 0.10–0.12`.
- Helper text below, low-emphasis ink.
- Real-time validation where possible (Stripe-style).
- Submit NOT full-width on desktop.

### Modals
- Backdrop at 40–60% with 4–8px backdrop-blur.
- 1px inner-top highlight on the modal surface.
- Title 18–20px, description 14px muted.
- Actions bottom-right. Destructive left, primary right, keyboard (Esc/Enter) implied by `kbd` hints.

### Nav / headers
- Logo 20–24px (not oversized).
- Links 14px regular weight.
- Primary action at the same weight as nav, not a colored pill.
- Active indicated by hairline underline or tinted background, not a solid pill.
- `⌘K` affordance as a premium signal.

### CTAs
- Primary: near-black on light / near-white on dark by default. Accent color only if this is THE primary action of the view.
- Height 32–36px compact, 40–44px comfortable, 44–48px spacious.
- Radius 6–8px. Not `rounded-full`.
- Subtle inset 1px highlight on top edge.
- Hover shifts lightness by 4–6%, never hue.

### Empty states
- Ghost skeleton of realistic sample data, 20% opacity.
- Single sentence of guidance overlaid.
- Ghost button (not primary).
- Optional `kbd` shortcut hint chip.
- NOT centered illustration + "No items yet!" + blue CTA.

### Error states
- In the product shell, not a separate alert page.
- 16px inline icon in accent color (not red unless destructive).
- Specific sentence (what, why, next step).
- Two low-weight actions (subtle primary + ghost).
- Mono code chip for error code if relevant.
- NOT centered red-circle-X + "Oops" + solid blue pill.

### Loading states
- Skeleton matches final content shape.
- Shimmer `1.4s linear infinite` at ~8% lightness sweep.
- Meaningful label for >3s operations.
- Spinner rotates 600–800ms per revolution.
- NOT "three gray rectangles stacked."

### Toasts
- Top-right or bottom-center, never modal.
- 4–6s for info, sticky for error (user dismisses).
- 200ms enter / 150ms exit.
- Accent-tinted border-left for severity, not full-colored backgrounds.

---

## Part 6 — Sources & further reading

- Refactoring UI — book + refactoringui.com
- Rauno Freiberg — rauno.me, devouringdetails.com, ui.land interview
- Emil Kowalski — emilkowal.ski, animations.dev
- Erik D. Kennedy — learnui.design, "7 Rules for Creating Gorgeous UI"
- Brian Lovin — brianlovin.com
- Linear Brand Guidelines — linear.app/brand
- "How we redesigned the Linear UI" — linear.app/now/how-we-redesigned-the-linear-ui
- Vercel Geist — vercel.com/geist
- Evil Martians — "OKLCH in CSS: why we moved from RGB and HSL"
- shadcn — easings / cubic-bezier reference
- Bloomberg Terminal UX — bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/
- Matt Ström-Awn — "UI Density"

---

## Related

- [rules/premium-aesthetic-standard.md](../rules/premium-aesthetic-standard.md) — the prescriptive values.
- [rules/ai-generic-anti-patterns.md](../rules/ai-generic-anti-patterns.md) — the blacklist.
- [references/anti-generic-examples.md](anti-generic-examples.md) — concrete replacement code.
- [agents/aesthetic-director.md](../agents/aesthetic-director.md) — the enforcement agent.
