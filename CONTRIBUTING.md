# Contributing

## Setup
```bash
npm install
cp .env.example .env   # fill in your local values
```

## Branch naming
- `feat/` — new test or feature
- `fix/` — locator or flakiness fix
- `chore/` — dependency updates, CI tweaks

## Before pushing
```bash
npm run type-check   # zero TS errors required
npm run lint         # zero ESLint errors required
```

## Adding a new test case
Edit `src/data/testData.json` — add a new object to the `testCases` array.
No code changes needed. The spec automatically iterates all entries.

## Adding a new Page Object
1. Create `src/pages/YourPage.ts` extending `BasePage`
2. Export a singleton at the bottom: `export default new YourPage()`
3. Re-export from `src/index.ts`

## Locator strategy (priority order)
1. `resource-id` (most stable)
2. `content-desc` (accessibility)
3. `text` (readable but brittle if copy changes)
4. `xpath` (last resort)
