# Competitor Playbooks

Curated per-domain competitor lists for `market-researcher` to draw from when WebFetch / WebSearch is unavailable or when the domain has a well-known competitor set worth pre-capturing.

## Structure

One markdown file per domain:

```
competitor-playbooks/
├── README.md                          ← this file
├── healthcare-admin.md                ← clinical admin tools (Epic, CareTrax, HealthEdge, ...)
├── b2b-crm.md                         ← CRM / sales tools
├── data-analytics.md                  ← dashboards, BI
├── developer-tools.md                 ← dev platforms, CI/CD, observability
├── fintech-b2c.md                     ← consumer finance
├── content-creation.md                ← writing, video, design tools
└── _template.md                       ← blank template for new domains
```

## Per-playbook shape

Each playbook is a curated list of 5–15 real shipping products, with:

- Product name + URL
- Segment (enterprise / mid-market / SMB / consumer)
- Positioning (one line)
- Pricing model
- 1–3 widely-known strengths
- 1–3 widely-known loopholes / user complaints
- Distinctive UX signatures
- Genre conventions this product exemplifies
- Date of last human review (so staleness is visible)

## How market-researcher uses these

At run time:
1. Identify the domain from the brief.
2. If a matching playbook exists → use it as grounding.
3. Supplement with live web research if tools are available.
4. Cite the playbook date in `market-research.md § Methodology` so staleness is visible.

## How to contribute a new playbook

1. Copy `_template.md` to `<your-domain>.md`.
2. Fill in 5+ real, shipping products.
3. Cite every claim (review site, public page, experience report, or inference with reasoning).
4. Date the file at the top.
5. Open a PR; a human reviews before merging into the skill.

## Staleness policy

- Playbooks older than 12 months flag in `market-research.md § Methodology` as "possibly stale."
- Playbooks older than 24 months are treated as `[domain-pattern]` weight only — not `[cited-inference]`.
- When a product in a playbook is known to have shut down, update the playbook OR remove that product with a note.

## What is NOT in a playbook

- Opinions about which product is "best."
- Screenshots (they go stale fast; reference live pages instead).
- Pricing numbers (they change; name the tiers).
- Internal-only product knowledge.
