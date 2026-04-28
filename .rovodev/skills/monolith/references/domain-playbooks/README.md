# Domain playbooks

Curated, hand-authored domain primers. Read by the researcher agent when the run's domain matches.

## Available playbooks

*(none yet — add as needed)*

## How playbooks are used

At Stage 3, `researcher` checks `input-manifest.promptType` + the brief for domain signals. If a matching playbook exists here, it is injected into the researcher's system prompt and its contents become citable evidence under `research.md § Guideline anchors`. The set of domains is OPEN — add a playbook file whenever you regularly work in a new domain.

## Writing a new playbook

Create `<domain>.md`. Required sections:

1. **Who uses this kind of product.** Roles, contexts, constraints.
2. **Common jobs to be done.** Verb-led.
3. **Key domain terms.** Short glossary.
4. **Common pitfalls.** What products in this space get wrong.
5. **A11y considerations specific to the domain.** Contexts of use that change the a11y bar (e.g., lighting conditions, device type, stressful context, accuracy requirements).
6. **Regulatory / compliance notes** (if applicable).
7. **Citation pool.** Books, articles, standards (real only).

Playbook content is AUTHORITATIVE for research — citations from a playbook are treated the same as citations from provided guidelines.

## Scope

Playbooks are about DOMAIN, not about visual design (that's in guidelines/) and not about products specifically (that's prior-art references inside research.md).
