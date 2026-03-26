import type { Options } from '@wdio/types';
import capabilities from './src/config/capabilities';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WdioMochawesomeReporter = require('wdio-mochawesome-reporter').default;

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: path.join(__dirname, 'tsconfig.json'),
    },
  },

  // ─── Appium Server ───────────────────────────────────────────────────────────
  port: 4723,
  path: '/wd/hub',
  hostname: 'localhost',

  // ─── Test Specs ──────────────────────────────────────────────────────────────
  specs: ['./src/tests/**/*.spec.ts'],
  exclude: [],

  // ─── Capabilities ────────────────────────────────────────────────────────────
  maxInstances: 1,
  capabilities: [capabilities],

  // ─── Framework ───────────────────────────────────────────────────────────────
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
    retries: 1,
  },

  // ─── Reporters ───────────────────────────────────────────────────────────────
  reporters: [
    'spec',
    [WdioMochawesomeReporter, {
      outputDir: './reports/json',
      outputFileFormat(opts: { cid: string }) {
        return `results-${opts.cid}.json`;
      },
    }],
  ],

  // ─── Logging ─────────────────────────────────────────────────────────────────
  logLevel: 'info',
  bail: 0,
  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // ─── Hooks ───────────────────────────────────────────────────────────────────
  onPrepare(): void {
    const fs = require('fs');
    ['./reports/json', './reports/html'].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
    console.log('\n🚀 General Store Automation Suite Starting...\n');
  },

  onComplete(): void {
    console.log('\n✅ Test run complete.\n');
  },

  beforeTest(test): void {
    console.log(`\n▶ Running: ${test.title}`);
  },

  afterTest(test, _ctx, { passed }): void {
    const icon = passed ? '✔' : '✘';
    console.log(`${icon} ${test.title} — ${passed ? 'PASSED' : 'FAILED'}`);
  },
};
