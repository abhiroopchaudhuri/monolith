# Rule 7 — Handoff to Phase 2

> Phase 2 (`rewire-to-ds`) consumes our output. This rule defines exactly what we must produce so Phase 2 never has to reach back into our run.

## Why this rule exists

Phase 2 is designed to be stateless w.r.t. Phase 1's internal planning. It sees a Figma frame URL + a skeleton + our handoff artifacts, and it reconciles against a Figma DS library. If Phase 2 needs anything from Phase 1 that isn't in a documented handoff file, we've broken the contract.

## The handoff package

Phase 2 consumes, in order of necessity:

| File | Required? | Content |
|---|---|---|
| `out/<runId>/docs/screen-plan.json` | **REQUIRED** | Per-screen semantic map (see §2 below). |
| `out/<runId>/ds-knowledge/tokens.json` | Strongly recommended | For cross-checking Figma variables. |
| `out/<runId>/ds-knowledge/component-index.json` | Optional | For variant disambiguation in Phase 2. |
| `out/<runId>/app/` (served via localhost) | Phase 1.5 needs it | html.to.design reads the rendered screen. |
| `out/<runId>/docs/design_decisions.md` | Optional | For human review in Phase 2. |
| `out/<runId>/docs/pattern_decisions.md` | Optional | Tells Phase 2 which sections should be `exact-swap` vs `compose`. |

## screen-plan.json shape

One object per screen, in a top-level `screens[]` array. Shape (canonical — matches [../../shared/types/screen-plan.schema.json](../../shared/types/screen-plan.schema.json) where it exists; adds fields below):

```json
{
  "runId": "<YYYY-MM-DD>_<kebab-brief>",
  "screens": [
    {
      "id": "<screen-slug>",
      "route": "/",
      "title": "<Screen title>",
      "layout": "<dashboard|detail|form|list|wizard|…>",
      "theme": "light",
      "density": "comfortable",
      "landmarks": [
        { "role": "banner",   "label": "<label>" },
        { "role": "main",     "label": "<label>" },
        { "role": "navigation", "label": "<label>" }
      ],
      "sections": [
        {
          "id": "<section-slug>",
          "role": "<role-name>",
          "strategy": "ds-component",
          "components": [
            { "name": "<DSComponent>", "importPath": "<ds-import-path>", "props": { "...": "..." } }
          ],
          "copy": {
            "<key>": "<real, voice-anchored string>"
          },
          "variantIntent": "default",
          "bbox": null
        },
        {
          "id": "<section-slug-2>",
          "role": "<role-name-2>",
          "strategy": "reused-pattern",
          "patternSlug": "<pattern-slug>",
          "components": [ "<Component1>", "<Component2>" ],
          "copy": {
            "<key>": "<value>"
          },
          "variantIntent": "emphasis",
          "bbox": null
        }
      ],
      "fixtures": "src/fixtures/<screen-slug>.ts"
    }
  ],
  "generatedAt": "<ISO>",
  "ds": { "name": "<ds-name>", "version": "<semver>" }
}
```

### Field contracts

- `id` per screen and per section MUST be stable (used by Phase 2 to correlate).
- `strategy` mirrors `pattern_decisions.md`: `ds-component | ds-composition | ds-pattern | reused-pattern | layout-inline | custom-novel | blocker`.
- `patternSlug` is required when `strategy == reused-pattern` or `new-pattern`.
- `components[]` lists DS component names used in this section, in DOM order. Props may be omitted — Phase 2 only needs the names + variants.
- `variantIntent` is a semantic hint ("emphasis", "danger", "subtle") — Phase 2 uses it to pick Figma variant matching.
- `copy` is a flat key-value map of all real text in the section. Phase 2 uses this for copy carry-over.
- `landmarks[]` maps to a11y regions — Phase 2 uses these to verify structure.

## Who writes screen-plan.json

The **developer agent** produces it as a natural by-product of generating screens. Every time it renders a screen, it also appends an entry to `docs/screen-plan.json`. The orchestrator validates on Stage 9 exit that the file exists and has one entry per screen.

## Phase 2 handoff command

The orchestrator prints this at G3 `accept`:

```
/rewire-to-ds <figma-frame-url>
  --plan   out/<runId>/docs/screen-plan.json
  --tokens out/<runId>/ds-knowledge/tokens.json
  --index  out/<runId>/ds-knowledge/component-index.json
```

## What Phase 1 MUST NOT assume about Phase 2

- It may not be run immediately. Handoff artifacts must be self-contained and durable.
- It may be run by a different user. No machine-specific paths; use relative paths from runId root.
- It may be run against a different DS library than the code DS (theme swap). Do not embed code-DS-specific Figma component keys.
- It may fail and retry. Our handoff is idempotent — same inputs produce the same reconciliation target.

## Phase 1.5 hosting

Phase 1.5 (html.to.design) needs the running app reachable at a URL. The orchestrator's DELIVERY.md always prints:

```
Localhost: http://localhost:<port>
Start: cd out/<runId>/app && npm run dev

(Phase 1.5 importer reads this URL in a browser.)
```

If the port is taken, the scaffold retries +1, +2 until it finds one, and writes the chosen port into DELIVERY.md.

## Contract tests

The skill ships two contract tests (stubbed in scripts/, run manually for now):

1. `scripts/validate-generated.ts --screen-plan <path>` — confirms screen-plan.json validates against the schema and every referenced pattern slug exists.
2. `scripts/visual-smoke.ts --url <localhost> --plan <path>` — confirms every route in the plan renders a 200.

Both must pass before G3 can advance to `accept`.
