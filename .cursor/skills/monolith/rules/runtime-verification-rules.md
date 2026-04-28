# Rule — Runtime Verification

Static gates (tsc, ESLint, DS_FIRST grep) cannot catch:
- Nav state bugs that only manifest at runtime (`NavLink` matching behavior)
- Scroll clipping that only shows after expanding a collapsible
- Dead buttons (they compile fine)
- Overflow at specific viewport sizes
- Modals that steal focus from subsequent interactions
- Forms that don't actually submit

Runtime verification **must** be part of every pre-G3 pass. If it can't run, the run blocks — not proceeds.

## What runtime verification means

A headless browser (Playwright or equivalent) performs a scripted sweep:

### 1. Route coverage
- For every route in `information_architecture.md`, visit it cold from a new context.
- Assert: HTTP 200, no console error, no uncaught exception, body is not empty.
- Capture: full-page screenshot at 1440×900, 1024×768, 768×1024, 375×812.

### 2. Interactive element coverage
For each route, discover every interactable:
```
button, [role="button"], a[href], input, select, textarea,
[role="menuitem"], [role="tab"], [role="switch"], [role="checkbox"],
[data-testid], [onclick], [data-coming-soon]
```

For each one, either:
- Click it (or type, for inputs) and assert the expected effect (navigation, modal open, state change, toast).
- Or verify it is `disabled` / `aria-disabled="true"` / has `data-coming-soon` with consistent toast behavior.

### 3. Nav-state invariant
After navigation to each route, assert:
- Exactly one sidebar item has `aria-current="page"` (or `[data-active="true"]`).
- No two nav items match simultaneously via visual styling.

### 4. Scroll invariants
For each route:
- Scroll main content to the bottom; assert nothing is clipped.
- If page contains Collapsible / Accordion / Expandable: open every one; re-scroll; re-assert.
- Assert no `overflow: hidden` container prevents content from being read in full.

### 5. Modal behavior
For each modal in the plan:
- Open it; assert focus moves inside.
- Tab through; assert focus stays in modal.
- Press Escape; assert modal closes and focus returns to trigger.
- Re-open; click backdrop (if dismissible); assert behaves as specified in design_decisions.md.

### 6. Form behavior
For each form:
- Leave required fields empty; submit; assert validation errors appear and are linked via `aria-describedby`.
- Fill required fields; submit; assert success path (toast, route change, state update).

### 7. Responsive behavior
At each viewport size:
- Assert no horizontal scrollbar on main body.
- Assert sidebar collapses at < 768px (if design_decisions specifies).
- Assert all text is readable (font-size >= 12px on body text).

## Implementation

`scripts/runtime-sweep.ts` drives the browser. Outputs:
```
.monolith-runs/<runId>/qa/
├── runtime-report.json           ← machine-readable issue list
├── runtime-report.md             ← human-readable summary
├── screenshots/
│   ├── <route>-<viewport>.png
│   └── ...
├── console-errors.jsonl          ← every console error with route + stack
└── interaction-log.jsonl         ← every click + assertion result
```

## Failure modes and their issue categories

| Observation | Issue category | Blocker? |
|---|---|---|
| Route returns 500 or console error | `route-error` | Yes |
| Button has no handler and not disabled | `dead-button` | Yes |
| Two nav items active | `nav-state` | Yes |
| Horizontal scroll at 1024+ | `responsive` | Yes |
| Content clipped by overflow | `overflow` | Yes |
| Modal doesn't trap focus | `accessibility` | Yes |
| Form submit dead | `form-wiring` | Yes |
| Missing focus ring | `accessibility` | Major |
| Scroll jumps on collapsible open | `alignment` | Minor |

All blocker-severity issues go to self-healer. Major and minor accumulate into the QA report but don't block unless total count > 10.

## Integration with orchestrator

Runtime verification runs:
1. After `developer` emits code.
2. After `dev-qa` passes (no point running Playwright if tsc fails).
3. Before `design-qa` (visual QA is cheaper when runtime is known-good).

If runtime-inspector finds blocker issues, it returns them to the self-healer, which re-invokes the developer with a scoped patch brief. See [self-healing-loop.md](self-healing-loop.md).

## Minimum tooling

The run's app `package.json` gets, as dev dependencies:
```json
{
  "playwright": "^1.x",
  "@playwright/test": "^1.x"
}
```

The orchestrator installs them after the developer emits `package.json` and before runtime-inspector runs.

## What if the dev server won't boot?

- dev-qa already tries to boot the dev server and reports failure.
- If the server is dead, runtime-inspector emits a single `route-error` blocker with the dev-server error in its `observation` field and does not attempt to visit routes.
- Self-healer gives that single blocker to the developer, who fixes the boot error, and runtime-inspector retries.

## Why this isn't a nice-to-have

Every bug the user surfaced in the reference run was a runtime-only bug. Static QA passed. Design QA scored 8.5/10. Both were blind to:
- Nav matching multiple routes
- A button with no handler
- Flexbox gap-0 on a label next to an input
- ScrollArea clamping pipeline expansion

Runtime verification is the gate that would have caught all four. Without it, nothing else can.
