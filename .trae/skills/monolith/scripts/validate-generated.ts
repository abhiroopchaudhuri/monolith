#!/usr/bin/env tsx
/**
 * validate-generated.ts — Static gates on the generated app.
 *
 * USAGE:
 *   tsx scripts/validate-generated.ts \
 *     --app out/<runId>/app/ \
 *     --index out/<runId>/ds-knowledge/component-index.json \
 *     [--gates PARSE,IMPORTS,PROPS,ICONS,DS_FIRST,COVERAGE,FIXTURES,AUDIT,ANTI_GENERIC,TOKENS] \
 *     --out out/<runId>/qa/validate.json
 *
 * Gates (see agents/dev-qa.md for descriptions):
 *   - PARSE         tsc --noEmit
 *   - IMPORTS       every DS import path matches adapter.importPath
 *   - PROPS         every prop on a DS component exists in component-index
 *   - ICONS         every icon name in icons.json.names
 *   - DS_FIRST      no raw HTML primitives, no hex literals, no hover-state JS hacks,
 *                   no custom .module.css for primitives; respects ds-first-allowed: comments
 *   - COVERAGE      every screen file renders without throwing (uses a JSDOM smoke)
 *   - FIXTURES      every fixture imports cleanly; has empty/error variants
 *   - AUDIT         every "ds-first-allowed:" comment has a reason after the colon
 *   - ANTI_GENERIC  (v3.1) runs antiGeneric() — regex probes from rules/ai-generic-anti-patterns.md §Part 5
 *                   against <appRoot>/src/** /*.{tsx,ts,css}. Emits qa/anti_generic_findings.json.
 *                   Blocker if count ≥5 OR any canonical compound tell (error/empty/dashboard AI shape);
 *                   major if count 3–4; minor if 1–2.
 *   - TOKENS        (advisory) every literal has a token equivalent
 *
 * Exit 0 when no blocking gate failed. Otherwise exit 1 + emit validate.json with
 * { gate, file, line, issue } per finding.
 *
 * References:
 *   - ../phase-1-build-with-ds/scripts/validate-generated.ts  (reuse + extend)
 *   - rules/ai-generic-anti-patterns.md §Part 5  (regex probes + severity mapping)
 *   - rules/premium-aesthetic-standard.md        (positive standard)
 *
 * TODO(M1 for PARSE/IMPORTS/DS_FIRST; M4 for COVERAGE/FIXTURES runtime; M4 for ANTI_GENERIC)
 *
 * antiGeneric() probe set — authoritative list lives in rules/ai-generic-anti-patterns.md §Part 5.
 * Keep this list and that file in sync. Each probe maps to a tell ID (AI-01..AI-25).
 *
 *   AI-01  /\bbg-(blue|indigo|violet|sky)-(500|600|700)\b/
 *   AI-01  /\btext-(blue|indigo|violet|sky)-(500|600|700)\b/
 *   AI-02  /\bbg-gradient-to-[a-z]+\b/
 *   AI-03  /from-(violet|purple|indigo)-.*?(to|via)-(blue|indigo|purple)/
 *   AI-04  /\bbg-(gray|slate|zinc|neutral)-50\b/
 *   AI-05  /\bborder-(gray|slate|zinc)-(100|200)\b/     // peer-border contexts only
 *   AI-06  /#(000000|ffffff|808080)\b/i
 *   AI-08  /\brounded-2xl\b/                             // blocker when >50% of rounded-* usages
 *   AI-09  /\brounded-full\b[^"]*\bbg-(blue|indigo|violet)-/
 *   AI-10  /\bborder-t-4\s+border-(blue|indigo|red|green|purple)-/
 *   AI-11  /\bshadow-(md|lg)\b/                          // same shadow across >3 card files
 *   AI-12  /\bbackdrop-blur-[a-z]+\s+bg-(white|black)\/[0-9]+/
 *   AI-14  absence of (tabular-nums|font-variant-numeric: tabular-nums) on numeric components
 *   AI-17  same as AI-14 (table/KPI/price surfaces)
 *   AI-21  /[\u{1F680}\u{2728}\u{1F4CA}\u{2705}\u{274C}\u{1F389}\u{1F525}]/u in .tsx not user-content
 *   AI-22  /rounded-full[^"]*\bbg-(blue|red|green|purple|yellow)-100\b[^"]*>\s*<[A-Z]/
 *   AI-24  /\btransition-all\b|transition:\s*all\b/
 *   AI-25  /Oops|Something went wrong|Let's get started|Your dashboard awaits|No items found|No data found/i
 *
 * Output schema (qa/anti_generic_findings.json):
 *   {
 *     attempt: number,
 *     findings: Array<{ tellId: "AI-XX", file: string, line: number, snippet: string, severity: "minor"|"major"|"blocker" }>,
 *     compoundTells: Array<{ shape: "error"|"empty"|"dashboard", screen: string, evidence: string[] }>,
 *     summary: { total: number, byTell: Record<string, number>, verdict: "pass"|"minor"|"major"|"blocker" }
 *   }
 */
export {};
// TODO: implement.
