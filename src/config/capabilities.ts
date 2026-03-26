export interface AppiumCapabilities {
  platformName: string;
  'appium:automationName': string;
  'appium:deviceName': string;
  'appium:platformVersion': string;
  'appium:app': string;
  'appium:appPackage': string;
  'appium:appActivity': string;
  'appium:noReset': boolean;
  'appium:fullReset': boolean;
  'appium:autoGrantPermissions': boolean;
  'appium:newCommandTimeout': number;
  'appium:androidInstallTimeout': number;
  'appium:adbExecTimeout': number;
  'appium:uiautomator2ServerInstallTimeout': number;
  'appium:ensureWebviewsHavePages': boolean;
  'appium:nativeWebScreenshot': boolean;
  'appium:connectHardwareKeyboard': boolean;
}

const capabilities: AppiumCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.DEVICE_NAME || 'emulator-5554',
  'appium:platformVersion': process.env.PLATFORM_VERSION || '14.0',
  'appium:app': process.env.APP_PATH ?? `${process.cwd()}/apps/General-Store.apk`,
  'appium:appPackage': 'com.androidsample.generalstore',
  'appium:appActivity': 'com.androidsample.generalstore.SplashActivity',
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 60,
  'appium:androidInstallTimeout': 90000,
  'appium:adbExecTimeout': 30000,
  'appium:uiautomator2ServerInstallTimeout': 60000,
  'appium:ensureWebviewsHavePages': true,
  'appium:nativeWebScreenshot': true,
  'appium:connectHardwareKeyboard': false,
};

export default capabilities;
