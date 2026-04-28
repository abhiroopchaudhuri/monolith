# Rule 23 — Checkpoint Discipline (disk as source of truth)

> **Why this rule exists.** Weaker LLMs (Haiku-tier, GPT-3.5-class) lose critical state across long multi-agent pipelines. Conversation recall is unreliable past ~30K tokens. Checkpoint files on disk solve this — every phase writes a compact checkpoint; later phases re-read from disk rather than relying on conversation context. This rule adopts the same discipline for `monolith`.
>
> **Headline rule.** **State between agents flows through files, not conversation.** An agent's inputs are a declared file list. Its outputs are declared file writes. It does not rely on "what was said earlier in the chat."

---

## Part 1 — The `checkpoints/` folder

Every run has:

```
<runRoot>/checkpoints/
├── 01-triage.json              ← manifest + paths + appName
├── 02-ds-index.json            ← summary of DS: counts, tiers, adapter kind
├── 03-guidelines.json          ← normalized guidelines summary
├── 04-theme-spec.json          ← (the full theme-spec lives here)
├── 05-market.json              ← top competitors, top loopholes, visual signatures
├── 06-research.json            ← personas, JTBDs, gap inferences
├── 07-prd.json                 ← problem, stories, MVP, metrics
├── 08-differentiation.json     ← 3–5 bets with citations
├── 09-ia.json                  ← sitemap, nav, states inventory
├── 10-design-decisions.json    ← per-section summary
├── 11-design-critique.json     ← per-screen grades + revisions
├── 12-aesthetic-audit.json     ← per-screen tells + verdict
├── 13-ux-writing.json          ← key strings + voice rules applied
├── 14-build-specs.json         ← file tree + routes
├── 15-pattern-decisions.json   ← pattern matrix
├── 16-build.json               ← appRoot, port, commit hash
├── 17-dev-qa.json              ← gates + attempts
├── 18-prod-readiness.json      ← gates + attempts
├── 19-runtime.json             ← routes + screenshots + interaction verification
├── 20-design-qa.json           ← axis scores + promotions
└── 21-commercial.json          ← verdict + surfaces
```

Checkpoints are **compact summaries** (≤4KB each) with references to the full artifacts under `<runRoot>/docs/` or `<runRoot>/qa/`. They are the lightweight thing downstream agents re-read to get oriented.

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
4. Emits its own checkpoint to `<runRoot>/checkpoints/<NN>-<phase>.json`.

Anything learned from conversation context is **advisory only** and must be reconfirmed against files. If an agent finds its conversation recall disagrees with a checkpoint, the checkpoint wins.

---

## Part 4 — Why this helps weaker LLMs

At Haiku-tier, conversation context past ~30K tokens becomes lossy. A weaker LLM invoked as (say) `developer` for a 15-route React app cannot reliably re-derive the design decisions from "scroll back in the chat." It can reliably **open `<runRoot>/checkpoints/10-design-decisions.json`** (4KB) and know exactly what was decided.

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

1. Creates `<runRoot>/checkpoints/` at path resolution.
2. Between phases, verifies the prior phase's checkpoint exists and is schema-valid.
3. Passes the runRoot to each sub-agent; sub-agent reads only from its declared `reads:` + the preceding checkpoint.
4. If a checkpoint is missing, the orchestrator re-invokes the phase; if the re-invocation also fails, escalates at the nearest gate.

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
