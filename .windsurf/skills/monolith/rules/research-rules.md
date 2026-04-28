# Rule 4 — Research Discipline

> Research is the foundation every downstream doc relies on. Inventing research silently corrupts the PRD, the IA, the design. This rule defines what counts as valid research and what gets thrown out.

## Why this rule exists

An LLM is a plausibility engine. Ask it for "what users want from `<any product>`" and it will generate confident, specific, made-up answers. Those answers sound like research. They are not.

Everything in `research.md` must either be:
- **Anchored** — grounded in a real source the agent read (brief, guidelines, domain playbook), or
- **Inferred** — explicitly marked as inferred from plausibility, with the inference source stated.

There is no third bucket.

## The three sources of truth

1. **User-provided material.** The brief, any attached docs, guideline files. Direct quotes allowed.
2. **Skill-curated references.** [../references/domain-playbooks/](../references/domain-playbooks/) — hand-authored domain primers (an open set — add as your team's domains expand). These ARE authoritative when present.
3. **DS guideline docs.** `guidelines/voice.md`, `guidelines/ux-principles.md` — in-run resolved guidelines, citable.

Nothing else is a source. The LLM's own training distribution is not a source.

## What each research section allows

### Domain overview

- Fact-led paragraphs. Each fact cites a source (brief / playbook / guideline).
- If a fact has no source but is necessary, mark the paragraph with a leading `> inferred from brief, no external source.`
- **No statistics.** Not "80% of `<orgs>` use…" — never, under any circumstance.
- **No trends.** Not "with the rise of telehealth…" unless the brief says so.

### Personas

Two or three. Each persona has:
- **Name** — fictional, domain-plausible. Match the product's domain (role titles / cultural range) without using names that imply specific real people.
- **Goal** — one-line, verb-led, tied to the brief.
- **Frustration** — specific, plausibly daily, cites the brief or playbook.
- **Context of use** — where, when, on what device, under what pressure.

**No invented demographics.** Age, gender, marital status, ethnicity — omit unless a playbook treats them as load-bearing (rare, and only when the domain makes them operationally relevant).

**No composite personas that are 1:1 restatements of the brief.** If the brief names a role, the persona cannot just be "a `<role>` who uses the product." Add signal — context of use, frequency, constraints, current workaround.

### Jobs to be done

Verb-led, outcome-oriented. Concrete and measurable. Five or more. Must tie back to personas.

**Bad:** "Provide a good user experience." (not a JTBD — vague, not verb-led.)

**Good:** "`<verb>` `<object>` `<qualifier>`" — e.g. "Reconcile today's tasks against yesterday's backlog before my first meeting." (specific, verb-led, achievable, observable.)

### Prior art references

Real products only. At least two. Name, one-line reason you'd study them. If you cannot name any: say so explicitly and suggest what to look for. Do not invent products.

### Risks & unknowns

What you DON'T know. Things that real user research would need to settle before shipping v1. At least three. Each specific enough that a user could act on it (a good risk reads like a research question a team could book an interview for — not a vague hazard).

### Guideline anchors

Explicit. Which items from the resolved `guidelines/*.md` informed this research, with pull-quotes. If no guideline was relevant, say so.

## Forbidden phrases

These are immediate rewrites, not warnings:

- "Studies show…"
- "Research indicates…"
- "It is well-known that…"
- "Industry best practices say…"
- "Users generally prefer…" (without a playbook cite)
- "The average `<role>`…"
- "Data suggests…"
- Any statistic not from a cited source.

## Self-check before emitting research.md

The researcher agent must run this checklist on its own output:

1. Every fact in Domain overview has a cite or the paragraph is marked inferred.
2. Every persona has 3+ distinct attributes (goal, frustration, context minimum).
3. No persona has demographics that aren't load-bearing.
4. ≥5 JTBDs, each verb-led.
5. ≥2 prior-art products, each real and verifiable.
6. ≥3 risks, each specific and actionable.
7. No forbidden phrase appears.
8. Guideline anchors section references ≥1 guideline.

If any check fails, revise before returning to the orchestrator.

## When the brief is thin

If the brief is genuinely too thin for disciplined research (e.g., "build a dashboard"):
- Produce the most anchored research you can.
- Mark aggressively. `> inferred from brief.` paragraphs will be common.
- Recommend at the end of research.md: "RECOMMENDATION: conduct X user interviews before moving past MVP."

Do not invent to compensate. A short, honest `research.md` is infinitely better than a long, fabricated one.

## Tone

Neutral, specific, skeptical. A senior researcher reviewing a junior's draft. Not marketing copy.
