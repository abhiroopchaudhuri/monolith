# DS Adapters

This folder ships starter adapter files so a fresh user has something concrete to point `--ds-repo` at.

## What's here

- `shadcn.json` — adapter for shadcn-ui v0.x (Tailwind v4 @theme blocks). Adjust `repoRoot` to your local clone.

## Adding a new adapter

Copy `shadcn.json` and edit the fields. Required:

- `name`, `framework`, `entry`, `importPath`
- `componentsGlob`, `storiesGlob`, `docsGlob`
- `propTypes.source` (`typescript` / `prop-types` / `storybook`) and (for typescript) `propTypes.tsconfig`
- `variantProps[]` — discriminator props like `variant`, `size`, `appearance`
- `iconPackage` — npm package the DS uses for icons
- `tokens.source` (`css-vars` / `theme-object` / `design-tokens-json` / `tailwind-config`) + `tokens.files[]`
- `themeAccess.style` and `themeAccess.kind` — see `rules/theming-input-normalization.md § bridge.kind`
- `layoutPrimitives[]` — components the DS treats as layout primitives

Validate the adapter:

```bash
npm run index-ds-repo -- --adapter examples/ds-adapters/<your>.json --dry-run
```

The indexer reports what it found and what failed. Iterate on the adapter until the report is clean. ~30 minutes for a well-typed DS.
