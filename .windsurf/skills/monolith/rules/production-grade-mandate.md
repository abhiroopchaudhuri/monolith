# Rule — Production-Grade Mandate

**"MVP" and "prototype" are not acceptance criteria.** Every run ships production-ready code. This rule defines what that means in terms you can audit.

## Why this rule exists

The previous implicit contract was "build a credible prototype." Under that contract, reviewers found:
- Dead buttons (`New Strategy` with no handler)
- Nav state bug (two items active simultaneously due to `end` prop misuse)
- Broken flex alignment (form labels detached from their controls)
- Unscrollable pipeline (ScrollArea with hard max-height clipped expanded content)
- Hardcoded demo-only buttons in production flows

All of those are visible on first interaction. "MVP" let them ship. This rule makes them blockers.

## The definition

A run is production-grade when **every one of these is true**, verified by automation before G3 opens:

### 1. Every interactive element works
- Every `<Button>`, `<a>`, `<button>`, `<Link>`, kebab item, menu item, tab trigger either:
  - Has a real handler (`onClick`, `onValueChange`, `onSelect`, `href`, `to`), OR
  - Is marked `disabled` with a tooltip explaining why, OR
  - Is marked with `data-coming-soon="true"` **and** wired to a consistent "coming soon" toast
- A button rendered without one of these three is a `DEAD_BUTTON` blocker.

### 2. Every route resolves and renders
- Visiting every route in a headless browser produces a 200, no console error, no unhandled promise rejection, no uncaught exception.
- Deep links work: `/strategies/:id/flowchart/:runId` loads correctly from a cold URL.

### 3. Nav state is correct
- Exactly **one** nav item is `aria-current="page"` per viewport.
- `react-router` `NavLink` uses `end` correctly: `end` is only for routes where the exact path should match without children.
- Audited by the production-readiness-auditor at every route.

### 4. Layout is robust at min + max viewport
- Test at **1440×900** (desktop), **1024×768** (laptop), **768×1024** (tablet), **375×812** (mobile).
- No horizontal overflow.
- No element clipped when its container expands (collapsibles, accordions, expanded rows).
- Fixed/sticky headers, sidebars, and footers do not overlap content.

### 5. Every state is reachable
- Loading, empty, error, "one item", "many items" — each rendered in the UI and captured as a screenshot.
- Error state cannot be "the ui we never built"; it must exist as code and be triggerable.

### 6. Every form is real
- Inputs have labels.
- Required fields validate.
- Submit is either wired or marked `data-coming-soon`.
- Validation errors render in a `FormMessage` (or the DS equivalent), linked via `aria-describedby`.

### 7. Every fixture is shaped like a real API response
- Fixtures match the schema a real backend would return.
- Counts are internally consistent (flowchart step counts add up correctly).
- Dates are in a single format per fixture file (ISO 8601 preferred).
- Names are realistic domain-appropriate strings. No "Foo Bar" or "Test 1".

### 8. Everything is keyboard + screen-reader accessible
- All focusable elements have a visible focus ring.
- All icon-only buttons have `aria-label`.
- All tables have `<caption>` (sr-only if visual-only).
- All modals trap focus and return focus on close.
- Respect `prefers-reduced-motion`.

### 9. No "demo" scaffolding in production flows
- No buttons labeled "Demo: X" or "Test: Y" in the main UI.
- If a feature requires a demo trigger to be reachable (e.g. a modal that normally fires from a backend), put the trigger in a clearly-marked **Developer Tools** drawer that is hidden unless `?dev=true` is in the URL.

### 10. No dead fixtures or dead imports
- Every imported symbol is used.
- Every fixture file is referenced somewhere.
- Every pattern listed in `INDEX.md` is used in at least one run's code.

## How this is enforced

Three new agents run before G3:
1. **production-readiness-auditor** — static analysis against the ten criteria above.
2. **runtime-inspector** — headless-browser sweep of every route + every interactive element.
3. **self-healer** — feeds violations back to the developer for a scoped re-edit, re-runs auditor + inspector, iterates up to 5 times before blocking.

See `rules/self-healing-loop.md` for the iteration contract.

## What this rule is not

- Not "gold-plate everything." Don't add features that aren't in the plan.
- Not "every possible state for every possible input." Just the states named in `information_architecture.md`.
- Not "animate everything beautifully." Motion rules still cap the animation budget.

Production-grade means: a user could open this app, use it, and nothing would feel broken, confusing, or half-done. It does not mean "the app is feature-complete beyond the PRD."

## Forbidden phrases in generated docs and code comments

- "MVP" — say "Release 1 scope" instead, reference PRD § number
- "for now" — either do it or don't; document the trade-off explicitly
- "TODO" — either do it in this run or log it as a known-incomplete item in DELIVERY.md
- "placeholder" — use `data-coming-soon` with a toast; no silent dead buttons
- "this is just a prototype" — the answer is no, it's not

If the developer or designer finds themselves typing one of these, stop and escalate via the self-healing loop.

## Related

- [rules/self-healing-loop.md](self-healing-loop.md)
- [rules/runtime-verification-rules.md](runtime-verification-rules.md)
- [agents/production-readiness-auditor.md](../agents/production-readiness-auditor.md)
- [agents/runtime-inspector.md](../agents/runtime-inspector.md)
