import {
  waitForElement,
  tapElement,
  takeScreenshot,
  pause,
} from '../utils/helpers';

/**
 * BasePage
 * All Page Objects extend this class.
 * Provides shared navigation helpers and a uniform interface
 * for waiting, tapping, and screenshot capture.
 */
export abstract class BasePage {
  /**
   * Waits for a selector to be visible, then returns the element.
   */
  protected async waitFor(selector: string, timeout?: number) {
    return waitForElement(selector, timeout);
  }

  /**
   * Taps (clicks) an element identified by selector.
   */
  protected async tap(selector: string): Promise<void> {
    await tapElement(selector);
  }

  /**
   * Takes a named screenshot — called automatically on assertion failure.
   */
  protected async screenshot(name: string): Promise<void> {
    await takeScreenshot(name);
  }

  /**
   * Pauses execution for the given ms — use sparingly.
   */
  protected async sleep(ms: number): Promise<void> {
    await pause(ms);
  }

  /**
   * Subclasses must implement this to verify the page is loaded.
   */
  abstract isLoaded(): Promise<boolean>;
}
