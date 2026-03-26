import { BasePage } from './BasePage';
import { clearAndType, waitForElement, pause } from '../utils/helpers';

export class HomePage extends BasePage {
  private readonly countrySpinner = '//android.widget.Spinner[@resource-id="com.androidsample.generalstore:id/spinnerCountry"]';
  private readonly countrySpinnerText = '//android.widget.Spinner[@resource-id="com.androidsample.generalstore:id/spinnerCountry"]//android.widget.TextView';
  private readonly nameField = 'com.androidsample.generalstore:id/nameField';
  private readonly radioMale = 'com.androidsample.generalstore:id/radioMale';
  private readonly radioFemale = 'com.androidsample.generalstore:id/radioFemale';
  private readonly letsShopBtn = 'com.androidsample.generalstore:id/btnLetsShop';

  async isLoaded(): Promise<boolean> {
    try {
      await waitForElement(this.countrySpinner, 30000);
      return true;
    } catch {
      return false;
    }
  }

  async selectCountry(countryName: string): Promise<void> {
    console.log(`  → Selecting country: ${countryName}`);
    await this.tap(this.countrySpinner);
    await pause(1000);

    const directSel = `-android uiautomator:new UiSelector().text("${countryName}")`;
    try {
      const el = await $(directSel);
      await el.waitForDisplayed({ timeout: 5000 });
      await el.click();
    } catch {
      const uiScrollSelector =
        `-android uiautomator` +
        `:new UiScrollable(new UiSelector().scrollable(true))` +
        `.scrollIntoView(new UiSelector().text("${countryName}"))`;
      const target = await $(uiScrollSelector);
      await target.click();
    }

    await pause(500);
    console.log(`  ✔ Country selected: ${countryName}`);
  }

  async enterName(name: string): Promise<void> {
    console.log(`  → Entering name: ${name}`);
    await clearAndType(`id:${this.nameField}`, name);
    console.log(`  ✔ Name entered`);
  }

  async selectGender(gender: 'Male' | 'Female'): Promise<void> {
    console.log(`  → Selecting gender: ${gender}`);
    const selector = gender === 'Male' ? this.radioMale : this.radioFemale;
    await this.tap(`id:${selector}`);
    console.log(`  ✔ Gender selected: ${gender}`);
  }

  async tapLetsShop(): Promise<void> {
    console.log(`  → Tapping "Let's Shop"`);
    const el = await $(`id:${this.letsShopBtn}`);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.click();
    console.log(`  ✔ Tapped "Let's Shop"`);
  }

  async completeForm(country: string, name: string, gender: 'Male' | 'Female'): Promise<void> {
    await this.selectCountry(country);
    await this.enterName(name);
    await this.selectGender(gender);
    await this.tapLetsShop();
  }

  async getSelectedCountry(): Promise<string> {
    const el = await waitForElement(this.countrySpinnerText);
    return (await el.getText()).trim();
  }
}

export default new HomePage();
