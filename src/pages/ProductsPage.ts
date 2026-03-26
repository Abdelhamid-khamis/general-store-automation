import { BasePage } from './BasePage';
import { waitForElement, pause } from '../utils/helpers';

/**
 * ProductsPage (AllProductsActivity)
 * Handles the product listing screen and the cart icon in the toolbar.
 *
 * Strategy: adds the FIRST available product to the cart and
 * captures its name for later assertion in the CartPage.
 */
export class ProductsPage extends BasePage {
  // ─── Selectors ─────────────────────────────────────────────────────────────

  /** Top-level container for the products RecyclerView */
  private readonly productList = '//androidx.recyclerview.widget.RecyclerView';

  /** Each product item in the list */
  private readonly productItems =
    '//androidx.recyclerview.widget.RecyclerView//android.widget.LinearLayout';

  /** Second "Add to Cart" button — absolute XPath with index */
  private readonly secondAddToCartBtn =
    '(//android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productAddCart"])[2]';

  /** Second product name — absolute XPath */
  private readonly secondProductName =
    '(//android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productName"])[2]';

  // ─── State ─────────────────────────────────────────────────────────────────

  /** Stores the name of the product that was added — used for cart assertion */
  public addedProductName = '';

  // ─── Page Load Verification ────────────────────────────────────────────────

  async isLoaded(): Promise<boolean> {
    try {
      await waitForElement(this.productList, 20000);
      return true;
    } catch {
      return false;
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Adds the second visible product to the cart.
   * Captures the product name for downstream assertions.
   * @returns The name of the product added
   */
  async addFirstProductToCart(): Promise<string> {
    console.log('  → Waiting for Add to Cart button...');

    // Wait for the Add to Cart button to be present
    const targetBtn = await $(this.secondAddToCartBtn);
    await targetBtn.waitForExist({ timeout: 20000 });

    // Capture product name via absolute XPath before clicking
    // Note: Appium 1.x does not support parent traversal via $('..')
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

  /**
   * Navigates to the cart screen by tapping the cart icon in the toolbar.
   * Uses an early-return pattern to exit as soon as the icon is found.
   * Falls back to a coordinate tap using perform(true) which skips the
   * releaseActions call that Appium 1.x does not support (HTTP 404).
   */
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

    // Fallback: tap the top-right corner where the cart icon is rendered.
    // perform(true) skips releaseActions — Appium 1.x returns HTTP 404 on DELETE /actions.
    const { width, height } = await driver.getWindowSize();
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
      .move({ x: Math.round(width * 0.91), y: Math.round(height * 0.088) })
      .down()
      .up()
      .perform(true);
    await pause(1500);
    console.log('  ✔ Navigated to cart via coordinate tap');
  }

  /**
   * Returns the count of products currently displayed on the page.
   */
  async getProductCount(): Promise<number> {
    const items = await $$(this.productItems);
    return items.length;
  }
}

export default new ProductsPage();
