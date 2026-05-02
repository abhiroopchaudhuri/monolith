#!/usr/bin/env tsx
/**
 * scaffold-app.ts — Lay down the Vite + DS + router + theme skeleton.
 *
 * USAGE:
 *   tsx scripts/scaffold-app.ts \
 *     --plan <runRoot>/docs/build_specs.md \
 *     --specs <runRoot>/docs/design_decisions.md \
 *     --guidelines <runRoot>/guidelines/ \
 *     --tokens <runRoot>/ds-knowledge/tokens.json \
 *     --index <runRoot>/ds-knowledge/component-index.json \
 *     --adapter ../shared/ds-adapters/<name>.json \
 *     --out <runRoot>/app/
 *
 * Reads build_specs.md § file tree + adapter. Writes a minimal Vite React scaffold.
 */

import fs from 'fs';
import path from 'path';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

function readAdapter(adapterPath: string): any {
  if (!fs.existsSync(adapterPath)) {
    console.error(`Adapter not found: ${adapterPath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(adapterPath, 'utf-8'));
}

function main() {
  const args = process.argv.slice(2);
  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const outDir = getArg('--out');
  const adapterPath = getArg('--adapter');
  const tokensPath = getArg('--tokens');
  const indexPath = getArg('--index');

  if (!outDir || !adapterPath) {
    console.error('Usage: tsx scripts/scaffold-app.ts --out <dir> --adapter <path> [...]');
    process.exit(1);
  }

  const adapter = readAdapter(adapterPath);
  const dsPackage = adapter.package ?? adapter.name ?? 'design-system';
  const dsImportPath = adapter.importPath ?? dsPackage;

  ensureDir(outDir);
  ensureDir(path.join(outDir, 'src', 'screens'));
  ensureDir(path.join(outDir, 'src', 'fixtures'));
  ensureDir(path.join(outDir, 'src', 'custom'));
  ensureDir(path.join(outDir, 'src', 'theme'));

  // package.json
  writeFile(
    path.join(outDir, 'package.json'),
    JSON.stringify(
      {
        name: 'monolith-app',
        private: true,
        version: '0.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1',
          'react-router-dom': '^6.26.0',
          [dsPackage]: 'latest',
        },
        devDependencies: {
          '@types/react': '^18.3.3',
          '@types/react-dom': '^18.3.0',
          '@vitejs/plugin-react': '^4.3.1',
          typescript: '^5.5.3',
          vite: '^5.4.0',
        },
      },
      null,
      2
    )
  );

  // tsconfig.json
  writeFile(
    path.join(outDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }],
      },
      null,
      2
    )
  );

  // tsconfig.node.json
  writeFile(
    path.join(outDir, 'tsconfig.node.json'),
    JSON.stringify(
      {
        compilerOptions: {
          composite: true,
          skipLibCheck: true,
          module: 'ESNext',
          moduleResolution: 'bundler',
          allowSyntheticDefaultImports: true,
        },
        include: ['vite.config.ts'],
      },
      null,
      2
    )
  );

  // vite.config.ts
  writeFile(
    path.join(outDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n})\n`
  );

  // index.html
  writeFile(
    path.join(outDir, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Monolith App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );

  // src/main.tsx
  writeFile(
    path.join(outDir, 'src', 'main.tsx'),
    `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport { BrowserRouter } from 'react-router-dom'\nimport App from './App'\nimport { ThemeProvider } from './theme/ThemeProvider'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <BrowserRouter>\n      <ThemeProvider>\n        <App />\n      </ThemeProvider>\n    </BrowserRouter>\n  </React.StrictMode>,\n)\n`
  );

  // src/App.tsx
  writeFile(
    path.join(outDir, 'src', 'App.tsx'),
    `import { Routes, Route } from 'react-router-dom'\nimport { AppLayout } from './components/layout/AppLayout'\n\nexport default function App() {\n  return (\n    <AppLayout>\n      <Routes>\n        <Route path="/" element={<div>Home</div>} />\n      </Routes>\n    </AppLayout>\n  )\n}\n`
  );

  // src/routes.tsx (placeholder)
  writeFile(
    path.join(outDir, 'src', 'routes.tsx'),
    `// Routes will be generated by the developer agent.\nexport const routes = [{ path: '/', element: <div>Home</div> }];\n`
  );

  // src/theme/ThemeProvider.tsx
  const providerContent = adapter.themeProvider
    ? `import type { ReactNode } from 'react';\nimport { ${adapter.themeProvider.name} } from '${dsImportPath}'\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  return <${adapter.themeProvider.name}>{children}</${adapter.themeProvider.name}>\n}\n`
    : `import type { ReactNode } from 'react';\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  return <>{children}</>\n}\n`;
  writeFile(path.join(outDir, 'src', 'theme', 'ThemeProvider.tsx'), providerContent);

  // Copy tokens and index if provided
  if (tokensPath && fs.existsSync(tokensPath)) {
    fs.copyFileSync(tokensPath, path.join(outDir, 'src', 'theme', 'tokens.json'));
  }
  if (indexPath && fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(outDir, 'src', 'theme', 'component-index.json'));
  }

  // Write a scaffold manifest for the developer agent
  writeFile(
    path.join(outDir, '.scaffold.json'),
    JSON.stringify(
      {
        dsPackage,
        dsImportPath,
        adapterPath,
        generatedAt: new Date().toISOString(),
        screensDir: 'src/screens',
        fixturesDir: 'src/fixtures',
      },
      null,
      2
    )
  );

  console.log(`Scaffolded app at ${outDir}`);
}

main();
