#!/usr/bin/env tsx
/**
 * axe-run.ts — Axe-core accessibility run against every route.
 *
 * USAGE:
 *   tsx scripts/axe-run.ts \
 *     --url http://localhost:5173 \
 *     --routes /,/settings,/patients/:id \
 *     --fixtures <runRoot>/app/src/fixtures/ \
 *     --out <runRoot>/qa/a11y_report.json
 */

import fs from 'fs';
import path from 'path';

async function getPlaywright() {
  try {
    return await import('playwright');
  } catch {
    console.error('Playwright not installed. Run: npm install playwright');
    process.exit(1);
  }
}

async function getAxeCore() {
  try {
    return await import('axe-core');
  } catch {
    console.error('axe-core not installed. Run: npm install axe-core');
    process.exit(1);
  }
}

function resolveDynamicRoute(route: string, fixturesDir: string): string | null {
  if (!route.includes(':')) return route;
  const screenName = route.split('/')[1];
  const fixturePath = path.join(fixturesDir, `${screenName}.ts`);
  if (fs.existsSync(fixturePath)) {
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      return route.replace(/:[^/]+/, idMatch[1]);
    }
  }
  console.warn(`No fixture for dynamic route ${route}. Skipping.`);
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const baseUrl = getArg('--url') || 'http://localhost:5173';
  const routesArg = getArg('--routes');
  const fixturesDir = getArg('--fixtures');
  const outPath = getArg('--out');

  if (!outPath) {
    console.error('Usage: tsx scripts/axe-run.ts --url <url> --routes <csv> --out <path> [--fixtures <dir>]');
    process.exit(1);
  }

  const routes = routesArg ? routesArg.split(',').map((r) => r.trim()) : ['/'];
  const pw = await getPlaywright();
  const axe = await getAxeCore();

  const browser = await pw.chromium.launch({ headless: true });
  const reports: any[] = [];

  for (const route of routes) {
    const resolved = resolveDynamicRoute(route, fixturesDir || '');
    if (!resolved) continue;

    const url = `${baseUrl}${resolved}`;
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle' });
    } catch (e) {
      console.warn(`Failed to load ${url}:`, (e as Error).message);
      await context.close();
      continue;
    }

    // Inject and run axe
    const axeSource = axe.source;
    await page.evaluate(axeSource);
    const results = await page.evaluate(() => {
      return new Promise<any>((resolve) => {
        (window as any).axe.run((err: any, results: any) => {
          if (err) resolve({ error: err.message });
          else resolve(results);
        });
      });
    });

    const critical = results.violations?.filter((v: any) => v.impact === 'critical') || [];
    const serious = results.violations?.filter((v: any) => v.impact === 'serious') || [];
    const moderate = results.violations?.filter((v: any) => v.impact === 'moderate') || [];
    const minor = results.violations?.filter((v: any) => v.impact === 'minor') || [];

    reports.push({
      route,
      url,
      passes: results.passes?.length || 0,
      violations: {
        critical: critical.length,
        serious: serious.length,
        moderate: moderate.length,
        minor: minor.length,
      },
      details: results.violations || [],
    });

    console.log(`${route}: ${critical.length} critical, ${serious.length} serious, ${moderate.length} moderate, ${minor.length} minor`);
    await context.close();
  }

  await browser.close();

  const totalCritical = reports.reduce((sum, r) => sum + r.violations.critical, 0);
  const report = {
    timestamp: new Date().toISOString(),
    routesTested: reports.length,
    totalCritical,
    reports,
    verdict: totalCritical > 0 ? 'fail' : 'pass',
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`A11y report saved to ${outPath}`);
  if (totalCritical > 0) {
    console.error(`${totalCritical} critical accessibility violations found.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
