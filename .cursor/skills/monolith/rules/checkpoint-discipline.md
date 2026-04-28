# Rule 23 — Checkpoint Discipline (state tree as source of truth)

> **Why this rule exists.** Weaker LLMs lose critical state across long multi-agent pipelines. Conversation recall is unreliable past ~30K tokens. A single state tree on disk solves this — every phase writes to a shared JSON tree; later phases read only the branches they need.
>
> **Headline rule.** **State between agents flows through `.monolith/state.json`, not conversation.** An agent reads specific branches from the state tree. It writes its outputs back to the state tree. It does not rely on "what was said earlier in the chat."

---

## Part 1 — The State Tree

Every run has exactly one state file:

```
.monolith/state.json
```

This replaces the old 21 checkpoint files + SQLite database. All phase checkpoints, artifact metadata, QA status, issues, and heal log live inside this single JSON tree.

Key branches:

| Branch | What it holds |
|---|---|
| `meta` | runId, version, status, timestamps |
| `input.manifest` | the user brief + detected inputs |
| `phases.<name>` | per-phase status + checkpoint summary |
| `artifacts.<name>` | artifact metadata (summary, path, tokenCount) |
| `qa.<gate>` | attempt count, status, last issues |
| `issues.open` | current unresolved issues |
| `issues.resolved` | fixed issues |
| `healLog` | iteration history |
| `patterns` | reused + promoted patterns |
| `server` | dev server PID + URL |
| `cache` | content-addressable cache metadata |

The orchestrator is the sole writer to `state.json`. Agents declare their outputs, and the orchestrator writes them.

---

## Part 2 — The checkpoint contract

Every checkpoint file contains:

```json
{
  "phase": "<agent-name>",
  "attempt": <N>,
  "runId": "<runId>",
  "producedAt": "<ISO-8601>",
  "inputs": {
    "read": [
      { "path": "<relative-to-runRoot>", "sha": "<optional>" },
      ...
    ]
  },
  "outputs": {
    "primary": "<path-to-primary-artifact>",
    "secondary": [ "<path>", ... ]
  },
  "summary": {
    "<phase-specific fields>": "<concise values>"
  },
  "handoff": {
    "nextPhase": "<next-agent-name>",
    "requiredReads": [ "<path>", ... ],
    "knownBlockers": [ ... ]
  }
}
```

Summary fields are **phase-specific** and **compact**. Example for `10-design-decisions.json`:

```json
{
  "summary": {
    "screens": 8,
    "sections": 42,
    "dsComponents": 31,
    "patternReuses": 4,
    "extensionsProposed": 2,
    "extensionsApproved": 1,
    "perScreen": [
      { "screen": "dashboard", "componentCount": 7, "differentiatorServed": "inline-audit-tray", "evidenceWeight": "grounded" },
      ...
    ]
  }
}
```

---

## Part 3 — The reader contract

Every agent's frontmatter declares a `reads:` list AND a `writes:` list. The agent:

1. Reads each file in `reads:` — no more.
2. Reads the checkpoint of the immediately preceding phase (the `handoff.nextPhase` that points at this agent).
3. Writes each file in `writes:` — no more.
4. Writes its checkpoint summary to `state.phases.<phaseName>.checkpoint` via the orchestrator.

Anything learned from conversation context is **advisory only** and must be reconfirmed against the state tree. If an agent finds its conversation recall disagrees with the state tree, the state tree wins.

---

## Part 4 — Why this helps weaker LLMs

At weaker-model tiers, conversation context becomes lossy. A weaker LLM invoked as (say) `developer` for a 15-route React app cannot reliably re-derive the design decisions from "scroll back in the chat." It can reliably **read `state.phases.leadDesigner.checkpoint`** (compact summary) and know exactly what was decided.

Corollary: checkpoints are **optimized for re-reading**, not for writing. If a field is ambiguous, the checkpoint makes it explicit.

---

## Part 5 — Relation to existing state

- `<runRoot>/docs/*.md` — the full artifacts. Checkpoints are summaries *of* these.
- `<runRoot>/writes.log` — orchestrator's write log. Complementary; log is a timeline, checkpoints are state snapshots.
- `<memoryRoot>/patterns/` — cross-run state, outside any individual run's checkpoints.
- `<memoryRoot>/research-cache/` (new, see Rule 28) — cross-run research snapshots.

---

## Part 6 — Orchestrator responsibilities

The orchestrator:

1. Initializes `.monolith/state.json` via `stateManager.init()`.
2. Between phases, verifies the prior phase's `state.phases.<name>.status` is `done` or `skipped`.
3. Passes `runRoot` to each sub-agent; sub-agent reads only from its declared `reads:` + the state tree.
4. If a phase status is missing or `failed`, the orchestrator re-invokes the phase; if the re-invocation also fails, escalates at the nearest gate.

---

## Part 7 — Violations

- Agent writes outside its declared `writes:` list → violation logged; self-healer routes back with scope error.
- Agent reads files outside its declared `reads:` list (discoverable via tool-call audit) → violation logged.
- Agent returns work that contradicts a checkpoint → violation logged.
- Checkpoint is missing required `summary` fields → schema failure; phase re-runs.

Violations are issues, not automatically blockers — the orchestrator decides severity.

---

## Part 8 — Exceptions

- **Full artifacts** (design_decisions.md, prd.md, etc.) remain the source of truth for their content. Checkpoints are summaries.
- **Code files** in `<appRoot>` are not checkpointed — `git status` + `16-build.json` serve as the state reference.
- **Pattern memory** lives under `<memoryRoot>/patterns/`, not checkpoints.

---

## Related

- [rules/phase-manifest-discipline.md](phase-manifest-discipline.md) — Rule 24, declares `reads:` / `writes:` explicitly.
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25, 10K-token cap per planning artifact.
- [agents/orchestrator.md](../agents/orchestrator.md) — enforces checkpoint flow.
