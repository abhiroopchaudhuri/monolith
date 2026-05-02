# Rule — Market Research Mandate

Every run does competitive landscape research **before** research.md is written. Products built in a vacuum look like products built in a vacuum: correct, but indistinguishable. This rule ensures every brief is situated in its real market.

## Why

A workflow that goes straight from brief → personas → PRD → design builds for an imagined user in an imagined market. Real products live alongside competitors. Users arrive having tried other tools. Every design decision is implicitly either "same as competitor X" or "different from competitor X, because..." — and the workflow must make that reasoning explicit.

## What gets researched

Before the researcher runs, `market-researcher` produces `docs/market-research.md` covering:

### 1. Competitor set (3–7 real products)
- Name + one-line positioning
- Target user segment
- Pricing model (free / freemium / flat / tiered / enterprise)
- Maturity (established / growth / early)
- Key UX signatures (what's distinctive about how they look and feel)

### 2. Per-competitor UX strengths (what works)
- The 1–3 things this product does better than the rest
- Evidence: product tour copy, review snippets, known usage patterns, or reasoned inference marked as such

### 3. Per-competitor loopholes (what doesn't work)
- The 1–3 things users complain about, abandon, or route around
- Evidence: public reviews, known support-forum patterns, or reasoned inference marked as such
- This is the fuel for the differentiation map

### 4. Jobs-to-be-done alignment
- Which of the brief's implied JTBDs are well-served by competitors?
- Which are poorly served → differentiation opportunity?
- Which are unserved → either real greenfield or "users don't actually want this"

### 5. Copy & pattern inventory
- How do competitors name key concepts? (Consistent naming survives switching costs; unique naming signals positioning.)
- What patterns are genre conventions the user will expect? (Sidebar nav for admin tools; table-first for data products; dashboard cards for metrics.)
- What patterns are specific to competitor X that we should NOT copy (either because it's trademarked brand, or because it's been copied to death and feels dated)?

## Required truth standards

- **Every named competitor is a real, shipping product.** No invented companies. No "CompetitorX." Real names.
- **Every strength / loophole is either cited or labeled `> inferred, no direct source`.** Inference is legitimate; uncited claims pretending to be fact are not.
- **No copying of competitor copy verbatim.** We learn from patterns, we don't lift strings.
- **If no real competitors exist** (rare but possible for novel domains): say so explicitly and pivot to adjacent-market analysis — "this is greenfield in healthcare strategy management, but the analogous admin-tool category has these players: ..."

## How research.md uses this

The researcher (next agent) reads market-research.md and incorporates it:
- Personas reference real tools they currently use.
- JTBDs name which competitor fails at this job (if any).
- Context anchors include genre conventions we inherit.
- Gap inferences now cite "competitor X does this, we should do Y because..."

## How PRD uses this

The product-manager sees market-research.md and differentiation-map.md:
- Features are ranked by "differentiates us" vs "at-parity with competitors."
- Acceptance criteria for differentiating features have higher bars ("must outperform competitor X on this dimension").
- Out-of-scope reasoning cites "competitor X already does this at parity; not our moat."

## Operating mode

If `WebFetch` / `WebSearch` are available, market-researcher may supplement with live landing-page content. Output explicitly labels each finding: `[web-verified YYYY-MM-DD]` or `[inferred from training]`.

If live research is unavailable, the agent uses its domain knowledge and the `references/competitor-playbooks/` folder (curated per-domain competitor lists shipped with the skill). Inference-only mode is honest about its epistemic status.

## Anti-patterns (fail immediately)

- Generic competitor list from a market category page that doesn't match the brief's actual space.
- "Competitors include Google, Microsoft, Apple" without specific product names and why they're relevant.
- Strengths that all say the same thing ("clean UI, good UX, fast performance").
- Loopholes that are just trash-talking without evidence.
- No ties back to the brief's actual features.

## Success gate

- File exists at `<runRoot>/docs/market-research.md`.
- 3+ real competitors with real names.
- Each competitor has strengths + loopholes.
- Each loophole is traceable to a brief JTBD or feature.
- Every claim is either cited or labeled as inference.

## Related

- [agents/market-researcher.md](../agents/market-researcher.md)
- [rules/differentiation-mandate.md](differentiation-mandate.md)
- [rules/evidence-weighted-decisions.md](evidence-weighted-decisions.md)
