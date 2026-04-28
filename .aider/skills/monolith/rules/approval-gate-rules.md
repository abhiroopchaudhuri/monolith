# Rule 6 — Approval Gates

> The pipeline stops three times. No progress past a gate without explicit user consent. This is the contract.

## Why this rule exists

LLMs are excellent at producing confident-looking work and advancing. Left unchecked, an eight-stage pipeline produces eight stages of drift. The gates exist to (a) let the user redirect early, (b) make divergence from intent discoverable before it compounds, (c) preserve the user's sense of control.

Removing a gate to "go faster" is a footgun.

## The three gates

### G1 — Input

**After:** triage (Stage 0).

**Why here:** Downstream work assumes a DS exists, guidelines exist, and the prompt type is classified correctly. A wrong assumption at triage corrupts everything.

**Shown to user:**
- The full `input-manifest.json`, pretty-printed.
- Any `unresolved[]` entries highlighted with the specific question.
- Any warnings (website unreachable, adapter outdated, etc.).

**Accepted responses:**
| Response | Action |
|---|---|
| `ok` / `proceed` / `yes` | Advance to Stage 1. |
| `change <field> to <value>` | Patch manifest, re-show, re-ask. |
| `abort` / `stop` | Set `state.meta.status = "aborted"`. End run. |
| Silent hold | Keep waiting. Do not progress. |

### G2 — Plan

**After:** engineering-manager (Stage 7).

**Why here:** Before writing any code, the user should see the shape of the product — research, PRD, IA, design, build specs — and be able to redirect with minimal waste.

**Shown to user:** A single condensed summary:
```
# <runId> — plan summary

Brief: <one line>
DS: <name> via <source>
Guidelines: <N> provided / <M> inferred

Research
  Personas: <N>  (<name1>, <name2>, …)
  JTBDs: <N>
  Prior art: <N>
  Risks: <N>
Full doc → docs/research.md

PRD
  User stories: <N>  MVP items: <M>
  Metrics: <L> leading / <G> lagging
Full doc → docs/prd.md

IA + User flow
  Pages: <N>  Routes: <R>
  Flows: <H> happy + <A> alt
  Empty/error/loading coverage: <x>/<N>
Full docs → docs/information_architecture.md, docs/user_flow.md

Design decisions
  Sections: <S>
  DS picks: <X>  Pattern reuses: <Y>  Custom proposals: <Z>
  Blockers: <list or none>
Full doc → docs/design_decisions.md

Build specs
  Files: <N>  Custom components: <C>  Fixtures: <F>
Full doc → docs/build_specs.md
```

**Accepted responses:**
| Response | Action |
|---|---|
| `ok` / `go` | Advance to Stage 8. |
| `iterate on <doc>: <delta>` | Re-invoke owning agent with delta. Update only that doc + any strictly downstream docs that change. Re-G2. |
| `restart from <stage>` | Re-invoke from that stage onward. |
| `abort` | Stop. Keep artifacts. |

### G3 — Delivery

**After:** design-qa (Stage 11) + consolidation.

**Why here:** The prototype is running, the QA reports are in. User decides: accept, iterate on something specific, or log known-incomplete.

**Shown to user:**
- DELIVERY.md summary (run summary, localhost URL, blockers, warnings).
- Links to both QA reports.
- Patterns promoted.
- Exact Phase 2 handoff command.

**Accepted responses:**
| Response | Action |
|---|---|
| `accept` | Close the run cleanly. Print Phase 2 handoff. Mark writes.log as complete. |
| `iterate on <stage>: <delta>` | Re-run the named stage + every stage downstream of it. |
| `log` | Treat as accepted but mark DELIVERY.md header `status: known-incomplete`. Print handoff anyway. |
| `abort` | Stop. Do not delete. Mark `status: aborted`. |

## How responses are interpreted

The orchestrator is conservative: if the response isn't clearly in one of the accepted buckets, it asks again rather than guessing.

Examples:
- "looks fine" → ambiguous. Ask: "`ok` to proceed, or specify an iteration?"
- "change the DS" → at G1, fine. At G2, requires restart from Stage 1. Confirm before re-running.
- "the PRD is too long" → at G2, interpret as `iterate on prd: shorten`. Confirm before doing.
- Any gate answer with a sarcasm / irony tone → ask explicitly. Do not assume.

## What the orchestrator must NOT do

- **Not** advance on silence.
- **Not** re-run a full pipeline when a single-stage iteration was requested.
- **Not** discard earlier artifacts without explicit instruction (iteration updates, does not delete; restart from stage N zeros out from N onward but keeps 0..N-1).
- **Not** present a gate without the condensed summary — the summary IS the gate. Asking "approve?" with no summary is a violation.

## Iteration economics

At each gate, the user should have a mental model of:
- What re-running this stage costs (time).
- What downstream stages will re-run.
- What artifacts will be overwritten.

The orchestrator MUST print this before accepting an iteration:

```
Iterating on: prd
Will re-run: product-manager.
Downstream stages that will ALSO re-run: ux-architect, lead-designer, engineering-manager.
Artifacts overwritten: docs/prd.md, docs/information_architecture.md, docs/user_flow.md,
                       docs/design_decisions.md, docs/best_practices.md, docs/build_specs.md.
Patterns folder: not affected.
Proceed? (y/n)
```

Only then does the iteration begin.

## No implicit gates

Some prior skill versions had implicit gates ("if the plan looks weird, pause"). This is explicitly rejected. Only G1, G2, G3. Every other stage advances automatically on its success gate.

## G3 exceptions

If Stage 10 (dev-qa) produces a BUILD or SERVER gate failure, the orchestrator pauses before Stage 11 (design-qa) and asks the user: run design-qa on the broken app, or iterate on developer first? This is a de-facto G2.5 that only fires on critical dev-qa failures.
