# Surface Template — Dashboard

**When:** Authenticated overview for a user. Multiple small widgets giving at-a-glance status and actions.

**Not when:** Single-record detail (use `detail-view`). Marketing or landing (use `landing`). Dense browsable records (use `list-view`).

---

## Shape

```
┌─────────────────────────────────────────────────────────────────┐
│  Top nav (hairline bottom, backdrop-blur)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Section header (optional small-caps eyebrow + heading)         │
│                                                                  │
│  ┌────────────┬────────────┬────────────┬────────────┐          │
│  │ KPI 1      │ KPI 2      │ KPI 3      │ KPI 4      │          │
│  │ (naked)    │            │            │            │          │
│  └────────────┴────────────┴────────────┴────────────┘          │
│                                                                  │
│  ┌─────────────────────────────────┐  ┌──────────────────────┐  │
│  │  Primary panel                  │  │ Secondary list       │  │
│  │  (activity feed, main chart,    │  │ (recent items,       │  │
│  │   or differentiator moment)     │  │  upcoming, quick     │  │
│  │                                 │  │  actions)            │  │
│  └─────────────────────────────────┘  └──────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Composition rules

- **No card shells on the KPI row.** Naked numbers separated by hairline vertical dividers. See `references/anti-generic-examples.md § 5`.
- **Uppercase tracking-wide small-caps labels** over tabular-figure values.
- **Delta on second line** with tiny glyph arrow, muted sign color.
- **Neutral sparklines** under values where relevant; no gradient fills.
- **Accent color only on the currently focused tile** (click to drill in) — never on every tile.
- **Primary panel** is asymmetric — 60–65% of horizontal space, not 50%.
- **Secondary list** uses row hover at 4–6% lightness shift; no row backgrounds.
- **Empty dashboard** routes to `empty-first-run` shape, not a banner.

---

## Anti-patterns (triggers Rule 20 blocker)

- 4 KPI cards with `rounded-2xl` + `shadow-md` + icon-in-colored-circle in top-right → canonical AI dashboard shape.
- Page background `bg-gray-50`.
- Gradient-filled chart areas (violet-to-blue).
- Identical card sizes in a 4-column grid with identical shadows.

---

## Related patterns

- KPI tile — see `references/anti-generic-examples.md § 5`.
- Table within secondary list — see `§ 6`.
- Empty state — see `§ 2`.
