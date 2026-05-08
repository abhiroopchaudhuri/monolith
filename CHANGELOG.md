# Changelog

## [3.4.0] — 2026-05-09

### Added

- **Rule 27 — Context Recovery** (`rules/context-recovery.md`): three-layer defense against context compaction breaking the pipeline mid-run.
  - **RESUME.md breadcrumb**: `.monolith/RESUME.md` is written and updated after every phase transition, containing the run ID, current phase, and a quick-resume command. Deleted on G3 `accept`.
  - **Orchestrator pre-flight check**: before step 0, the orchestrator reads `.monolith/state.json`. If `status === "in-progress"` it auto-resumes without requiring `--resume`. Compaction heuristic: in-progress state + continuation cue → auto-resume with `[CONTEXT RECOVERY DETECTED]` banner.
  - **Per-turn recovery signal footer**: every orchestrator output ends with `[PIPELINE: <runId> | Phase: <N> | Done: N/17]` — plain text that survives into compacted summaries and gives the next context a parseable resume anchor.

### Changed

- `agents/orchestrator.md`: added Pre-flight check section, RESUME.md breadcrumb obligation, per-turn footer requirement, `state.meta.activeGate` writes at each gate, `state.json.bak` fallback in fail modes.
- `rules/checkpoint-discipline.md` (Rule 23): `state.meta` now includes `activeGate` field; `state-manager.ts` specced for atomic write + `.bak`.
- `SKILL.md`: added Rule 27 to core rules; auto-resume documented in Resume invocation flag.
- `plan.md`: v3.4 version history entry; Rule 27 in tracker.
- `TROUBLESHOOTING.md`: added "Context compaction / session lost mid-run" section with step-by-step recovery instructions.

## [3.3.0] — initial release

End-to-end market-grade product build pipeline. Research → PRD → design → code → QA → delivery against any design system.
