import * as fs from 'fs';

/**
 * Shared helpers used across all Page Objects.
 * Centralises element waits, gestures, and screenshot capture
 * to keep Page Objects lean and DRY.
 */

const DEFAULT_TIMEOUT = 30000;
const SHORT_TIMEOUT = 10000;

/**
 * Waits for an element to be displayed and returns it.
 */
export async function waitForElement(
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebdriverIO.Element> {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout, timeoutMsg: `Element not visible: ${selector}` });
  return el;
}

/**
 * Waits for an element to exist in DOM (not necessarily visible).
 */
export async function waitForExist(
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebdriverIO.Element> {
  const el = await $(selector);
  await el.waitForExist({ timeout, timeoutMsg: `Element not found: ${selector}` });
  return el;
}

/**
 * Clicks an element after waiting for it to be clickable.
 */
export async function tapElement(selector: string): Promise<void> {
  const el = await $(selector);
  await el.waitForEnabled({ timeout: DEFAULT_TIMEOUT });
  await el.click();
}

/**
 * Clears a field and types text.
 */
export async function clearAndType(selector: string, text: string): Promise<void> {
  const el = await waitForElement(selector);
  await el.clearValue();
  await el.setValue(text);
  // Dismiss keyboard on Android 14
  try {
    await driver.hideKeyboard();
    await driver.pause(1000); // Wait for keyboard to fully dismiss and layout to reflow
  } catch {
    // Keyboard may already be hidden — safe to ignore
  }
}

/**
 * Checks if an element is currently displayed (non-throwing).
 */
export async function isDisplayed(selector: string): Promise<boolean> {
  try {
    const el = await $(selector);
    return await el.isDisplayed();
  } catch {
    return false;
  }
}

/**
 * Scrolls down by a fixed amount using W3C Actions.
 */
export async function scrollDown(
  startPercent = 0.8,
  endPercent = 0.2,
  durationMs = 800
): Promise<void> {
  const { width, height } = await driver.getWindowSize();
  const x = Math.round(width / 2);
  const startY = Math.round(height * startPercent);
  const endY = Math.round(height * endPercent);

  await driver.action('pointer', {
    parameters: { pointerType: 'touch' },
  })
    .move({ x, y: startY })
    .down()
    .pause(durationMs)
    .move({ x, y: endY, duration: durationMs })
    .up()
    .perform();
}

/**
 * Scrolls to an element using UiScrollable (Android-specific).
 */
export async function scrollToText(text: string): Promise<WebdriverIO.Element> {
  const selector =
    `-android uiautomator` +
    `:new UiScrollable(new UiSelector().scrollable(true))` +
    `.scrollIntoView(new UiSelector().textContains("${text}"))`;
  return await $(selector);
}

/**
 * Pauses execution for the given milliseconds.
 */
export async function pause(ms: number): Promise<void> {
  await driver.pause(ms);
}

/**
 * Takes a screenshot and saves it to the reports folder.
 */
export async function takeScreenshot(name: string): Promise<void> {
  const dir = './reports/screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `${dir}/${name}_${timestamp}.png`;

  await driver.saveScreenshot(filePath);
  console.log(`📸 Screenshot saved: ${filePath}`);
}

/**
 * Retries a failing async action up to `attempts` times.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await pause(delayMs);
    }
  }
  throw lastError;
}

export { DEFAULT_TIMEOUT, SHORT_TIMEOUT };
