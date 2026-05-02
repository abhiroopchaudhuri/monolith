#!/usr/bin/env tsx
/**
 * parse-guidelines-repo.ts — Extract guideline content from inside a DS repo.
 *
 * USAGE:
 *   tsx scripts/parse-guidelines-repo.ts --repo <path> --out <dir>/guidelines/
 *
 * Walks docs/, guidelines/, brand/, principles.md, CONTRIBUTING.md, README.md,
 * all .md and .mdx files. Classifies paragraphs into seven topics.
 */

import fs from 'fs';
import path from 'path';

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
  'voice-tone': ['voice', 'tone', 'writing', 'copy', 'content', 'messaging', 'language'],
  'accessibility': ['a11y', 'accessibility', 'wcag', 'screen reader', 'keyboard', 'focus', 'contrast', 'aria'],
  'motion': ['animation', 'motion', 'transition', 'ease', 'duration', 'micro-interaction'],
  'spacing-layout': ['spacing', 'layout', 'grid', 'margin', 'padding', 'gap', 'breakpoint', 'responsive'],
  'color-usage': ['color', 'palette', 'theme', 'semantic color', 'background', 'surface', 'elevation'],
  'typography': ['typography', 'font', 'type', 'heading', 'body', 'line-height', 'letter-spacing'],
  'component-usage': ['component', 'pattern', 'usage', 'when to use', 'do not use', 'variant'],
};

function* walkDir(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(full);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      yield full;
    }
  }
}

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

  const repo = getArg('--repo');
  const outDir = getArg('--out');

  if (!repo || !outDir) {
    console.error('Usage: tsx scripts/parse-guidelines-repo.ts --repo <path> --out <dir>');
    process.exit(1);
  }

  const topicDocs: Record<string, string[]> = Object.fromEntries(TOPICS.map((t) => [t, []]));

  // Priority files first
  const priorityFiles = ['principles.md', 'CONTRIBUTING.md', 'README.md'];
  for (const f of priorityFiles) {
    const full = path.join(repo, f);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf-8');
      const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
      for (const section of sections) {
        const { topic, confidence } = classify(section);
        if (confidence >= 0.3) topicDocs[topic].push(`<!-- source: ${f} (confidence: ${confidence.toFixed(2)}) -->\n${section}`);
      }
    }
  }

  // Walk docs/, guidelines/, brand/
  const walkDirs = ['docs', 'guidelines', 'brand'].map((d) => path.join(repo, d));
  for (const dir of walkDirs) {
    for (const filePath of walkDir(dir)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
      for (const section of sections) {
        const { topic, confidence } = classify(section);
        if (confidence >= 0.3) {
          const rel = path.relative(repo, filePath);
          topicDocs[topic].push(`<!-- source: ${rel} (confidence: ${confidence.toFixed(2)}) -->\n${section}`);
        }
      }
    }
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const topic of TOPICS) {
    const docs = topicDocs[topic];
    const mdPath = path.join(outDir, `${topic}.md`);
    const jsonPath = path.join(outDir, `${topic}.json`);

    if (docs.length === 0) {
      const fallback = `# ${topic}\n\nNo inline coverage found in this repo. See fallback synthesis.\n`;
      fs.writeFileSync(mdPath, fallback, 'utf-8');
      fs.writeFileSync(jsonPath, JSON.stringify({ topic, inferred: false, sections: 0, sources: [] }, null, 2), 'utf-8');
    } else {
      fs.writeFileSync(mdPath, docs.join('\n\n---\n\n'), 'utf-8');
      fs.writeFileSync(
        jsonPath,
        JSON.stringify(
          {
            topic,
            inferred: false,
            sections: docs.length,
            sources: [...new Set(docs.map((d) => d.match(/<!-- source: ([^ ]+)/)?.[1]).filter(Boolean))],
          },
          null,
          2
        ),
        'utf-8'
      );
    }
  }

  console.log(`Guidelines extracted to ${outDir}`);
}

main();
