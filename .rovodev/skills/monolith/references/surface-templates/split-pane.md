# Surface Template — Split Pane

**When:** Master-detail in one viewport. Email, chat, file explorer, code browser, support tickets queue.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav                                                           │
├───────────────┬────────────────────────────────────────────────────┤
│  List         │  Detail pane                                       │
│  pane         │                                                    │
│  (sticky)     │  Selected record header                            │
│  - search     │  ── hairline ──                                    │
│  - filter     │  Body (full content)                               │
│  - row 1 *    │  Actions toolbar (sticky bottom or top-right)      │
│  - row 2      │                                                    │
│  - row 3      │                                                    │
│  - ...        │                                                    │
└───────────────┴────────────────────────────────────────────────────┘

* = currently selected
```

---

## Composition rules

- **List pane width:** 280–360px. Never more than 420px unless explicit.
- **Hairline vertical divider** between panes, not a shadow.
- **Selected row**: accent left border (2px) + muted tinted background, NOT a full-colored fill.
- **Keyboard navigation mandatory**: arrow keys move selection; Enter opens; `/` focuses search.
- **Row layout**: avatar/icon + primary line + meta line (timestamp tabular-nums + preview). Dense, single-row height.
- **Detail pane scrolls independently** of list.
- **Actions in detail toolbar**, not inline per-row in the list.
- **Empty detail**: show a single line "Select a <record> from the list" — not a large illustration.
- **Responsive collapse**: at <768px, list shown; selecting navigates to detail screen.

---

## Anti-patterns

- Selected row with saturated `bg-blue-500` fill and white text.
- Drop shadow separating panes instead of a hairline.
- Inline action buttons on every list row (noise).
- Detail pane header as a separate card with `shadow-md`.

---

## Related

- List row — design decisions per DS's list-item primitive.
- Keyboard hint chip — `anti-generic-examples.md § 7` (⌘K pattern).
