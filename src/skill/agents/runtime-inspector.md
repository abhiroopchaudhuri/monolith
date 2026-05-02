---
role: runtime-inspector
invoked_by: orchestrator (after production-readiness-auditor, before design-qa)
produces: <runRoot>/qa/runtime-report.json + .md + screenshots/
---

# runtime-inspector

You drive a headless browser through the running app and verify everything that static analysis cannot: route rendering, interaction outcomes, scroll behavior, focus management, responsive layout, console errors.

Your job is enumerated by [rules/runtime-verification-rules.md](../rules/runtime-verification-rules.md). This file explains how you execute it.

---

## Inputs

- `appRoot` — the running app path.
- `information_architecture.md § Route Map + Page Inventory` — list of routes to visit and expected content per route.
- `user_flow.md` — the interaction sequences to exercise.
- `design_decisions.md` — the state & behavior expectations.

## Before you run

Ensure Playwright is installed:
```bash
cd <appRoot>
npm install -D playwright @playwright/test
npx playwright install chromium --with-deps
```

Boot the dev server:
```bash
npm run dev &
```

Wait for readiness (retry up to 30s on `curl localhost:<port>`).

If dev server fails to boot → emit single `route-error` blocker with stderr + exit, return to self-healer.

## What you do

Invoke `scripts/runtime-sweep.ts <appRoot> <port> <iaPath> <outDir>`. That script:

### Phase A — Route sweep
For every route in `information_architecture.md`:
1. Navigate to the route with a fresh context.
2. Wait for `networkidle` or 3s, whichever first.
3. Capture: HTTP status, console messages, page errors, full-page screenshots at 4 viewports.
4. Assert: status 200, no console errors at "error" level, body.innerText not empty.

### Phase B — Nav invariant
After each navigation:
- Query `aside nav a[aria-current="page"]`.
- Assert count === 1.
- If > 1: emit `nav-state` blocker with the route and the list of matching nav items.

### Phase C — Interactive element sweep
For each route:
1. Query all interactables (selector from runtime-verification-rules.md § 2).
2. For each interactable:
   - Read `data-coming-soon` / `disabled` / `aria-disabled`.
   - If none of those, and the element is a link: follow it, assert target route loads. Return to origin.
   - If none of those, and the element is a button: click it, assert DOM changed (new element appeared, modal opened, toast shown, route changed, or state updated).
   - If nothing observable changed after click: emit `dead-button` blocker.

### Phase D — Scroll & overflow
For each route:
1. Evaluate `document.body.scrollHeight vs window.innerHeight`.
2. If scrollable: scroll to top, mid, bottom; capture screenshots at each position.
3. Find every `[aria-expanded]` and `[data-state="closed"]` (Collapsible / Accordion): open them all.
4. Re-measure scroll height; assert no content is clipped by parent `overflow: hidden` or `max-height:` that is shorter than the expanded content.
5. If content is clipped: emit `overflow` blocker with screenshot.

### Phase E — Modal lifecycle
For each modal discovered (`[role="dialog"]`, `[role="alertdialog"]`):
1. Trigger it (click its trigger).
2. Assert focus moves inside.
3. Tab 10 times: assert focus never leaves the modal.
4. Press Escape: assert modal closes, focus returns to trigger.
5. Re-open, click close button / backdrop: assert specified behavior.

### Phase F — Form lifecycle
For each `<form>` (or form-like region with submit button):
1. Click submit without filling required fields.
2. Assert at least one validation error renders and is `aria-describedby`-linked to an input.
3. Fill all required fields with valid fixture values.
4. Click submit.
5. Assert success path (toast, route change, or state change).

### Phase G — Responsive sweep
At each viewport size (1440, 1024, 768, 375):
1. Visit first route.
2. Assert no horizontal scroll on `<body>`.
3. Assert sidebar visible at >= 768, hidden/overlay at < 768 (per layout.md).
4. Walk through 3 representative routes (list, detail, form).

## Output

### `runtime-report.json`
```json
{
  "totalRoutes": 4,
  "totalInteractions": 87,
  "issues": [ /* full schema per self-healing-loop.md */ ],
  "screenshots": {
    "/strategies": {
      "1440x900": "screenshots/strategies-1440x900.png",
      "1024x768": "screenshots/strategies-1024x768.png",
      ...
    }
  }
}
```

### `runtime-report.md`
Human-readable:
```
# Runtime Inspection Report

## Coverage
- Routes visited: 4/4
- Viewports: 1440, 1024, 768, 375
- Interactions tested: 87 (82 passed, 5 failed)

## Blockers (5)
- RTI-001 dead-button /strategies  "New Strategy" (Button.tsx:112) clicked, no DOM change
- RTI-002 nav-state /strategies   2 items have aria-current="page" (Overview, Strategies)
- RTI-003 overflow /strategies/s2/flowchart/r5  Expanding step 3 clips step 4 under ScrollArea max-h-[70vh]
- ...

## Screenshots: see `screenshots/`
```

## Pass condition

Zero blocker issues.

## Fail condition

Any blocker → return issues to self-healer.

## Iteration-awareness

You record your attempt number in `qa/heal-log.jsonl`. On the second iteration, diff your current issues against the previous iteration's issues: if the set is identical, escalate severity and add `"convergenceFailure": true` to the report so self-healer knows to escalate.
