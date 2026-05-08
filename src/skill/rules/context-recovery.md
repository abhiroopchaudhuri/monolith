# Rule 27 — Context Recovery (pipeline persistence through context compaction)

> **Why this rule exists.** Context compaction strips the live pipeline execution frame from the AI's working memory. When a session hits context limits, the compacted summary describes work in past tense ("The build is approximately 40% complete") without signalling "you are inside a running pipeline at step N." Without explicit recovery machinery, the AI falls back to "write code directly" behavior and bypasses the entire orchestrator framework.
>
> **Headline rule.** The orchestrator writes `.monolith/RESUME.md` after every phase transition. Every orchestrator turn ends with a one-line recovery signal. On startup, before running any pipeline step, the orchestrator checks `.monolith/state.json` for an active run and auto-resumes if found.

---

## Part 1 — The problem (root cause analysis)

When the AI session hits context limits, Claude Code compacts the conversation into a plain-text summary. That summary:

- Describes work done in past tense ("market research complete, design approved, build ~40% done")
- Does **not** signal "you are executing `/monolith` at orchestrator step 13"
- Does **not** reactivate the skill's execution frame or the orchestrator's governing instructions
- May include the line "The skill instruction was marked as invoked earlier in this session — do NOT re-execute" — which further signals to the AI that it should NOT follow the pipeline

The AI then reads the next user message ("continue") as a task handoff and writes code directly.

The gap: `.monolith/state.json` already contains full pipeline position, but the orchestrator has no startup check that reads it before deciding how to behave.

---

## Part 2 — The RESUME.md breadcrumb

After every phase transition, the orchestrator MUST write `.monolith/RESUME.md`, overwriting the previous version:

```markdown
<!-- MONOLITH_PIPELINE_ACTIVE -->
# Active Monolith Run — Context Recovery Required

> An active monolith pipeline is in progress. If you lost prior context, do NOT write
> code directly and do NOT skip the orchestrator. Resume the pipeline instead.

Run ID:       {{runId}}
Brief:        {{brief}}
Started:      {{state.meta.createdAt}}
Status:       IN_PROGRESS
Phase:        {{currentPhase}} ({{phasesCompleted}} of 17 done)
Last done:    {{lastDonePhase}}
Next action:  {{nextPendingAction}}
Gate waiting: {{activeGate or "none — mid-pipeline"}}

Recovery:
1. Read `.monolith/state.json` — find `state.meta.runId` + last `"done"` phase
2. Reload orchestrator spec: `{{workflowRoot}}/agents/orchestrator.md`
3. Run the pre-flight check (Rule 27 Part 4) to auto-resume

Quick resume: /monolith --resume {{runId}}

State file:   .monolith/state.json
Orchestrator: {{workflowRoot}}/agents/orchestrator.md
```

**Write timing:**
- First write: immediately after `stateManager.init()` (step 0), before G1
- Update: after EVERY phase status transition to `done`, `skipped`, or `failed`
- Update: when entering or exiting each gate (G1/G2/G3)
- Delete: on G3 `accept` only — once the run is complete there is nothing to recover

**The breadcrumb is NOT a run artifact.** It is never tracked in `state.artifacts`, never mentioned in `DELIVERY.md`, and never archived. It exists solely as a recovery signal.

---

## Part 3 — Per-turn recovery signal footer

Every orchestrator output turn MUST end with this single-line footer, separated by a blank line:

```
[PIPELINE: {{runId}} | Phase: {{currentPhase}} | Done: {{N}}/17] — to resume after context loss: /monolith --resume {{runId}}
```

This footer is written as plain text in the AI's output, not inside a tool call. Text in AI output survives into compacted summaries more reliably than tool-call results. A compaction system that includes this line gives the next AI invocation a machine-parseable anchor it can act on.

---

## Part 4 — Orchestrator startup check (pre-flight)

**This check runs before step 0 and before any other action.**

```
PRE-FLIGHT:
1. Check if `.monolith/state.json` exists in the workspace root.
2. If it exists:
   a. Read `state.meta.status`.
   b. If status === "in-progress":
      → Context recovery event detected.
      → Display RECOVERY BANNER (see below).
      → Execute resume protocol (Part 7).
      → Do NOT re-initialize state.json. Stop step 0.
   c. If status === "completed" or "aborted":
      → Prior run is done. Proceed as a new run.
3. If `.monolith/state.json` does not exist:
   → No active run. Proceed normally from step 0.
```

**RECOVERY BANNER** (print when in-progress run detected):

```
[CONTEXT RECOVERY DETECTED]

Found an active monolith run that was interrupted.

Run ID:      {{state.meta.runId}}
Brief:       {{state.input.manifest.brief}}
Started:     {{state.meta.createdAt}}
Last phase:  {{lastDonePhase}}
Resuming →   {{nextPendingPhase}}

Continuing pipeline from last completed phase...
─────────────────────────────────────────────────
```

After displaying the banner, proceed directly with the resume protocol. Do not ask the user to re-invoke `/monolith --resume` — auto-resume silently.

---

## Part 5 — Context compaction detection heuristic

Even without an explicit `--resume` flag, the orchestrator MUST detect context compaction if ALL of the following are true simultaneously:

1. `.monolith/state.json` exists with `state.meta.status === "in-progress"`
2. The current conversation turn has no active orchestrator step log (i.e., no prior step-by-step output from the current run)
3. The most recent user message is a continuation cue: `"continue"`, `"proceed"`, `"go ahead"`, `"ok"`, `"yes"`, `"resume"`, or similar

If all three are true: treat as context compaction, display RECOVERY BANNER, auto-resume.

If only (1) is true and the user message is not a continuation cue: ask explicitly:
```
Found an in-progress run ({{runId}}). Did you want to:
- "resume" — continue from {{nextPendingPhase}}
- "new run" — start fresh (the old run will be marked aborted)
```

---

## Part 6 — What NOT to do on context recovery

- **Never** re-initialize `.monolith/state.json` when an in-progress run exists — this destroys run history, fingerprints, and QA heal-log.
- **Never** re-run completed phases — their outputs already exist in the state tree and scratchpad.
- **Never** fall back to "write code directly" because the compacted summary says "build is N% complete."
- **Never** skip to `developer` without running `pattern-decider` first, even if the summary implies code generation was the last step.
- **Never** ignore `.monolith/RESUME.md` if it exists.
- **Never** treat the compacted summary as the authoritative pipeline position — `.monolith/state.json` always wins.

---

## Part 7 — Resume protocol

On resume (auto-detected or explicit `--resume <runId>`):

1. Read `state.phases.*` to find the last `"done"` phase and the first non-`"done"` phase.
2. The first non-`"done"` phase is the resume point.
3. Special cases by phase status at resume point:
   - `"active"` (mid-execution when context was lost): re-run the phase from scratch.
   - `"pending"` (not yet started): run normally.
   - `"failed"`: re-attempt (same as the normal fail mode in orchestrator fail-modes table).
4. Gate states:
   - If `state.meta.activeGate === "g1"`: re-display G1 yield message, wait.
   - If `state.meta.activeGate === "g2"`: re-run `render-planning-review.ts`, re-display G2 yield message, wait.
   - If `state.meta.activeGate === "g3"`: re-display G3 yield message (app is still running per `state.server`), wait.
5. QA loop states:
   - If any `state.qa.<gate>.status === "in-progress"`: restart that QA gate from attempt 1. Prior iterations' patch manifests in `state.healLog` are preserved and available to `self-healer`.

---

## Part 8 — State.json durability contract

The state file is the sole recovery source. `state-manager.ts` MUST:

- Write atomically: write to `.monolith/state.json.tmp`, then `fs.renameSync()` to `.monolith/state.json`.
- Write a single backup: before each write, copy existing `.monolith/state.json` → `.monolith/state.json.bak`.

Recovery fallback order:
1. `.monolith/state.json` (primary)
2. `.monolith/state.json.bak` (one write behind)
3. BLOCK — do not attempt to reconstruct from scratchpad files, as this loses fingerprints, QA history, and cache metadata.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23: state tree is the single source of truth.
- [agents/orchestrator.md](../agents/orchestrator.md) — enforces this rule at startup (pre-flight) and per-turn (recovery signal footer).
- `scripts/state-manager.ts` — must implement atomic write + bak protocol.
- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) — user-facing recovery instructions.
