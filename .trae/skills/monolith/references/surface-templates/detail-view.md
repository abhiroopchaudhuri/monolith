# Surface Template — Detail View

**When:** One record in depth (a project, patient, invoice, issue). Header + sections or tabs + actions + related.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Breadcrumb: List › Record name                                    │
│  Header:                                                           │
│    [Large title] [status chip] [meta: updated X, owner Y]          │
│    [actions toolbar: primary + secondary + overflow-menu]          │
│                                                                    │
│  Tabs (optional, when sections are discrete):                      │
│  Overview | Activity | Related | Settings                          │
│                                                                    │
│  ┌──────────────────────────────────┐  ┌─────────────────────────┐ │
│  │ Section or active tab panel      │  │ Side rail (optional):    │ │
│  │ — primary content                │  │  - summary facts         │ │
│  │ — grouped fields                 │  │  - recent activity       │ │
│  │ — inline edit where applicable   │  │  - related records       │ │
│  └──────────────────────────────────┘  └─────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules

- **Breadcrumb is small (11–12px) and sits above title.** Not a full-width bar.
- **Title in display size** (serif or tabular weight-500 at 24–28px) — not `text-4xl font-bold`.
- **Status chip** uses small-caps label + color-coded dot, not a solid colored pill.
- **Actions in a toolbar, not floating.** Primary action near-black; destructive on the overflow menu.
- **Tabs with hairline underline on active**, not pill-shape backgrounds.
- **Side rail** holds meta + related — no card shell.
- **Inline edit** with subtle hover affordance; click to enter edit mode; esc/enter to cancel/save.

---

## Anti-patterns

- Full-width colored hero band with title centered.
- Primary CTA as `rounded-full bg-blue-600`.
- Tabs as pill-shaped filled buttons.
- Activity list with timestamp on the right at default font-variant (not tabular-nums).

---

## Related

- Table (if the detail includes a related-records list) — `anti-generic-examples.md § 6`.
- Form (if detail includes inline edit) — `§ 4`.
