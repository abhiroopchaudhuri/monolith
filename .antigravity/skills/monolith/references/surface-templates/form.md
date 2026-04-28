# Surface Template — Form

**When:** Single-task create or edit. Progressive disclosure, grouped fields, save/cancel footer.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav (or modal shell if in-context)                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Header: title + short description                                 │
│                                                                    │
│  Section group 1                                                   │
│    [Field — label above]                                           │
│    [Field — label above]                                           │
│    [helper text below each]                                        │
│  ── hairline divider ──                                            │
│  Section group 2                                                   │
│    ...                                                             │
│                                                                    │
│  Footer (sticky if long): Cancel (ghost) | Save (primary)          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules

- **Labels above inputs**, `font-weight: 500`, 13–14px.
- **Hairline-bordered inputs**, 6–8px radius, focus ring accent at low chroma.
- **Helper text below each field**, muted ink, 12–13px.
- **Real-time validation** where possible (Stripe-style). Inline error on blur, not on submit.
- **Error messages specific**: "Email must be @company.com" not "Invalid email."
- **Sections grouped** with hairline dividers, not card shells.
- **Submit button not full-width on desktop.** Near-black primary, accent only if it's THE primary action of the view.
- **Cancel is a ghost button**, left of submit or in the overflow menu, never red.
- **Destructive action separated** (bottom-left, or in overflow) — never adjacent to save.
- **Keyboard**: Enter submits (if not in a textarea); Esc cancels from a modal.

---

## Anti-patterns

- Floating labels ("material-style") — can work but often reads as generic.
- `rounded-lg` inputs with `shadow-md`.
- Full-width `bg-blue-600` submit button.
- Submit pinned bottom-right with a gradient.
- Validating only on submit (users want feedback as they type).
- Placeholder as the only label.

---

## Related

- Input — `anti-generic-examples.md § 4`.
- Button — `§ 3`.
