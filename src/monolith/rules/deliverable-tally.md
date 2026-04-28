# Rule 26 — Deliverable Tally Discipline

> **Why this rule exists.** Weak LLMs quietly skip artifacts. "Wrote PRD, now moving on" — but did they actually write `prd.md`? A single-line tally after every write catches misses early and reliably, especially at low context. Borrowed from Phase 4 delivery discipline patterns.
>
> **Headline rule.** Every agent prints a running tally after each artifact written: `📋 Delivered: <name> | Remaining: <list>`. The agent does not return control until `Remaining: (empty)`.

---

## Part 1 — The tally format

After writing each artifact, output:

```
📋 Delivered: design_decisions.md | Remaining: best_practices.md, design_decisions-checkpoint
```

When all are done:

```
📋 Delivered: best_practices.md | Remaining: (empty)
```

The `📋` marker is literal — tooling can grep for it.

---

## Part 2 — What counts as a deliverable

Any file the agent's `writes:` frontmatter declares. Including:

- Primary artifacts under `docs/`.
- Secondary artifacts (per-slug files under `docs/ds-extensions/`, pattern files under `memoryRoot/patterns/`).
- Checkpoint files under `checkpoints/`.
- QA reports under `qa/`.

The order of delivery is the order in `writes:` unless dependencies dictate otherwise (e.g., a file that references another must be written after).

---

## Part 3 — No "return with remaining"

An agent that returns control with `Remaining:` non-empty has failed its contract. The orchestrator treats this as a phase failure and re-invokes.

If an agent genuinely cannot produce a remaining deliverable (blocker condition), it emits:

```
📋 Delivered: design_decisions.md | Remaining: best_practices.md (BLOCKED: <reason>)
```

The blocker is then surfaced to the orchestrator, not silently skipped.

---

## Part 4 — Multi-write artifacts

When an artifact is written progressively (developer full-gen writes N source files), the tally collapses the source files to a single item:

```
📋 Delivered: app-source (47 files) | Remaining: fixtures, screenshots, package.json
```

This avoids flooding the console. Each logical deliverable is one tally line.

---

## Part 5 — Final summary

At the end of its run, every agent prints:

```
📋 Final: <N> delivered, 0 remaining. 
   - <list of primary artifacts>
```

This line is what the orchestrator reads to determine success.

---

## Part 6 — Enforcement

- Orchestrator greps agent output for `📋` lines.
- Missing final `📋 Final:` line with `0 remaining` = phase failure.
- Mismatch between declared `writes:` and tallied deliverables = violation logged.

---

## Related

- [rules/checkpoint-discipline.md](checkpoint-discipline.md) — Rule 23.
- [rules/phase-manifest-discipline.md](phase-manifest-discipline.md) — Rule 24.
- [rules/artifact-size-cap.md](artifact-size-cap.md) — Rule 25.
