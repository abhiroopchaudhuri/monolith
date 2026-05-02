# Surface Template — Landing

**When:** Marketing page, first-run splash, feature introduction, unauthenticated CTA page.

**Editorial mode.** This is the one template where narrative-arc-first composition matters. Story structure precedes visual composition.

---

## Shape (asymmetric, editorial)

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav (minimal)                                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Hero: asymmetric — headline in columns 1–7, supporting image/      │
│  moment in columns 8–12. NOT centered.                             │
│  Headline: declarative sentence, 42–72px, tight tracking.          │
│  Sub: 15–20 words, muted ink.                                      │
│  Primary CTA + secondary CTA, not centered, left-aligned.          │
│                                                                    │
│  ── section 1 (varied rhythm: py-24 here, py-16 next, etc.) ──     │
│  Eyebrow label (11px uppercase tracking-wide accent).              │
│  Section heading (declarative sentence).                           │
│  Two-column prose-and-visual OR three-feature row.                 │
│                                                                    │
│  ── section 2, surface alternation (bg shift 1–2% lightness) ──    │
│                                                                    │
│  ── pull-quote or stat moment (full-bleed, large numerics) ──      │
│                                                                    │
│  ── section N: final CTA section ──                                │
│                                                                    │
│  Footer                                                            │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules (editorial)

- **Narrative arc first.** Status quo → tension → resolution → action. Every section advances the argument.
- **Headlines are declarative sentences**, not topic labels. "Our platform cuts claim-denial rates by 34%" not "Benefits."
- **One idea per section.** If a section has two ideas, split.
- **Varied vertical rhythm**: `py-24 → py-16 → py-28 → py-20 → py-32`. Identical `py-16` every section is an AI-tell.
- **Surface alternation**: subtle 1–2% lightness shift between consecutive sections, not full-contrast background flip.
- **Editorial typography**: pair a tech sans (body) with a serif display (headlines) OR serif for pull quotes only. See `premium-aesthetic-standard.md § 3.2`.
- **Accent color used sparingly** — eyebrow labels + final CTA. Nowhere else.
- **Asymmetric hero.** Not centered. Content anchored to grid columns.
- **Pull quotes unboxed**, large accent-ink, left-aligned.
- **Stats in tabular-figure display**, paired with context sentence below.
- **CTA cadence**: one primary near-black CTA + one ghost secondary. Not a gradient. Not a pill.

---

## Anti-patterns

- Centered hero with headline + sub + big blue pill CTA + gradient background.
- "Welcome back!" / "Let's get started" headlines.
- Feature grid of 3 cards with icon-in-colored-circle + title + paragraph + link.
- Customer logos strip with grayscale→color hover.
- Stats in cards with `shadow-md` and gradient numbers.

---

## Related

- `rules/premium-aesthetic-standard.md § Part 3 (Typography)` for editorial pairing.
- `references/premium-design-playbook.md § Marketing/studio sites`.
