import { BasePage } from './BasePage';
import { waitForElement, pause, isDisplayed } from '../utils/helpers';

/**
 * CartPage (CartActivity)
 * Handles assertion of product presence in the shopping cart.
 */
export class CartPage extends BasePage {
  // ─── Selectors ─────────────────────────────────────────────────────────────

  /** Cart screen top-level list */
  private readonly cartList = '//android.widget.ScrollView | //androidx.recyclerview.widget.RecyclerView';

  /** Individual cart item row */
  private readonly cartItems = 'com.androidsample.generalstore:id/productImage';

  /** Product name label within a cart item */
  private readonly cartItemName = './/android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productName"]';

  /** Product price label within a cart item */
  private readonly cartItemPrice = './/android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productPrice"]';

  /** Total price label at bottom of cart */
  private readonly totalAmount = 'com.androidsample.generalstore:id/totalAmountTv';

  /** "Order Now" / "Proceed" button */
  private readonly orderNowBtn = 'com.androidsample.generalstore:id/buttonOrderNow';

  /** Empty cart message */
  private readonly emptyCartMsg = '//android.widget.TextView[contains(@text, "empty") or contains(@text, "Empty")]';

  // ─── Page Load Verification ────────────────────────────────────────────────

  async isLoaded(): Promise<boolean> {
    try {
      // The cart screen should show either items or the empty-cart message
      await waitForElement(this.cartList, 15000);
      return true;
    } catch {
      return false;
    }
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  /**
   * Asserts that a product with the given name appears in the cart.
   * Performs a case-insensitive partial match.
   * @param productName - Name captured from ProductsPage
   * @throws Error if product is not found in cart
   */
  async assertProductInCart(productName: string): Promise<void> {
    console.log(`  → Asserting product in cart: "${productName}"`);
    await pause(1000);

    const items = await $$(this.cartItems);

    if (items.length === 0) {
      await this.screenshot('cart_empty_failure');
      throw new Error(
        `Cart is empty — expected to find product: "${productName}"`
      );
    }

    let found = false;
    const foundNames: string[] = [];

    for (const item of items) {
      try {
        const nameEl = await item.$(this.cartItemName);
        const name = (await nameEl.getText()).trim();
        foundNames.push(name);

        if (name.toLowerCase().includes(productName.toLowerCase()) ||
            productName.toLowerCase().includes(name.toLowerCase())) {
          found = true;
          console.log(`  ✔ Product found in cart: "${name}"`);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!found) {
      await this.screenshot('cart_product_not_found');
      throw new Error(
        `Product "${productName}" not found in cart.\n` +
          `Cart contains: [${foundNames.join(', ')}]`
      );
    }
  }

  /**
   * Returns all product names currently in the cart.
   */
  // async getCartProductNames(): Promise<string[]> {
  //   const items = await $$(this.cartItems);
  //   const names: string[] = [];

  //   for (const item of items) {
  //     try {
  //       const nameEl = await item.$(this.cartItemName);
  //       names.push((await nameEl.getText()).trim());
  //     } catch {
  //       continue;
  //     }
  //   }

  //   return names;
  // }

  /**
   * Returns the number of items in the cart.
   */
  async getCartItemCount() {
    // const items = await $$(this.cartItems);
    // await items[0]?.waitForExist({ timeout: 10000 });
    // return items.length;
    // const element = await $('~com.androidsample.generalstore:id/productImage');
// await element.waitForExist({ timeout: 10000 });
const element = await $('//android.widget.ImageView[@resource-id="com.androidsample.generalstore:id/productImage"]');
await element.waitForExist({ timeout: 10000 });

  }

  /**
   * Returns the displayed total amount string (e.g. "$12.99").
   */
  // async getTotalAmount(): Promise<string> {
  //   try {
  //     const el = await waitForElement(`id:${this.totalAmount}`, 5000);
  //     return (await el.getText()).trim();
  //   } catch {
  //     return 'N/A';
  //   }
  // }

  /**
   * Checks whether the cart is displayed as empty.
   */
  // async isCartEmpty(): Promise<boolean> {
  //   return isDisplayed(this.emptyCartMsg);
  // }
}

export default new CartPage();
