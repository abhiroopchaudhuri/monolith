#!/usr/bin/env tsx
/**
 * visual-smoke.ts — Playwright screenshot per route; basic structure diff vs plan.
 *
 * USAGE:
 *   tsx scripts/visual-smoke.ts \
 *     --url http://localhost:5173 \
 *     --plan <runRoot>/docs/screen-plan.json \
 *     --out <runRoot>/qa/screenshots/
 */

import fs from 'fs';
import path from 'path';

// Dynamic import Playwright so this file can be parsed without it installed
async function getPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('Playwright not installed. Run: npm install playwright');
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const baseUrl = getArg('--url') || 'http://localhost:5173';
  const planPath = getArg('--plan');
  const outDir = getArg('--out');

  if (!outDir) {
    console.error('Usage: tsx scripts/visual-smoke.ts --url <url> --plan <path> --out <dir>');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  let screens: any[] = [];
  if (planPath && fs.existsSync(planPath)) {
    const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));
    screens = plan.screens || [];
  }

  if (screens.length === 0) {
    console.warn('No screen plan provided. Taking screenshot of root route only.');
    screens = [{ id: 'home', route: '/' }];
  }

  const pw = await getPlaywright();
  const browser = await pw.chromium.launch({ headless: true });

  for (const screen of screens) {
    const route = screen.route || '/';
    const screenId = screen.id || route.replace(/[^a-z0-9]/gi, '_');
    const url = `${baseUrl}${route}`;

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const start = Date.now();
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      // Wait for a landmark or data-section
      await page.waitForSelector('[data-section], main, [role="main"]', { timeout: 5000 }).catch(() => {});
    } catch (e) {
      console.warn(`Failed to load ${url}:`, (e as Error).message);
    }
    const loadTime = Date.now() - start;

    // Screenshot
    const screenshotPath = path.join(outDir, `${screenId}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Structure check
    const sections = await page.locator('[data-section]').count();
    const landmarks = await page.locator('main, [role="main"], nav, [role="navigation"], header, footer').count();

    const meta = {
      screenId,
      route,
      url,
      loadTimeMs: loadTime,
      sectionsFound: sections,
      sectionsExpected: screen.sections?.length ?? null,
      landmarksFound: landmarks,
      screenshot: screenshotPath,
      warnings: [] as string[],
    };

    if (screen.sections && sections !== screen.sections.length) {
      meta.warnings.push(`Section count mismatch: found ${sections}, expected ${screen.sections.length}`);
    }

    fs.writeFileSync(path.join(outDir, `${screenId}.meta.json`), JSON.stringify(meta, null, 2), 'utf-8');
    console.log(`Screenshot ${screenId}: ${sections} sections, ${landmarks} landmarks, ${loadTime}ms`);

    await context.close();
  }

  await browser.close();
  console.log(`Screenshots saved to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
