import * as fs from 'fs';

const DEFAULT_TIMEOUT = 30000;

export async function waitForElement(
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebdriverIO.Element> {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout, timeoutMsg: `Element not visible: ${selector}` });
  return el;
}

export async function waitForExist(
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<WebdriverIO.Element> {
  const el = await $(selector);
  await el.waitForExist({ timeout, timeoutMsg: `Element not found: ${selector}` });
  return el;
}

export async function tapElement(selector: string): Promise<void> {
  const el = await $(selector);
  await el.waitForEnabled({ timeout: DEFAULT_TIMEOUT });
  await el.click();
}

export async function clearAndType(selector: string, text: string): Promise<void> {
  const el = await waitForElement(selector);
  await el.clearValue();
  await el.setValue(text);
  try {
    await driver.hideKeyboard();
    await driver.pause(1000);
  } catch {
    // keyboard may already be hidden
  }
}

export async function isDisplayed(selector: string): Promise<boolean> {
  try {
    const el = await $(selector);
    return await el.isDisplayed();
  } catch {
    return false;
  }
}

export async function scrollDown(
  startPercent = 0.8,
  endPercent = 0.2,
  durationMs = 800
): Promise<void> {
  const { width, height } = await driver.getWindowSize();
  const x = Math.round(width / 2);
  const startY = Math.round(height * startPercent);
  const endY = Math.round(height * endPercent);

  await driver.action('pointer', { parameters: { pointerType: 'touch' } })
    .move({ x, y: startY })
    .down()
    .pause(durationMs)
    .move({ x, y: endY, duration: durationMs })
    .up()
    .perform();
}

export async function scrollToText(text: string): Promise<WebdriverIO.Element> {
  const selector =
    `-android uiautomator` +
    `:new UiScrollable(new UiSelector().scrollable(true))` +
    `.scrollIntoView(new UiSelector().textContains("${text}"))`;
  return await $(selector);
}

export async function pause(ms: number): Promise<void> {
  await driver.pause(ms);
}

export async function takeScreenshot(name: string): Promise<void> {
  const dir = './reports/screenshots';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = `${dir}/${name}_${timestamp}.png`;

  await driver.saveScreenshot(filePath);
  console.log(`📸 Screenshot saved: ${filePath}`);
}

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
