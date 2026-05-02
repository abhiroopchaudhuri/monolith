# Sample run

This folder is intentionally a placeholder. Once you complete a real end-to-end run with `--keep-scratchpad`, copy `.monolith/archive/<runId>/` into here as `examples/sample-run/<runId>/` along with:

- `state.json` (final)
- `scratchpad/*.md` (all planning artifacts)
- `DELIVERY.md`
- A redacted `package.json` from the generated app (no secrets)

A real sample serves as:

1. A fixture for smoke tests (`npm run typecheck && tsx scripts/run-phase.ts --replay examples/sample-run/<runId>`).
2. Documentation by example for new users.
3. A regression baseline when modifying agents or rules.

## Recommended sample brief

> "Build a small internal expense-reporting dashboard for a 50-person org. 3 screens: home (this-month summary), submit-receipt, approvals queue."

Pair with `examples/ds-adapters/shadcn.json` and `Guidelines: auto`.
