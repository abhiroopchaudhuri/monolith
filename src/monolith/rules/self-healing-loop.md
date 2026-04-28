# Rule — Self-Healing QA Loop

Every QA gate is a **loop, not a one-shot**. The orchestrator runs QA, feeds issues back to the owning producer agent, re-runs QA, and keeps iterating until convergence or a hard iteration cap. The run never silently accepts a failing QA report.

## Why

Single-pass QA leaves a choice: fail the run or accept the violations. Neither is acceptable:
- Failing blocks delivery on fixable issues.
- Accepting violates the production-grade mandate.

The loop converts findings into edits, deterministically.

## The loop

```
producer emits artifact
    → QA inspects artifact
        → issues[] empty?  → advance
                          → not empty?
                              → self-healer builds targeted delta
                                  → producer re-edits (scoped to delta)
                                      → QA inspects again
                                          → (repeat)
```

- Iteration cap: **5 passes per gate**.
- If iteration 5 still has issues → **BLOCK** the run at that gate with a clear message listing unresolved issues and which attempts were made.
- At no iteration does the orchestrator "silently pass" while issues exist.

## Gates that heal

| Gate | Producer agent | QA agent(s) | Max iters |
|---|---|---|---|
| Code correctness | developer | dev-qa | 5 |
| Production readiness | developer | production-readiness-auditor | 5 |
| Runtime (routes, interactions, scroll) | developer | runtime-inspector | 5 |
| Visual / content / rhythm | developer | design-qa | 5 |

## Issue schema

Every QA agent emits issues in this structured form so self-healer can route them:

```json
{
  "issues": [
    {
      "id": "PRH-0003",
      "severity": "blocker" | "major" | "minor",
      "category": "dead-button" | "nav-state" | "overflow" | "alignment"
                | "accessibility" | "content" | "token-usage" | "ds-first"
                | "fixture-consistency" | "state-missing" | "route-error"
                | "runtime-exception" | "form-wiring" | "responsive",
      "location": { "file": "src/...", "line": 42, "route": "/strategies" },
      "observation": "Button 'New Strategy' has no onClick and is not disabled or marked coming-soon",
      "suggestedFix": "Wire to a toast 'Strategy creation coming in Phase 2' via data-coming-soon pattern",
      "screenshot": "runs/<runId>/qa/screenshots/strategies-1440x900.png",
      "attempt": 1
    }
  ]
}
```

## Self-healer behavior

The self-healer is a lightweight agent (runs between QA and developer). It:

1. Reads `issues[]` from the QA agent.
2. Groups issues by file + category.
3. Writes a **scoped delta brief** for the developer: "Fix these N issues in these M files. Do NOT touch anything else."
4. Invokes developer in "patch mode": developer may only edit files listed in the brief.
5. Re-runs the QA agent.
6. Compares new issues to previous issues:
   - If new issue count is strictly less and no regressions introduced → continue.
   - If regressions introduced (new issues in files that were fine before) → log warning, continue but mark attempt.
   - If issue count unchanged → iteration did not help; raise attempt number and retry with a more verbose brief.

## Determinism

- Fixtures, file paths, and issue IDs are stable across iterations so that a re-run of the exact same inputs produces the exact same heal sequence.
- Every iteration's `issues[]` is logged to `.monolith-runs/<runId>/qa/heal-log.jsonl` (JSON lines, one per attempt, per gate).

## When to break the loop

The orchestrator breaks the loop and BLOCKS if any of:
1. Iteration 5 still has blocker-severity issues → block with full log.
2. Iteration ≥ 2 produces the same issue count with the same IDs twice in a row → block (patch mode is not converging).
3. Producer agent fails to apply a patch without error two iterations in a row → block.

Block messages are specific: they name the file, the issue, the attempted fixes, and a suggested human intervention.

## Loop output in DELIVERY.md

DELIVERY.md records:
```
Self-healing summary:
  dev-qa:                   3 iterations → clean
  production-readiness:     2 iterations → clean
  runtime-inspector:        1 iteration  → clean
  design-qa:                4 iterations → clean
  Total heal passes:        10
  Total issues resolved:    27
  Unresolved (waived):      0
```

If iterations = 1 everywhere, something is probably wrong (you got lucky, or QA didn't inspect deeply). Healthy runs show 2–4 iterations per gate early and decrease as the codebase matures across runs.

## Related

- [agents/self-healer.md](../agents/self-healer.md)
- [agents/production-readiness-auditor.md](../agents/production-readiness-auditor.md)
- [agents/runtime-inspector.md](../agents/runtime-inspector.md)
- [rules/production-grade-mandate.md](production-grade-mandate.md)
