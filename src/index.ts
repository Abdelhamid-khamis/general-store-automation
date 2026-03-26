export { default as homePage } from './pages/HomePage';
export { default as productsPage } from './pages/ProductsPage';
export { default as cartPage } from './pages/CartPage';
export { BasePage } from './pages/BasePage';

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
} from './utils/helpers';

export { default as DriverManager } from './utils/driver';
export { default as capabilities } from './config/capabilities';
export { default as testData } from './data/testData.json';
