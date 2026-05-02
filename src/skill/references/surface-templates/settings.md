# Surface Template — Settings

**When:** Configuration and account management. Many sections of infrequently-touched fields.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav                                                           │
├───────────────┬────────────────────────────────────────────────────┤
│               │                                                    │
│  Section nav  │  Section title                                     │
│  (sticky)     │  Short description                                 │
│               │                                                    │
│  - Profile    │  Grouped fields (with section sub-headings)        │
│  - Notifs     │    Field: label + input + helper                    │
│  - Billing    │    Field: ...                                        │
│  - Members    │  ── hairline ──                                    │
│  - API        │  Another sub-section                               │
│  - Advanced   │    Field: ...                                        │
│  - Danger     │                                                    │
│               │  Inline save (auto-save with toast) OR              │
│               │  section-level Save button                         │
│               │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
```

---

## Composition rules

- **Left-nav is sticky**, 200–240px wide, hairline right border, no background fill.
- **Active section = accent text + 1px accent left border**, not a filled pill.
- **Right content is scrollable**, max-width ~720px for legibility.
- **Auto-save preferred** for simple settings; show inline "Saved" affordance at 200ms ease-out; toast for significant changes.
- **Section-level save** for complex forms where partial changes would be incoherent.
- **Danger zone** is a distinct sub-section with hairline-red border, destructive actions inside. Never mixed with normal settings.
- **Keyboard shortcuts**: Cmd+S saves current section; scroll within content area, not whole page.

---

## Anti-patterns

- Settings as a long single-column page with no nav.
- "Save changes" as a full-width blue pill at the bottom.
- Danger zone as a red-filled card with exclamation emoji.
- Toggle switches in Tailwind-default purple / blue saturation.

---

## Related

- Form — `form.md`.
- Toggle/switch component (in DS's component-index.json).
