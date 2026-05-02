# Surface Template — Wizard

**When:** Multi-step flow with clear sequencing (onboarding, checkout, complex create, data import). One step per screen; user can go back and resume.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav (minimal during wizard — often just logo + exit)          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Stepper (horizontal):                                             │
│    ● Step 1 — Connect ─── ● Step 2 — Configure ─── ○ Step 3 — Review  │
│                                                                    │
│  Step heading (large, tabular-weight-500)                          │
│  Brief description (15 words max)                                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────┐          │
│  │  Step body — form, upload, config, whatever fits     │          │
│  │                                                      │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                    │
│  Footer: Back (ghost) | Save and continue later | Next (primary)   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules

- **Stepper shows progress, not navigation.** Past steps completable by clicking; future steps NOT clickable (prevent skipping).
- **Step indicator: dot + number + label.** Completed = accent-filled; current = hairline-outline; future = muted.
- **Content region constrained** (max-width ~680px for reading, ~900px for forms, wider only for data-heavy steps).
- **Back button left, Next right.** Save-and-continue-later in between if the flow supports resume.
- **Validation is step-local.** Each step's validation runs on Next click; errors shown inline.
- **Exit confirms** if data will be lost.

---

## Anti-patterns

- Stepper with gradient-filled progress bar.
- Circular step numbers inside colored circles with checkmarks (AI-tell).
- Back and Next as equal-weight accent-colored pills.
- Step body filling full viewport width on desktop.

---

## Related

- Form — `form.md` + `anti-generic-examples.md § 4`.
