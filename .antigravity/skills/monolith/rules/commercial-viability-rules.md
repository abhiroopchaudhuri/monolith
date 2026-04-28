# Rule — Commercial Viability

The app isn't done when it works. It's done when it could plausibly be **sold or adopted** — by a buyer, by a user, by a team. This rule names the commercial surfaces every run must address and sets the gate before G3 opens.

## Why

A workflow focused purely on functional correctness produces apps that demo well and convert poorly. Real products win on:
- First-minute experience (does the user understand what this is and what it's for?)
- Path-to-value (how quickly does the user see something worth coming back for?)
- Retention hooks (what makes them return tomorrow?)
- Trust signals (what makes a buyer believe this is safe to adopt?)
- Expansion surfaces (where does the relationship grow — more users, more data, paid tier?)

These are product decisions, not design decisions, but they affect every screen.

## The five commercial surfaces

### 1. Onboarding — "I get it" moment

Every run must have a defined first-time user (FTU) path. For an internal tool: the path from "account created" to "completed first real task." For a consumer product: "landed" to "committed signup." For a B2B SaaS: "trial started" to "invited a teammate."

The FTU path is:
- Documented in `docs/information_architecture.md § First-time user flow`.
- Exercised by runtime-inspector (visit cold, follow the path, capture screenshots).
- Graded by commercial-auditor: "Does a new user understand what to do within 60 seconds?"

### 2. Conversion — where it matters

If the product has any conversion event (signup, upgrade, purchase, invite, start-trial, request-demo), that event must:
- Be reachable from the primary route in ≤2 clicks.
- Have a clear value proposition at the moment of ask (not just a "Buy" button).
- Have a dismissal path that doesn't feel coercive.

For internal tools without conversion, this surface is optional. commercial-auditor marks it `n/a` with reasoning.

### 3. Retention hooks — why come back

For any recurring-use product:
- Is there a moment of reward on return? (Fresh data, progress visible, new activity summary.)
- Is there persistent state the user cares about? (Saved views, assigned work, pinned items.)
- Does returning feel easier than starting over? (Auth persistence, last-viewed continuity, smart defaults.)

For one-shot products (e.g., a tax filer), this surface is optional with reasoning.

### 4. Trust signals — buyer confidence

What makes this product believable as something to adopt?
- **Data integrity**: audit trails, change history, undo paths where reversibility matters.
- **Security posture**: visible auth state, permission indicators, sensitive-action confirmations.
- **Compliance markers**: where the domain requires them (HIPAA, SOC 2, GDPR), visible acknowledgment.
- **Support access**: a path to help that isn't "email us" — docs, in-app search, contextual hints.

Different domains emphasize different signals. A clinical tool overindexes on audit + compliance. A creative tool overindexes on undo + history. A financial tool overindexes on explicit confirmation + receipts.

### 5. Expansion surfaces — where relationship grows

If applicable:
- **Seat expansion**: invite teammates, share views, assign work.
- **Data expansion**: integrations with other tools the user already uses.
- **Feature expansion**: upsell path to a paid tier with clear value differentiation.
- **Use-case expansion**: "once you've done X, you can do Y" discoverability.

For internal tools, "expansion" might mean "more departments adopting" — then the signal is organizational portability (easy admin, clear rollout path).

## How it's enforced

### commercial-auditor agent

Runs after design-qa, before G3. Per surface, emits:
- Finding (present / partial / absent / not-applicable).
- Severity (blocker / major / minor).
- Evidence (screenshot references or ia references).
- Remediation (specific instructions).

Blockers feed the self-healing loop.

### Per-run commercial audit

Output: `<runRoot>/docs/commercial-audit.md` with a severity-graded finding list.

Example finding:
```
## F-02 — Retention hook missing on Worklist

Surface: Retention hooks (surface 3)
Severity: Major
Observation: Worklist screen shows static assigned patients with no indication
  of recency, progress, or new activity. User returning tomorrow sees the same
  list with no reason to re-engage.
Evidence: runtime-inspector screenshot /worklist-1440x900.png
Remediation: Add an activity summary above the table showing "N new assignments
  since your last visit" with a dismissible banner. Add a subtle timestamp on
  each row ("added 2h ago") that makes recency scannable. This maps to
  differentiator D-03 (speed-to-value) and reinforces why the user returns.
```

### Integration with differentiators

Every differentiator in differentiation-map.md must be checkable against at least one commercial surface. A "transparency" differentiator should show up in onboarding ("here's what we show you that no one else does") and trust ("audit trail per decision"). A "speed" differentiator should show up in conversion ("set up in 5 minutes").

If a differentiator has no commercial-surface expression → revision required. The differentiator is either not real or not being surfaced.

## Domain-specific exemptions

Not every product needs all five surfaces. Triage declares one of:
- `consumer-saas` — all five surfaces expected.
- `b2b-saas` — all five, with emphasis on trust + expansion.
- `internal-tool` — onboarding + retention + trust required; conversion + expansion optional with reasoning.
- `regulated-tool` (clinical, financial, legal) — trust dominates; conversion usually n/a.
- `developer-tool` — onboarding + retention required; trust = "works as documented."

commercial-auditor uses the declared product type to skip surfaces legitimately, not silently.

## Anti-patterns

- Commercial audit that says "N/A" for all five surfaces without reasoning.
- Trust signals that are just "we use HTTPS."
- Onboarding that shows a 5-step tour but no completed real task.
- Retention hooks that are "email reminders" (out-of-app, not designed here).
- Expansion surfaces that are paid-tier CTAs without value differentiation ("Upgrade for more").

## Success gate

- `commercial-audit.md` exists.
- Each of the five surfaces has a grade (present / partial / absent / n/a-with-reason).
- 0 blocker findings at G3 (or explicit user waiver).
- Every differentiator maps to at least one commercial surface.

## Related

- [agents/commercial-auditor.md](../agents/commercial-auditor.md)
- [rules/differentiation-mandate.md](differentiation-mandate.md)
- [rules/ui-excellence-standard.md](ui-excellence-standard.md)
