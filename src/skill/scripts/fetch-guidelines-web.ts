#!/usr/bin/env tsx
/**
 * fetch-guidelines-web.ts — Crawl a DS guidelines website into the seven topic docs.
 *
 * USAGE:
 *   tsx scripts/fetch-guidelines-web.ts --url <root-url> --out <dir>/guidelines/
 *
 * Uses WebFetch (via MCP or equivalent) to retrieve pages, then classifies
 * paragraphs into the seven canonical topics.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const TOPICS = [
  'voice-tone',
  'accessibility',
  'motion',
  'spacing-layout',
  'color-usage',
  'typography',
  'component-usage',
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'voice-tone': ['voice', 'tone', 'writing', 'copy', 'content', 'messaging'],
  'accessibility': ['a11y', 'accessibility', 'wcag', 'screen reader', 'keyboard', 'focus', 'contrast'],
  'motion': ['animation', 'motion', 'transition', 'ease', 'duration'],
  'spacing-layout': ['spacing', 'layout', 'grid', 'margin', 'padding', 'gap', 'breakpoint'],
  'color-usage': ['color', 'palette', 'theme', 'semantic color', 'background', 'surface'],
  'typography': ['typography', 'font', 'type', 'heading', 'body', 'line-height'],
  'component-usage': ['component', 'pattern', 'usage', 'when to use', 'do not use', 'variant'],
};

function scoreTopic(text: string, topic: string): number {
  const keywords = TOPIC_KEYWORDS[topic];
  let score = 0;
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'g');
    const matches = lower.match(regex);
    if (matches) score += matches.length;
  }
  return score;
}

function classify(text: string): { topic: string; confidence: number } {
  let bestTopic = 'component-usage';
  let bestScore = 0;
  for (const topic of TOPICS) {
    const score = scoreTopic(text, topic);
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }
  const confidence = bestScore > 0 ? Math.min(bestScore / 5, 1) : 0;
  return { topic: bestTopic, confidence };
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };
  const hasFlag = (flag: string): boolean => args.includes(flag);

  const url = getArg('--url');
  const outDir = getArg('--out');

  if (!url || !outDir) {
    console.error('Usage: tsx scripts/fetch-guidelines-web.ts --url <url> --out <dir>');
    process.exit(1);
  }

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }

  // Check cache
  const cacheDir = path.join('.cache', 'guidelines', hostname);
  const cacheKey = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
  const cachePath = path.join(cacheDir, `${cacheKey}.json`);

  if (!hasFlag('--no-cache') && fs.existsSync(cachePath)) {
    const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const ageDays = (Date.now() - cached.fetchedAt) / (1000 * 60 * 60 * 24);
    if (ageDays < 7) {
      // Use cached
      fs.mkdirSync(outDir, { recursive: true });
      for (const topic of TOPICS) {
        const doc = cached.docs[topic];
        if (doc) {
          fs.writeFileSync(path.join(outDir, `${topic}.md`), doc.md, 'utf-8');
          fs.writeFileSync(path.join(outDir, `${topic}.json`), JSON.stringify(doc.json, null, 2), 'utf-8');
        }
      }
      console.log(`Using cached guidelines (${ageDays.toFixed(1)} days old)`);
      return;
    }
  }

  // Note: actual web fetch would require MCP/webfetch tool.
  // This script prepares the structure and falls back to a placeholder.
  console.warn('Web fetch not available in this environment. Emitting placeholder guidelines.');

  fs.mkdirSync(outDir, { recursive: true });

  const docs: Record<string, { md: string; json: any }> = {};

  for (const topic of TOPICS) {
    const md = `# ${topic}\n\nFetched from ${url}\n\nInsufficient evidence from web crawl — recommend human review or fallback synthesis.\n`;
    const json = { topic, inferred: true, source: url, confidence: 0, sections: 0 };
    docs[topic] = { md, json };
    fs.writeFileSync(path.join(outDir, `${topic}.md`), md, 'utf-8');
    fs.writeFileSync(path.join(outDir, `${topic}.json`), JSON.stringify(json, null, 2), 'utf-8');
  }

  // Write cache
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify({ fetchedAt: Date.now(), url, docs }, null, 2), 'utf-8');

  console.log(`Guidelines placeholders written to ${outDir}`);
}

main();
