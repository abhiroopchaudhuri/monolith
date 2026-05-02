# Rule 6 — Approval Gates (v3.3 turn-based)

> The pipeline stops three times. No progress past a gate without explicit user consent. G2 and G3 are **turn-yielding** — the orchestrator outputs a message and STOPS. No background work. The user replies on the next turn. This is the contract.

## Why this rule exists

LLMs are excellent at producing confident-looking work and advancing. Left unchecked, an eight-stage pipeline produces eight stages of drift. The gates exist to (a) let the user redirect early, (b) make divergence from intent discoverable before it compounds, (c) preserve the user's sense of control.

Removing a gate to "go faster" is a footgun.

In v3.3 the gates were rewritten as **turn yields** instead of blocking event-loops or background-threaded approvals (the original v3 idea). Turn yielding is the natural UX for chat-based AI editors and removes the need for any background process management.

## The three gates

### G1 — Input (blocking)

**After:** triage (Stage 1).

**Why here:** Downstream work assumes a DS exists, guidelines exist, and the prompt type is classified correctly. A wrong assumption at triage corrupts everything. G1 is the only gate that MUST block — the pipeline cannot proceed with wrong inputs.

**Shown to user:**
- The full `state.input.manifest`, pretty-printed.
- Any `unresolved[]` entries highlighted with the specific question.
- Any warnings (website unreachable, adapter outdated, themeability fallback active, etc.).

**Accepted responses:**
| Response | Action |
|---|---|
| `ok` / `proceed` / `yes` | Advance to Track A. |
| `change <field> to <value>` | Patch manifest, re-show, re-ask. |
| `rename app to <name>` | Update `state.meta.appName` + `<appRoot>` resolution. |
| `abort` / `stop` | Set `state.meta.status = "aborted"`. End run. |
| Silent hold | Keep waiting. Do not progress. |

`--lazy` mode auto-approves G1 after a 30-second visible countdown IFF `unresolved[]` is empty.

### G2 — Plan (turn-yielding)

**After:** engineering-manager (Track C completes; just before pattern-decider).

**Why here:** Before writing any code, the user should see the shape of the product — research, PRD, IA, design, build specs — and be able to redirect with minimal waste.

**Mechanism:**

1. The orchestrator runs `tsx scripts/render-planning-review.ts` to write `.monolith/scratchpad/PLANNING_REVIEW.md`.
2. The orchestrator outputs a yield message (template below) and **STOPS**. No background work begins. No code is generated.
3. The user reads `PLANNING_REVIEW.md`. They may freely edit any file under `.monolith/scratchpad/` directly (`prd.md`, `design_decisions.md`, etc.).
4. On the next turn, the user replies. The orchestrator runs `tsx scripts/scratchpad-lifecycle.ts detect-edits` to compare scratchpad file hashes against the snapshots stored in `state.artifacts.<name>.lastModified`.
5. If edits detected → mark the owning phase + downstream phases `pending` and re-run them.
6. If `continue` → proceed to `pattern-decider`.

**Yield message:**

```
[G2 — Plan Review]

I've drafted the complete plan. Review it here:
→ .monolith/scratchpad/PLANNING_REVIEW.md

Individual docs you can edit directly:
→ .monolith/scratchpad/prd.md
→ .monolith/scratchpad/differentiation-map.md
→ .monolith/scratchpad/design_decisions.md
→ .monolith/scratchpad/build_specs.md
→ ... (full list in PLANNING_REVIEW.md § Artifact map)

Reply with:
- "continue" — proceed to code generation (any scratchpad edits will be detected)
- "iterate on <doc>: <delta>" — I'll update that doc and re-run downstream
- "restart from <phase>" — restart from that phase
- "abort" — stop the run
```

**Accepted responses:**
| Response | Action |
|---|---|
| `continue` / `ok` / `go` | Detect edits via `scratchpad-lifecycle.ts detect-edits`; re-run dirty phases; advance to pattern-decider. |
| `iterate on <doc>: <delta>` | Re-invoke owning agent with delta. Cascade to strictly-downstream phases. Re-show G2 yield. |
| `restart from <phase>` | Set state.phases from that phase onward to `pending`. Re-run. Re-show G2 when done. |
| `abort` | Stop. Keep `.monolith/state.json` and scratchpad intact for forensics. |

`--lazy` mode auto-replies `continue` IFF `scratchpad-lifecycle.ts detect-edits` reports no user edits.

### G3 — Delivery (turn-yielding)

**After:** the unified QA loop converges (or hits the 5-iteration cap with escalation).

**Why here:** The prototype is running, the QA reports are in. User decides: accept, iterate on something specific, or abort.

**Mechanism:**

1. The orchestrator writes `<workspaceRoot>/<appName>/DELIVERY.md`.
2. Outputs a yield message and **STOPS**. The dev server keeps running.
3. On the next turn, user replies.

**Yield message:**

```
[G3 — Delivery]

App running at http://localhost:<port>
Run command: cd <appName> && npm run dev

Self-healing summary:
- dev-qa: <N> iterations → clean
- production-readiness: <N> iterations → clean
- runtime-inspector: <N> iterations → clean
- design-qa: <N> iterations → clean
- commercial-auditor: <N> iterations → clean

Reply with:
- "accept" — finalize (archive scratchpad to .monolith/archive/<runId>/, cleanup)
- "iterate on <stage>: <delta>" — fix something specific
- "abort" — stop, keep everything as-is
```

**Accepted responses:**
| Response | Action |
|---|---|
| `accept` | Run `scratchpad-lifecycle.ts archive --runId <id>` then `clear`. Set `state.meta.status = "completed"`. Print Phase 2 handoff. |
| `iterate on <stage>: <delta>` | Re-run that stage + every stage strictly downstream. Re-show G3 when done. |
| `abort` | Set `state.meta.status = "aborted"`. Keep state + scratchpad intact. |

There is **no auto-approve timeout** in v3.3. The original plan considered a 5-minute auto-accept; that was rejected in favor of explicit turn yielding because chat editors do not have a reliable timer surface.

`--lazy` does NOT auto-approve G3 — delivery always requires explicit user acknowledgment.

## How responses are interpreted

The orchestrator is conservative: if the response isn't clearly in one of the accepted buckets, it asks again rather than guessing.

Examples:
- "looks fine" → ambiguous. Ask: "`continue` to proceed, or specify an iteration?"
- "change the DS" → at G1, fine. At G2, requires `restart from triage`. Confirm before re-running.
- "the PRD is too long" → at G2, interpret as `iterate on prd: shorten`. Confirm before doing.
- Any gate answer with a sarcasm / irony tone → ask explicitly. Do not assume.

## What the orchestrator must NOT do

- **Not** advance on silence.
- **Not** run background work while waiting at G2 or G3 (turn-based only).
- **Not** re-run a full pipeline when a single-stage iteration was requested.
- **Not** discard earlier artifacts without explicit instruction (iteration updates, does not delete; restart from phase N zeros out from N onward but keeps prior phases).
- **Not** present a gate without the condensed summary or scratchpad pointer — the summary IS the gate.

## Iteration economics

At each gate, the user should have a mental model of:
- What re-running this stage costs (time).
- What downstream stages will re-run.
- What artifacts will be overwritten.

The orchestrator MUST print this before accepting an iteration:

```
Iterating on: prd
Will re-run: product-manager.
Downstream phases that will ALSO re-run: ux-strategist, ux-architect, lead-designer,
                                          design-principal, aesthetic-director, ux-writer,
                                          engineering-manager.
Artifacts overwritten in scratchpad: prd.md, differentiation-map.md,
                                     information_architecture.md, user_flow.md,
                                     design_decisions.md, best_practices.md,
                                     design-principal-critique.md, aesthetic-audit.md,
                                     ux-writing-pass.md, build_specs.md.
Patterns folder: not affected.
Cache: research + market-research likely still valid (fingerprints).
Proceed? (y/n)
```

Only then does the iteration begin.

## No implicit gates

Some prior skill versions had implicit gates ("if the plan looks weird, pause"). This is explicitly rejected. Only G1, G2, G3. Every other phase advances automatically on its success criterion.

## G3 exceptions

If `dev-qa` produces a BUILD or SERVER gate failure during the unified QA loop, the orchestrator pauses before invoking runtime-inspector / design-qa / commercial-auditor (those depend on a running app) and asks the user: run partial QA on the broken build, or iterate on developer first? This is a de-facto G2.5 that only fires on critical dev-qa failures.

## Mode flags interaction

| Flag | G1 | G2 | G3 |
|---|---|---|---|
| `--full` (default) | blocking | turn yield | turn yield |
| `--lazy` | auto-approve if `unresolved[]` empty | auto-`continue` if no scratchpad edits | always interactive |
| `--planOnly` | blocking | turn yield, then STOP after `accept` | n/a (no code generation) |
| `--themeOnly` | blocking | n/a | n/a — finishes after theming-resolver with theme-spec.json |
| `--UXR` | blocking | n/a | n/a — finishes after researcher with research.md |
| `--noPRD` | blocking | turn yield (no PRD section) | turn yield |

See `SKILL.md § Invocation` for the user-facing description of each flag.
