import { remote, Browser } from 'webdriverio';
import capabilities from '../config/capabilities';

/**
 * Singleton driver manager.
 * Ensures one WebdriverIO session is shared across all Page Objects
 * within a single Mocha test run.
 */
class DriverManager {
  private static instance: Browser | null = null;

  /**
   * Returns the active WebdriverIO Browser instance.
   * In WDIO runner mode, the global `driver` is injected automatically —
   * this getter provides a typed wrapper for use in Page Objects.
   */
  static getDriver(): Browser {
    if (typeof driver !== 'undefined') {
      // WDIO test runner injects `driver` globally — prefer that
      return driver as unknown as Browser;
    }

    if (!DriverManager.instance) {
      throw new Error(
        'Driver not initialised. Ensure WebdriverIO runner is active.'
      );
    }
    return DriverManager.instance;
  }

  /**
   * Creates a standalone WebdriverIO session (for use outside WDIO runner).
   */
  static async createSession(): Promise<Browser> {
    DriverManager.instance = await remote({
      hostname: 'localhost',
      port: 4723,
      path: '/',
      capabilities: capabilities as WebdriverIO.Capabilities,
      logLevel: 'silent',
    });
    return DriverManager.instance;
  }

  /**
   * Terminates the standalone session if one exists.
   */
  static async destroySession(): Promise<void> {
    if (DriverManager.instance) {
      await DriverManager.instance.deleteSession();
      DriverManager.instance = null;
    }
  }
}

export default DriverManager;
