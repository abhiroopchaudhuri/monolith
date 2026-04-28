#!/usr/bin/env tsx
/**
 * generate-guidelines-fallback.ts — Synthesize guideline docs from DS evidence only.
 *
 * USAGE:
 *   tsx scripts/generate-guidelines-fallback.ts \
 *     --index <path>/component-index.json \
 *     --tokens <path>/tokens.json \
 *     --readme <path>/README.md \
 *     --out <dir>/guidelines/
 *
 * Implements rules/guidelines-inference-rules.md. Every claim carries inline
 * evidence citations in the form [evidence: <type>:<ref>]. Topics with zero
 * evidence emit the literal "Insufficient evidence — recommend human authoring."
 * and have inferred: false in frontmatter.
 *
 * Post-process strips uncited claims.
 *
 * TODO(M1): implement the Sonnet-prompted synthesis + the post-processor.
 */
export {};
// TODO: implement.
