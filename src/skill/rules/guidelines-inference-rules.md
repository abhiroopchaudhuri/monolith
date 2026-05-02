# Rule 3 — Guidelines Inference (Fallback Generation)

> When the user provides no guidelines and the DS ships none, the skill generates them — but ONLY from evidence present in the DS source. Every claim must cite.

## Why this rule exists

A DS without written guidelines is not a DS without opinions. The opinions are baked into the components, tokens, docs, README, and example code. The fallback generator's job is to surface those opinions as readable guidelines — not to invent new ones.

A well-written guideline set makes every downstream agent (researcher, PM, designer, developer) produce better work. A hallucinated guideline poisons everything.

## The hard rule

> **Every claim in a generated guideline document must cite at least one piece of evidence from the DS. If a topic has zero evidence, the document says so explicitly and is marked `inferred: false`.**

## Evidence types

A claim is "cited" if it references one of:

1. **A component** in `component-index.json` — by name + index-path.
2. **A token** in `tokens.json` — by token path.
3. **A source file** in the DS repo — with path + line range.
4. **An MCP response field** — with MCP name + field path.
5. **A README / docs excerpt** — with path + anchor.

Anything else is unsupported and either cut or marked inferred.

## Per-topic evidence map

Each of the seven guideline docs has a minimum-evidence bar:

| Guideline | Must-have evidence |
|---|---|
| `brand.md` | DS name + version (package.json). Palette semantics from tokens.json.color tier names. |
| `voice.md` | ≥3 example phrases from README/docs. If unavailable → mark `inferred: false` + recommend human authoring. |
| `ux-principles.md` | ≥3 principles inferred from explicit DS decisions: "DS exports Skeleton → principle: show structure early" etc. Each principle cites. |
| `accessibility.md` | DS's declared a11y stance (from README or CONTRIBUTING). Default WCAG target is `2.2 AA`. |
| `content.md` | Sentence/title case inferred from component default texts. Number/date format default from locale hint. |
| `motion.md` | Any motion tokens found. If none → "no motion conventions found; do not animate." |
| `layout.md` | Spacing scale from tokens. Breakpoints from tokens or responsive utilities. |

## The generator prompt (canonical)

`scripts/generate-guidelines-fallback.ts` uses this structure when prompting Sonnet:

```
You are generating guideline documents for <DS name>@<version>.
You have access to:
- component-index.json (<N> components)
- tokens.json
- README / CONTRIBUTING excerpts
- Example source files

Produce SEVEN docs, one per topic, in the order below.

Hard constraints:
1. Every claim must include an evidence citation inline, in this form:
     [evidence: <type>:<reference>]
2. If you cannot find evidence for a section, write literally:
     "Insufficient evidence — recommend human authoring."
     and mark the doc frontmatter `inferred: false`.
3. Do NOT invent principles. Do NOT cite products outside the DS.
4. Do NOT produce text that could be from any DS — be specific.
```

The script then post-processes: it strips claims without citations, rewrites the front-matter based on how much was kept, and emits both .json and .md per topic.

## Post-check

Before accepting the output, `guidelines-resolver`:
1. Parses each doc, counts citations.
2. If any doc has zero citations AND `inferred: true`, blocks with "hallucinated guideline" error.
3. If >3 docs are `inferred: false` (insufficient evidence), warns loudly at G2 — the user should consider providing real guidelines.

## Tone of generated docs

Generated docs are written as if by a disciplined DS steward: neutral, specific, fact-led. No aspirational language ("We believe great design empowers…"). No second-person instruction ("You should…") unless it's a direct rule.

**Bad:** "Our design language values clarity and empathy above all."

**Good:** "Typography uses three families: Inter (body), Inter (headings), JetBrains Mono (code). [evidence: tokens.json.type.family]"

## Cross-check with provided guidelines

When provided guidelines cover some topics and the fallback fills the rest, the resolver ensures the generated topics don't contradict the provided ones. If a conflict is detected (e.g., provided says "title case" but generated infers "sentence case"), prefer the provided source and mark the conflict in `guidelines/conflicts.md` for user review.

## Worked example (shape, not content)

For any DS that indexes components with an accordion-like collapse + popover-like reveal-on-trigger, a generated `ux-principles.md` entry looks like:

```markdown
## Progressive disclosure
The DS ships a `<Collapse>`-style component with an accordion mode
[evidence: component:<Collapse>, props: { <accordion> }], suggesting a
preference for revealing information in layers rather than all at once.
`<Popover>` and `<Tooltip>` components similarly gate extra detail behind
a trigger [evidence: component:<Popover>, component:<Tooltip>]. Apply this
principle: default to the minimum useful surface, offer depth on demand.
```

Every claim cites. Every claim is grounded. A human designer would agree; no designer would be misled. The exact component names come from the current run's `component-index.json` — never hardcoded.
