import {
  waitForElement,
  tapElement,
  takeScreenshot,
  pause,
} from '../utils/helpers';

export abstract class BasePage {
  protected async waitFor(selector: string, timeout?: number) {
    return waitForElement(selector, timeout);
  }

  protected async tap(selector: string): Promise<void> {
    await tapElement(selector);
  }

  protected async screenshot(name: string): Promise<void> {
    await takeScreenshot(name);
  }

  protected async sleep(ms: number): Promise<void> {
    await pause(ms);
  }

  abstract isLoaded(): Promise<boolean>;
}
