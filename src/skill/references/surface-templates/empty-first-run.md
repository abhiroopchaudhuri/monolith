# Surface Template — Empty / First-Run

**When:** A product surface that has no data yet because the user has just arrived. Not a generic "no items" state — specifically the first-ever visit to a surface.

---

## Shape

```
┌────────────────────────────────────────────────────────────────────┐
│  Top nav                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Normal page header (title, optional description)                  │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  Ghost scaffold of realistic sample rows (faded ~18%)    │      │
│  │  ─────────────────────────────────────                   │      │
│  │  [row outline]  [row outline]  [row outline]             │      │
│  │  [row outline]  [row outline]                            │      │
│  │                                                          │      │
│  │  Overlay (top-left or center-inline):                    │      │
│  │    Sentence of guidance + Ghost CTA + (optional) kbd     │      │
│  │    "Create a strategy to see it here."  [New strategy]   │      │
│  │    [ Press N ]                                           │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Composition rules (critical — this template kills the #1 AI empty-state tell)

- **Ghost scaffold of realistic data** at 18–22% opacity, matching the shape of the final list/grid.
- **Guidance sentence is inline**, not a centered hero. Left-aligned, small (13–14px).
- **Ghost button**, not primary CTA. Accent only if the action is genuinely THE primary next step.
- **Keyboard shortcut chip** (`Press N`, `⌘K`) as a premium signal — even if minor.
- **NO flat illustration**, NO emoji-in-circle, NO "No items yet!" headline, NO centered CTA.
- **Keep the page chrome** (nav, title, header) — the empty state is part of the product, not a separate alert page.

---

## The canonical AI anti-pattern (for contrast)

```
[centered in an otherwise-empty viewport]

  ┌─────────────────────────┐
  │   [pastel blue circle]  │   ← AI-22
  │        ✨               │   ← AI-21
  └─────────────────────────┘
       "No strategies yet!"    ← AI-25
   Create your first strategy
      [  Create strategy  ]    ← AI-01 / AI-09
```

This compound shape triggers Rule 20's canonical empty-state fail (§ Part 3). Blocker.

---

## Related

- `anti-generic-examples.md § 2` — concrete DO code.
- `rules/ai-generic-anti-patterns.md § Part 3` — the canonical empty-state compound tell.
