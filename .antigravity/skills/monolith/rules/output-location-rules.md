# Rule — Output Location & Workflow Portability

The workflow folder (`monolith/`) is **read-only during a run**. Nothing is written inside it. Zip it up, drop it in any project, and every run produces artifacts outside it.

## Rationale

A workflow that writes into its own folder cannot be:
- Version-controlled independently of its outputs.
- Updated without risking run artifacts.
- Copied between projects without bringing old runs along.
- Tested in isolation — your last run's `out/` bleeds into the next one.

Every run we observed that wrote into `monolith/out/` had to be manually cleaned up before the next run. That is a workflow bug, not a user bug.

## The canonical layout

```
<workspaceRoot>/                          ← the folder the user opened in their editor
├── monolith/                   ← the workflow (read-only during runs)
│   ├── SKILL.md
│   ├── agents/
│   ├── rules/
│   ├── templates/
│   ├── scripts/
│   └── plan.md
│
├── .monolith-memory/                      ← persistent, multi-run memory (writable)
│   └── patterns/
│       ├── INDEX.md
│       └── <pattern>.md
│
├── .monolith-runs/<runId>/                ← per-run artifacts (writable)
│   ├── input-manifest.json
│   ├── ds-knowledge/
│   ├── guidelines/
│   ├── docs/
│   ├── qa/
│   ├── writes.log
│   └── DELIVERY.md
│
├── <ds-repo>/                            ← user's DS source (if shape D/F/G)
│   └── ...
│
└── <appName>/                            ← the running app (writable)
    ├── package.json
    ├── src/
    └── ...
```

`<appName>` is kebab-case of the product brief (e.g. `incare-strategy`, `expense-reporter`). Triage derives it and surfaces it in the input manifest for user confirmation at G1.

## What each location holds

| Path | Purpose | Writable during run? | Portability |
|---|---|---|---|
| `monolith/` | Workflow spec — agents, rules, templates, scripts | No | Zip and drop anywhere |
| `.monolith-memory/patterns/` | Pattern memory across all runs | Yes (append-only) | Copy between projects to share patterns |
| `.monolith-runs/<runId>/` | Planning docs, QA reports, DS knowledge pack | Yes | Kept for forensics; safe to delete |
| `<appName>/` | Running React app | Yes | Ships as a real project |

## Enforcement

1. **Triage** writes `input-manifest.json` with:
   ```json
   {
     "paths": {
       "workspaceRoot": "/abs/path/to/workspace",
       "workflowRoot":  "/abs/path/to/workspace/monolith",
       "memoryRoot":    "/abs/path/to/workspace/.monolith-memory",
       "runRoot":       "/abs/path/to/workspace/.monolith-runs/<runId>",
       "appRoot":       "/abs/path/to/workspace/<appName>"
     }
   }
   ```
2. The orchestrator **verifies** no file write targets a path prefixed by `workflowRoot` other than to `workflowRoot/patterns/` (legacy location — migrated on first run).
3. Any sub-agent that attempts to write inside `workflowRoot` has its write blocked and reported as an "OUTPUT_LOCATION_VIOLATION" blocker.
4. Before every run, the orchestrator checks `<workspaceRoot>/<appName>/` for prior content. If it exists and is non-empty, it prompts at G1 — "Overwrite, rename app, or abort?"

## Migration

First run after this rule is enacted:
- If `monolith/out/` exists: move every subdirectory to `<workspaceRoot>/.monolith-runs/`.
- If `monolith/patterns/` exists: move to `<workspaceRoot>/.monolith-memory/patterns/`.
- Leave the workflow folder clean.

The migration is one-time, idempotent, scripted, and logged in `writes.log`.

## Common mistake

**Do not** write the app inside `.monolith-runs/<runId>/app/`. The run directory is for planning artifacts only. The app goes at `<workspaceRoot>/<appName>/`, directly at the user's workspace root, so the user can `cd` into it without hunting through nested run folders.

## Related

- [orchestrator.md § path resolution](../agents/orchestrator.md)
- [triage.md § app name derivation](../agents/triage.md)
