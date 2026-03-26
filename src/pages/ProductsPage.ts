import { BasePage } from './BasePage';
import { waitForElement, pause } from '../utils/helpers';

export class ProductsPage extends BasePage {
  private readonly productList = '//androidx.recyclerview.widget.RecyclerView';
  private readonly productItems = '//androidx.recyclerview.widget.RecyclerView//android.widget.LinearLayout';
  private readonly secondAddToCartBtn = '(//android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productAddCart"])[2]';
  private readonly secondProductName = '(//android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productName"])[2]';

  public addedProductName = '';

  async isLoaded(): Promise<boolean> {
    try {
      await waitForElement(this.productList, 20000);
      return true;
    } catch {
      return false;
    }
  }

  async addFirstProductToCart(): Promise<string> {
    console.log('  → Waiting for Add to Cart button...');
    const targetBtn = await $(this.secondAddToCartBtn);
    await targetBtn.waitForExist({ timeout: 20000 });

    try {
      const nameEl = await $(this.secondProductName);
      this.addedProductName = (await nameEl.getText()).trim();
    } catch {
      this.addedProductName = 'Unknown Product';
    }

    console.log(`  → Adding product: "${this.addedProductName}"`);
    await targetBtn.click();
    await pause(500);
    console.log(`  ✔ Product added to cart: "${this.addedProductName}"`);
    return this.addedProductName;
  }

  async goToCart(): Promise<void> {
    console.log('  → Navigating to cart...');

    const cartSelectors = [
      `//android.widget.ImageButton[@resource-id="com.androidsample.generalstore:id/appbar_btn_cart"]`,
      '//android.widget.ImageButton[@content-desc="Cart"]',
      '//android.widget.ImageView[@content-desc="Cart"]',
      '//android.widget.TextView[@content-desc="Cart"]',
      `//android.widget.ImageView[@resource-id="com.androidsample.generalstore:id/cart"]`,
      `//android.widget.LinearLayout[@content-desc="Cart"]`,
    ];

    for (const sel of cartSelectors) {
      try {
        const el = await $(sel);
        if (await el.isDisplayed()) {
          await el.click();
          console.log('  ✔ Navigated to cart via icon');
          return;
        }
      } catch {
        continue;
      }
    }

    const { width, height } = await driver.getWindowSize();
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width * 0.91), y: Math.round(height * 0.088) })
      .down()
      .up()
      .perform(true);
    await pause(1500);
    console.log('  ✔ Navigated to cart via coordinate tap');
  }

  async getProductCount(): Promise<number> {
    const items = await $$(this.productItems);
    return items.length;
  }
}

export default new ProductsPage();
