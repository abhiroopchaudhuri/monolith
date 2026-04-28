# Surface Templates

> **Purpose.** A catalog of canonical page-level layouts. Each template describes **the shape of a screen**, not its contents. lead-designer cites a template per screen in `design_decisions.md` so every screen has a named composition that the developer implements consistently.
>
> **Inspiration.** A broader registry of 8 templates covering the most common product surfaces in SaaS/b2b/internal-tool/consumer-saas builds.
>
> **Non-prescriptive.** These are references, not mandates. A screen that doesn't fit any template documents its novel composition in `design_decisions.md § Custom surface`.

---

## Index

| Template | When to use |
|---|---|
| [dashboard.md](dashboard.md) | Overview / at-a-glance data for an authenticated user. Multiple small widgets, left-aligned, hairline-bordered regions instead of card shells. |
| [list-view.md](list-view.md) | Browsable set of records (projects, issues, patients, invoices). Dense table or card grid + filters + sort + row selection. |
| [detail-view.md](detail-view.md) | One record in depth. Header + tabs or sections + actions + related records. |
| [form.md](form.md) | Single-task creation or edit. Progressive disclosure. Save / cancel footer. |
| [wizard.md](wizard.md) | Multi-step flow. Stepper + one-step-per-screen + back/next/save-and-continue. |
| [settings.md](settings.md) | Configuration. Left-nav of sections + right-pane with grouped fields + inline save. |
| [landing.md](landing.md) | Marketing or first-run. Asymmetric composition + editorial rhythm + CTAs. |
| [split-pane.md](split-pane.md) | Master-detail in one viewport (email, chat, file explorer). List on left, detail on right, selected state synchronized. |
| [empty-first-run.md](empty-first-run.md) | An authenticated product's first view before any data exists. Ghost scaffold + invite to create. |

---

## How lead-designer uses this

In `design_decisions.md § Per-section component table`, every screen row includes a `surface-template` column naming one of the above (or `custom` with a description). Developer then implements the screen against that template's shape.

---

## How aesthetic-director uses this

When auditing for AI-tells, aesthetic-director cross-checks the template against the canonical compound tells in `ai-generic-anti-patterns.md`:

- Dashboards that match `dashboard.md` are fine. Dashboards that resemble the "4× white-card-shadow-md-rounded-2xl" canonical AI shape fail Rule 20.
- Empty states that match `empty-first-run.md` (ghost scaffold) pass. Empty states that match the AI canonical (pastel-circle-emoji + blue CTA) fail.

---

## Adding new templates

When a run produces a recurring surface shape across ≥2 screens that doesn't match any existing template, design-qa promotes it into a new template here, analogous to pattern promotion in `<memoryRoot>/patterns/`.
