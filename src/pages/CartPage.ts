import { BasePage } from './BasePage';
import { waitForElement, pause } from '../utils/helpers';

export class CartPage extends BasePage {
  private readonly cartList = '//android.widget.ScrollView | //androidx.recyclerview.widget.RecyclerView';
  private readonly cartItems = 'com.androidsample.generalstore:id/productImage';
  private readonly cartItemName = './/android.widget.TextView[@resource-id="com.androidsample.generalstore:id/productName"]';

  async isLoaded(): Promise<boolean> {
    try {
      await waitForElement(this.cartList, 15000);
      return true;
    } catch {
      return false;
    }
  }

  async assertProductInCart(productName: string): Promise<void> {
    console.log(`  → Asserting product in cart: "${productName}"`);
    await pause(1000);

    const items = await $$(this.cartItems);

    if (items.length === 0) {
      await this.screenshot('cart_empty_failure');
      throw new Error(`Cart is empty — expected to find product: "${productName}"`);
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

  async getCartItemCount(): Promise<void> {
    const element = await $('//android.widget.ImageView[@resource-id="com.androidsample.generalstore:id/productImage"]');
    await element.waitForExist({ timeout: 10000 });
  }
}

export default new CartPage();
