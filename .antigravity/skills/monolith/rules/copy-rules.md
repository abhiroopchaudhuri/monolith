# Rule 5 — Copy Realism

> The copy in a generated prototype is not filler. It is part of the design. Bad copy makes the prototype unreviewable; good copy makes it feel real. This rule defines the bar.

## The non-negotiables

- **No Lorem ipsum.** Ever. Not in placeholders, not in table rows, not in tooltips.
- **No `Title1 / Title2 / Heading` strings.** Headings have real content or they don't exist.
- **No `John Doe / Jane Smith`** for realistic-domain apps. Use a seeded faker pool of domain-appropriate names.
- **No default "Click here" buttons.** Every CTA has a verb that says what happens.
- **No invented statistics in UI copy.** "47% of users…" in a banner is forbidden.

## The voice source

`out/<runId>/guidelines/voice.md` is authoritative. It is resolved in Stage 2 from the user's provided voice doc, the DS's website, the repo, or generated. Every copy-writing agent (PM, designer, developer) reads it before writing a single word.

Required voice.md fields (see [../guidelines-schema/voice.schema.json](../guidelines-schema/voice.schema.json)):
- `toneWords[]` — 3+ adjectives (e.g., "clear, direct, warm")
- `dos[]` — with examples
- `donts[]` — with examples
- `examplePhrases[]` — ≥3 sample phrases in the DS's voice

If voice.md has `inferred: false` and insufficient evidence, copy quality drops — flag at G2.

## Seeded faker pools

The developer agent uses a seeded faker. The seed is ALWAYS the `runId` so the same brief produces the same copy.

Pools are **domain-selected** from `research.md`. The skill does not ship a closed list of domains — it derives pools from the brief + research.md + any matching playbook under `references/domain-playbooks/`.

Shape of a pool (the researcher/developer derive values, not the skill):

| Field | Sourced from |
|---|---|
| Name pool | Domain convention in the brief + playbook + `guidelines/voice.md` |
| Number pool | Unit + realistic range for the product's metrics |
| Date pool | Locale from input-manifest + recency appropriate to the JTBD |

If research.md names no domain signal, default to neutral-SaaS name/date/number conventions.

When in doubt, defer to the input-manifest's `locale` + research.md's domain section.

## Realism constraints by UI surface

### Summary / metric values
- Round to what a real product would show (e.g., "1.2k" not "1,247" in a compact tile).
- Trend deltas include sign: "+4.2%" / "−1.1%".
- Use the DS's Statistic / Metric / Number component if indexed — many DS have formatting built in.

### Table rows
- ≥5 rows with distinct, varied content.
- Always include at least one edge-case row: empty cell, very long string, multi-line content, special character.
- Sort order that makes sense for the table's purpose (most recent, highest priority, alphabetical).

### Form fields
- Placeholders describe format, not repeat the label. Label: "Phone". Placeholder: "+1 555 555 0000".
- Error messages are actionable. "Enter an email like name@example.com" not "Invalid email."
- Helper text adds information the label can't carry.

### Empty states
- Explain why the space is empty + what the user can do next.
- Offer a primary action when applicable.
- Never just say "No data." Say what kind of data is absent and the next step.

### Loading states
- Never a blank page. A skeleton, a shimmer, or a semantic message.
- If using the DS's Skeleton, match the eventual content shape (number of rows, approximate widths).

### Error states
- State what broke, in plain language.
- Offer one action: retry, go-home, contact-support.
- Never dump a stack trace.

## Case conventions

From `guidelines/content.md`. Typical values:
- Buttons, links, menu items → **sentence case** ("Save changes") unless the DS explicitly says otherwise.
- Headings → sentence case unless brand says title case.
- Labels → sentence case.
- Badges/status pills → UPPER-CASE only if the DS's Badge component does so.

The generator follows whatever content.md says. If content.md is inferred: false, default to sentence case.

## Dates, numbers, currency

From `guidelines/content.md` + `input-manifest.constraints.locale`. The generator uses `Intl.DateTimeFormat` and `Intl.NumberFormat` with the locale; it does NOT hand-format unless the DS provides a formatter.

## Icon-text pairing

If an icon appears with text:
- The icon is supportive, not decorative. The text must stand on its own.
- If the text and icon disagree (icon says "delete", text says "archive"), rewrite the text.

## Copy review rubric (used by design-qa)

For 10 random samples per run:
- **Specific** (1–10) — does this copy mean something to a user in this product?
- **Voice-matched** (1–10) — does it read as voice.md describes?
- **Actionable** (1–10) — if it's a CTA or error, does it tell the user what to do?
- **Concise** (1–10) — any redundancy or filler?

Average ≥7 to pass.

## Fabrication guardrails

Specific things the generator MUST NOT invent:
- Company names implying real organizations ("Stanford Medical Center").
- Product brand names that aren't in the DS or brief ("SalesforceForHospitals").
- Specific prices for real products.
- Specific dates of real events.
- Quotes from named "users" ("Maria said…").
- Any URL pointing to a domain not in the brief.
