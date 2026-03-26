/**
 * Barrel exports — import Page Objects and utilities from a single entry point.
 *
 * Usage:
 *   import { homePage, productsPage, cartPage } from '../index';
 *   import { takeScreenshot, pause } from '../index';
 */

// ─── Pages ───────────────────────────────────────────────────────────────────
export { default as homePage } from './pages/HomePage';
export { default as productsPage } from './pages/ProductsPage';
export { default as cartPage } from './pages/CartPage';
export { BasePage } from './pages/BasePage';

// ─── Utils ───────────────────────────────────────────────────────────────────
export {
  waitForElement,
  waitForExist,
  tapElement,
  clearAndType,
  isDisplayed,
  scrollDown,
  scrollToText,
  pause,
  takeScreenshot,
  retry,
  DEFAULT_TIMEOUT,
  SHORT_TIMEOUT,
} from './utils/helpers';

export { default as DriverManager } from './utils/driver';

// ─── Config ──────────────────────────────────────────────────────────────────
export { default as capabilities } from './config/capabilities';

// ─── Data ────────────────────────────────────────────────────────────────────
export { default as testData } from './data/testData.json';
