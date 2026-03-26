import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // Tests share login state — must run sequentially
  fullyParallel: false,
  workers: 1,

  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,

  reporter: [
    ['list'],
    ['html', { outputFolder: '../reports/playwright', open: 'never' }],
    ['json', { outputFile: '../reports/playwright-results.json' }],
  ],

  use: {
    baseURL: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
    ignoreHTTPSErrors: true,
  },
});
