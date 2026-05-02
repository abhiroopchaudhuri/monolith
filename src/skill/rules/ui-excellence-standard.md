# Rule — UI Excellence Standard

Production-grade is the floor: every button works, every route renders. Excellence is the bar: the product feels like something a user would recommend. This rule names what excellence means in terms a reviewer can check.

## The five dimensions of excellence

> v3.1 update: a fifth dimension — **Visual refinement** — was added to catch the "AI-generic" aesthetic that was otherwise slipping past the four behavioral dimensions. It is graded by `aesthetic-director` using [premium-aesthetic-standard.md](premium-aesthetic-standard.md) and [ai-generic-anti-patterns.md](ai-generic-anti-patterns.md).

### 1. Interaction quality

**Production-grade**: click works, state updates, no console error.

**Excellence**: the interaction teaches, confirms, or delights.
- A destructive action's confirmation tells the user exactly what will change ("This will reassign 847 patients currently under Chris Martinez.") — not "Are you sure?"
- A form submission's success state is persistent enough to orient, fleeting enough to not block work (3s toast + in-page marker, not modal + reload).
- A hover state reveals information that would otherwise require a click (tooltip on truncated text, row-level context on hover).
- A search is debounced, shows results as the user types, preserves the query in URL for sharing.
- A keyboard shortcut exists for every action the user does ≥3 times per session.

### 2. Empty / loading / error state craftsmanship

**Production-grade**: empty, loading, error states exist.

**Excellence**: each state is a design artifact in its own right.

- **Empty** is teaching: first time → explains the feature + one CTA; ongoing → acknowledges (not empty = blank).
- **Loading** is choreographed: skeletons match the final shape, not generic rectangles. Long-running operations (>3s) show progress with meaningful labels ("Processing 2,450 patients…" not "Loading…").
- **Error** is specific: names what failed, why, and what the user can do. Never "Something went wrong."

Each differentiator screen must have its empty / loading / error states explicitly designed (not inherited from a generic template).

### 3. Microcopy

**Production-grade**: no Lorem. Labels are correct.

**Excellence**: every string does work.

- **Labels** say what the control does, not what it is. "Export report" not "Export button."
- **Helper text** answers the next question the user has, not the question the designer thought they should have.
- **Errors** name the remedy, not just the problem.
- **Buttons** use verb-first, specific language. "Save changes" not "Save." "Start dry run" not "Run."
- **Empty states** don't apologize. They invite.
- **Toasts** use present-continuous or past-simple, depending on duration. "Strategy saved." not "Strategy has been saved successfully."

### 4. Motion & choreography

**Production-grade**: respects prefers-reduced-motion, doesn't animate gratuitously.

**Excellence**: motion clarifies state changes and maintains spatial continuity.

- Entrance and exit are purposeful (content fading in signals appear; sliding from edge signals "this came from here").
- Duration matches perceived weight (small element: 150ms; modal: 200ms; sheet: 300ms).
- Elements that persist across states (selected row → detail view) use continuity (layout transition, not jump-cut).
- Motion stops when the user is reading or deciding.

### 5. Visual refinement (v3.1)

**Production-grade**: components render, tokens resolve, no obvious visual bugs.

**Excellence**: the product does not read as AI-generated. It has a deliberate visual grammar that a reviewer would recognize as "shipped by a design team."

Evaluated against [premium-aesthetic-standard.md](premium-aesthetic-standard.md) (prescriptive OKLCH / type / motion / depth values) and [ai-generic-anti-patterns.md](ai-generic-anti-patterns.md) (the 25-item blacklist). A screen passes this dimension when:
- Accent color is OKLCH-disciplined (`C ≤ 0.16`, never the banned Tailwind defaults).
- Neutrals are tinted toward the accent hue (not pure gray).
- Type has at least 4 sizes, at least one pairing (sans + mono), tabular figures on all numerics.
- Hairline borders + tiered shadows + tiered radii (no blanket `shadow-md` / `rounded-2xl`).
- Motion uses named cubic-beziers (not CSS defaults).
- Zero canonical compound AI-tells (error/empty/dashboard shapes from the anti-pattern rule).

## How this is enforced

### By design-principal (behavioral — dimensions 1–4)

design-principal reads every screen's design decisions and critiques against the first four dimensions. The critique is not "pass/fail" — it's graded:
- **Excellent**: meets the bar on all four behavioral dimensions.
- **Solid**: meets the bar on 3/4; one dimension has a named gap.
- **At-parity**: meets the bar on 2/4; this screen is not differentiated.
- **Sub-par**: fails on 2+ dimensions; revision required.

Sub-par screens trigger a revision round with lead-designer. Up to 2 rounds. Beyond that, the disagreement is surfaced to the user at G3.

### By aesthetic-director (visual — dimension 5)

aesthetic-director reads [premium-aesthetic-standard.md](premium-aesthetic-standard.md) and [ai-generic-anti-patterns.md](ai-generic-anti-patterns.md), then audits `design_decisions.md` against those rules. Produces `aesthetic-audit.md` with required revisions. Up to 2 revision rounds with lead-designer. Canonical compound AI-tells are automatic blockers regardless of the behavioral grade.

### By design-qa (runtime evidence)

design-qa uses runtime-inspector screenshots to verify:
- Empty / loading / error states render differently for each (no "same-shaped gray rectangle").
- Loading skeletons match the shape of the final content they replace.
- Motion respects `prefers-reduced-motion` when the runtime sets it.

### By ux-writer (copy evidence)

ux-writer's pass explicitly grades each string against the microcopy criteria. Ungraded strings (inherited from PRD verbatim) are rewritten unless PRD strings are explicitly quoted as voice-defining.

## What excellence does NOT mean

- Not "gold-plate every screen equally." Prioritize differentiator screens. At-parity screens should be competent, not distinctive.
- Not "animate everything." Motion that doesn't clarify is noise.
- Not "write cute copy." Cleverness without precision is worse than plain.
- Not "add personality at the expense of clarity." In a clinical or regulated domain, restraint IS personality.

## Anti-patterns (block design-principal approval)

- Empty state says "No data found." (Excellence: what should the user do next?)
- Error says "Error occurred." (Excellence: which error, and what to do.)
- Button says "Submit" in a context where "Save report" or "Send invite" would be more specific.
- Loading shows a generic spinner on a screen where skeleton rows would set expectations.
- Toast message lasts 10 seconds (too long) or 500ms (too short).
- Motion overshoots or bounces in a serious product context.
- Hover adds 400ms transition to a color change — users read it as sluggish.

## Success gate

- design-principal-critique.md exists with grade per screen.
- 0 screens graded "sub-par" at G3 (or explicit user waiver).
- Empty / loading / error states verified in runtime-inspector screenshots.
- ux-writer pass covers every user-visible string.

## Related

- [agents/design-principal.md](../agents/design-principal.md)
- [agents/aesthetic-director.md](../agents/aesthetic-director.md)
- [agents/ux-writer.md](../agents/ux-writer.md)
- [rules/differentiation-mandate.md](differentiation-mandate.md)
- [rules/copy-excellence-standard.md](copy-excellence-standard.md)
- [rules/premium-aesthetic-standard.md](premium-aesthetic-standard.md)
- [rules/ai-generic-anti-patterns.md](ai-generic-anti-patterns.md)
