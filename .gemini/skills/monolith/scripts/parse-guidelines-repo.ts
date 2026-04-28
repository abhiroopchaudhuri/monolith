#!/usr/bin/env tsx
/**
 * parse-guidelines-repo.ts — Extract guideline content from inside a DS repo.
 *
 * USAGE:
 *   tsx scripts/parse-guidelines-repo.ts --repo <path> --out <dir>/guidelines/
 *
 * Walks: docs/, guidelines/, brand/, principles.md, CONTRIBUTING.md, README.md,
 * **/*.mdx. Classifies paragraphs into seven topics (see plan.md §6.1).
 *
 * Confidence signals:
 *   - Heading keywords (voice, accessibility, motion, spacing)
 *   - File path keywords (/docs/voice/*.mdx, /styles/typography.md)
 *   - Paragraph content keywords
 *
 * Output per topic: <topic>.md + <topic>.json. Untouched topics → "no inline
 * coverage — see fallback."
 *
 * TODO(M1): implement walker + classifier.
 */
export {};
// TODO: implement.
