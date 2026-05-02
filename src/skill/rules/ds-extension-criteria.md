# Rule — DS Extension Criteria

The DS is the default. Extensions beyond it are permitted, **but must pass a five-test gate** and be ruled on by `ds-extension-judge` before any code is written. This replaces the binary DS-First-vs-custom debate with a principled negotiation.

## Why this rule exists

The v2 world had two modes: use-the-DS (strict) or go-custom (under pattern-decider review). That missed a common real case: the DS covers 80% of the job, but the remaining 20% genuinely needs something else — a new color for a domain-specific state, a card that has a personality the DS Card doesn't express, a chart type the DS's chart library doesn't include.

Pretending this case doesn't exist led to two failure modes:
1. **Over-compliance** — shoving the feature into a DS component that doesn't fit, resulting in awkward UX.
2. **Under-compliance** — custom components built without evidence, breaking DS coherence.

This rule creates a third path: **extend with justification**.

## Scope of "extension"

An extension is anything that adds to, but does not conflict with, the DS:
- A new custom component that the DS does not provide (e.g., a `PipelineNodeCard`, a `CodeEditor`, a domain-specific `PriorityDial`).
- A new token value the DS doesn't ship (e.g., a domain-specific status color — clinical amber for "dry run", a regulatory blue for "compliance required").
- A new pattern that composes DS components in a non-trivial way recurring enough to deserve a name.
- A custom variant of an existing DS component when the DS component supports `className` / slot customization but the variant is load-bearing (e.g., a "glass" Card for a landing section).

A **fork** of a DS component (rewriting its internals) is NOT an extension — it's a violation. The ds-extension-judge denies these by default; overriding requires a separate process not covered in this rule.

## The five-test gate

Every proposed extension must pass all five tests. Failing any test means denied or must-modify.

### Test 1 — Necessity

Is there no DS component that, through composition + layout, achieves this job?

- The designer must try at least 2 DS-only compositions in `design_decisions.md § DS-First attempts` and explain why each fails to meet the user need.
- If composition works with only cosmetic gap: **denied** — use the DS.
- If composition works but introduces awkward structure or violates hierarchy: **must justify** why the awkwardness matters.

### Test 2 — Evidence

Is there cited evidence that the feature genuinely requires this shape?

Evidence must cite ONE of:
- A differentiator from `differentiation-map.md` that this shape enables.
- A JTBD from `research.md` that doesn't fit DS patterns.
- A competitor pattern that works + reasoning for why ours should match.
- A competitor loophole + reasoning for how our shape solves it.
- A DS limitation documented in `ds-knowledge/component-index.json § known-gaps` (maintained by ds-indexer).

Preference-based evidence ("I like how this looks") is not evidence.

### Test 3 — Reuse

Will this extension be used in ≥2 places in this product, or is it a one-off?

- ≥2 uses → **promote** to a pattern file in `<memoryRoot>/patterns/`.
- 1 use → permitted only if Tests 1, 2, 4, 5 pass AND the one-off is a high-value surface (landing, onboarding, a differentiator screen).
- 1 use on a low-value surface → **denied** as premature specialization.

### Test 4 — Token compatibility

Does the extension respect the DS token system, or does it introduce parallel scales?

- All colors in the extension must either reference existing DS tokens OR introduce new tokens that extend the DS's token system (follow its naming conventions, units, and token-space structure).
- Radii, spacing, and font-sizes must use DS tokens unless the extension documents WHY the DS scale fails.
- No hex literals in the extension's code. All colors go through CSS variables or equivalent, named per DS convention.

### Test 5 — Maintenance

Can this extension survive a DS version bump without breaking?

- Wraps DS primitives (uses `import { Card } from '@/components/ui/card'`) rather than forking them.
- Does not rely on internal data-attributes that are private to the DS.
- Has a clear surface the developer can update if the DS's primitives change.

## The ruling process

1. **Request**: lead-designer identifies a potential extension in `design_decisions.md`.
2. **Ruling**: ds-extension-judge reads the request + evidence, runs the five tests, emits `docs/ds-extensions/<slug>.md` with:
   ```
   extension: <slug>
   status: approved | approved-with-modifications | denied
   tests: { necessity: pass|fail, evidence: pass|fail, reuse: pass|fail, token: pass|fail, maintenance: pass|fail }
   ruling: <prose, 2–4 paragraphs>
   modifications-required: <if approved-with-modifications>
   alternative: <if denied — which DS composition to use instead>
   ```
3. **Enforcement**: developer reads the ruling before writing any custom code. Denied extensions are not built. Approved-with-modifications must match the modifications.
4. **Audit**: production-readiness-auditor verifies every custom file in `src/custom/` has a corresponding ruling file.

## Special case: token extensions

Introducing a new color or size token is allowed if:
- The token name follows DS convention (e.g., `--dry-run-surface` if DS uses kebab-case CSS vars; `colors.dryRun.surface` if DS uses nested JS object).
- The token has both a light and dark value if the DS supports both themes.
- The token is justified against a domain need (e.g., "amber for dry run" in a healthcare context — cited against voice.md and differentiation-map.md).
- The token is declared in one place (the `theme/` directory) and never inlined.

## Anti-patterns

- "The DS doesn't have it" as the sole reason (fails Test 2).
- Copying a competitor's component 1:1 (fails Test 2 — no differentiation).
- Adding a custom component because "the DS looks boring" (fails Test 2).
- Building a one-off with no reuse plan and no high-value-surface justification (fails Test 3).
- Introducing hex colors or arbitrary spacing values (fails Test 4).
- Forking a DS component by copy-pasting its source and editing (fails Test 5).

## Success gate

- Every `src/custom/<Name>/` directory has a corresponding `docs/ds-extensions/<slug>.md`.
- Every ruling is one of {approved, approved-with-modifications, denied}.
- No denied extensions exist in `src/custom/`.
- All approved-with-modifications match the required modifications (verified by production-readiness-auditor).

## Related

- [agents/ds-extension-judge.md](../agents/ds-extension-judge.md)
- [rules/ds-first-mandate.md](ds-first-mandate.md)
- [rules/custom-component-decision.md](custom-component-decision.md) — legacy; defers to this rule
- [rules/evidence-weighted-decisions.md](evidence-weighted-decisions.md)
