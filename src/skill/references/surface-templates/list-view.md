# Surface Template — List View

**When:** Browsable set of records — projects, issues, patients, invoices, users, tasks. Users filter, sort, select.

**Not when:** Single record (use `detail-view`). Master-detail in one viewport (use `split-pane`). Dense dashboards (use `dashboard`).

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Header: title + primary action + optional filter/search bar       │
│  ───────────────────────────────────────────────────────────       │
│  Sticky header row (tabular-nums, small-caps uppercase labels)     │
│  Row 1     (hairline divider below)                                │
│  Row 2                                                             │
│  Row 3                                                             │
│  ... (pagination or virtualized scroll)                            │
│  ───────────────────────────────────────────────────────────       │
│  Footer: row count + pagination controls                           │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules

- **No card shell around the table.** Table bleeds to the viewport inset (usually 24–32px padding).
- **Sticky header with backdrop-blur** and hairline bottom.
- **Hairline horizontal dividers only.** No vertical grid. No alternating row colors.
- **Row hover at 4–6% lightness shift.** Never a color fill.
- **Row height** per density: compact 32px / comfortable 40px / spacious 48px.
- **Right-align numeric columns.** Left-align text. Tabular figures on all numerics.
- **Status communicated by icon + text + color** (not color alone).
- **Primary action in header** (not floating). Usually near-black primary on light, not accent-colored.
- **Empty state** → ghost rows + sentence + ghost button (see anti-generic-examples § 2).
- **Loading state** → skeleton rows matching final column shape (see anti-generic-examples § 10).
- **Filter/search** inline in header, not a separate filter bar. Supports URL-persisted state.
- **Selection model:** checkbox column on the left OR row-click selection, not both.

---

## Anti-patterns (Rule 20)

- Striped rows (odd:bg-white even:bg-gray-50).
- `bg-gray-100` header bar.
- `rounded-2xl` + `shadow-md` card around the table.
- Bulk-action bar appearing with a colored background when rows are selected (use hairline-bordered toolbar instead).

---

## Related

- Table — `anti-generic-examples.md § 6`.
- Empty / loading — `§§ 2, 10`.
