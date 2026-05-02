# Rule 23 — Checkpoint Discipline (state tree as source of truth)

> **Why this rule exists.** Weaker LLMs lose critical state across long multi-agent pipelines. Conversation recall is unreliable past ~30K tokens. A single state tree on disk solves this — every phase writes to a shared JSON tree; later phases read only the branches they need.
>
> **Headline rule.** **State between agents flows through `.monolith/state.json`, not conversation.** An agent reads specific branches from the state tree (and the scratchpad files that branch points to). It declares its outputs; the orchestrator writes them back to the tree. It does not rely on "what was said earlier in the chat."

---

## Part 1 — The State Tree

Every run has exactly one state file, at the workspace root:

```
.monolith/state.json
```

This replaces the v3.0 design's `<runRoot>/checkpoints/<NN>-<phase>.json` files (and the v3.3-original-plan SQLite tables). All phase status, artifact metadata, QA status, issues, heal log, server PID, and cache metadata live inside this single JSON tree.

Key branches:

| Branch | What it holds |
|---|---|
| `meta` | runId, version, status, timestamps |
| `input.manifest` | the user brief + detected inputs |
| `phases.<name>` | per-phase status + checkpoint summary + fingerprint |
| `artifacts.<name>` | artifact metadata (summary, fullPath under `.monolith/scratchpad/`, tokenCount, lastModified) |
| `qa.<gate>` | attempt count, status, last issues |
| `issues.open` | current unresolved issues |
| `issues.resolved` | fixed issues |
| `healLog` | iteration history (incl. patchManifests) |
| `patterns` | reused + promoted patterns |
| `server` | dev server PID + URL + status |
| `cache` | content-addressable cache metadata |

**The orchestrator is the sole writer to `state.json`.** Sub-agents declare their outputs in their response; the orchestrator interprets those declarations and writes the tree via `scripts/state-manager.ts`.

---

## Part 2 — The phase checkpoint shape (state.phases.<name>)

Every phase entry has this shape:

```json
{
  "status": "pending | active | done | skipped | failed",
  "attempt": 1,
  "fingerprint": "sha256:...",
  "producedAt": "<ISO-8601>",
  "summary": {
    "<phase-specific compact fields>": "<concise values>"
  },
  "outputs": ["<scratchpad path>", "..."]
}
```

Summary fields are **phase-specific** and **compact**. Example for `phases.leadDesigner.summary`:

```json
{
  "screens": 8,
  "sections": 42,
  "dsComponents": 31,
  "patternReuses": 4,
  "extensionsProposed": 2,
  "extensionsApproved": 1,
  "perScreen": [
    { "screen": "dashboard", "componentCount": 7, "differentiatorServed": "inline-audit-tray", "evidenceWeight": "grounded" }
  ]
}
```

---

## Part 3 — The reader contract

Every agent's frontmatter declares a `reads:` list AND a `writes:` list (Rule 24). The agent:

1. Reads each path/branch in `reads:` — no more.
2. Reads `state.phases.<previousPhase>.summary` for the phase that hands off to it.
3. Writes its outputs to `.monolith/scratchpad/` (full markdown artifacts) and **declares them in its response** so the orchestrator can update `state.artifacts.<name>` + `state.phases.<phaseName>`.

Agents do **not** edit `state.json` directly. They never read or write `<runRoot>/checkpoints/*.json` (that legacy directory does not exist in v3.3).

Anything learned from conversation context is **advisory only** and must be reconfirmed against the state tree. If an agent finds its conversation recall disagrees with the state tree, the state tree wins.

---

## Part 4 — Why this helps weaker LLMs

At weaker-model tiers, conversation context becomes lossy. A weaker LLM invoked as (say) `developer` for a 15-route React app cannot reliably re-derive the design decisions from "scroll back in the chat." It can reliably **read `state.phases.leadDesigner.summary`** (compact summary) plus the `.monolith/scratchpad/design_decisions.md` file pointed to by `state.artifacts.designDecisions.fullPath`.

Corollary: state-tree summaries are **optimized for re-reading**, not for writing. If a field is ambiguous, the summary makes it explicit.

---

## Part 5 — Relation to other state surfaces

- `.monolith/scratchpad/*.md` — the full artifacts. State summaries are summaries *of* these.
- `.monolith/archive/<runId>/` — written on G3 `accept`; the post-run home of scratchpad files.
- `.monolith/cache/<tier>/<hash>/` — content-addressable cache for cacheable phases (Rule 23 + fingerprinting).
- `.monolith-memory/patterns/` — cross-run pattern memory, outside any individual run's state.
- `<workspaceRoot>/<appName>/` — the running app. Code state is reflected via `git status` + the `phases.developer.summary`.

---

## Part 6 — Orchestrator responsibilities

The orchestrator:

1. Initializes `.monolith/state.json` via `stateManager.init()` at the start of a run.
2. Between phases, verifies the prior phase's `state.phases.<name>.status` is `done` or `skipped`.
3. Passes only the paths in each agent's `reads:` list to that agent.
4. After a phase returns, calls `stateManager.setPhaseStatus(phase, 'done', summary)` and `stateManager.setArtifact(name, summary, fullPath, tokenCount)` for every declared output.
5. If a phase status is missing or `failed`, the orchestrator re-invokes the phase; if the re-invocation also fails, escalates at the nearest gate.
6. On user `iterate` at G2/G3, marks the affected phase + downstream phases `pending`, then re-runs.

---

## Part 7 — Violations

- Agent writes outside its declared `writes:` list → violation logged; self-healer routes back with scope error.
- Agent reads files outside its declared `reads:` list (discoverable via tool-call audit) → violation logged.
- Agent returns work that contradicts a checkpoint summary → violation logged.
- Phase summary missing required fields → schema failure; phase re-runs.

Violations are issues, not automatically blockers — the orchestrator decides severity.

---

## Part 8 — Exceptions

- **Full artifacts** (design_decisions.md, prd.md, etc.) live in `.monolith/scratchpad/` and remain the source of truth for their content. State summaries are summaries.
- **Code files** in `<appRoot>` are not state-tracked beyond the `phases.developer.summary` and the `<patchManifest>` block in heal log entries.
- **Pattern memory** lives under `.monolith-memory/patterns/` (with `log.jsonl` append-only), not state.
- **Cache** is keyed by content hash under `.monolith/cache/`; metadata mirrors live in `state.cache.<tier>`.

---

## Related

- [rules/phase-manifest-discipline.md](phase-manifest-discipline.md) — Rule 24, declares `reads:` / `writes:` explicitly.
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25, 10K-token cap per planning artifact.
- [agents/orchestrator.md](../agents/orchestrator.md) — enforces state-tree flow.
- `scripts/state-manager.ts` — the only writer to `state.json`.
