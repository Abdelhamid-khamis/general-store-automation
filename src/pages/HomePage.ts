import { BasePage } from './BasePage';
import { clearAndType, waitForElement, pause } from '../utils/helpers';

/**
 * HomePage (MainActivity)
 * Covers the initial form screen:
 *  - Country spinner (dropdown)
 *  - Full name text field
 *  - Gender radio buttons (Male / Female)
 *  - "Let's Shop" button
 *
 * Element locators are based on resource-id and text observed
 * in the General Store APK (com.androidsample.generalstore).
 */
export class HomePage extends BasePage {
  // ─── Selectors ─────────────────────────────────────────────────────────────

  /** Android Spinner that shows the country list */
  private readonly countrySpinner = '//android.widget.Spinner[@resource-id="com.androidsample.generalstore:id/spinnerCountry"]';

  /** Text shown inside the closed spinner */
  private readonly countrySpinnerText = '//android.widget.Spinner[@resource-id="com.androidsample.generalstore:id/spinnerCountry"]//android.widget.TextView';

  /** Full name input field */
  private readonly nameField = 'com.androidsample.generalstore:id/nameField';

  /** Male radio button */
  private readonly radioMale = 'com.androidsample.generalstore:id/radioMale';

  /** Female radio button */
  private readonly radioFemale = 'com.androidsample.generalstore:id/radioFemale';

  /** "Let's Shop" CTA button */
  private readonly letsShopBtn = 'com.androidsample.generalstore:id/btnLetsShop';

  /** Error toast shown when name is empty */
  private readonly errorToast = '//android.widget.Toast';

  // ─── Page Load Verification ────────────────────────────────────────────────

  async isLoaded(): Promise<boolean> {
    try {
      await waitForElement(this.countrySpinner, 30000);
      return true;
    } catch {
      return false;
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /**
   * Selects a country from the spinner dropdown by exact text match.
   * Scrolls through the list if needed.
   */
  async selectCountry(countryName: string): Promise<void> {
    console.log(`  → Selecting country: ${countryName}`);

    // Open the spinner
    await this.tap(this.countrySpinner);
    await pause(1000);

    // Primary: UiAutomator textExact — works with any widget type (CheckedTextView, TextView, etc.)
    const directSel = `-android uiautomator:new UiSelector().text("${countryName}")`;

    try {
      const el = await $(directSel);
      await el.waitForDisplayed({ timeout: 5000 });
      await el.click();
    } catch {
      // Fallback: scroll the dropdown to find the country using any scrollable container
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

  /**
   * Enters the user's full name into the text field.
   */
  async enterName(name: string): Promise<void> {
    console.log(`  → Entering name: ${name}`);
    await clearAndType(`id:${this.nameField}`, name);
    console.log(`  ✔ Name entered`);
  }

  /**
   * Selects the gender radio button.
   * @param gender - 'Male' or 'Female'
   */
  async selectGender(gender: 'Male' | 'Female'): Promise<void> {
    console.log(`  → Selecting gender: ${gender}`);
    const selector = gender === 'Male' ? this.radioMale : this.radioFemale;
    await this.tap(`id:${selector}`);
    console.log(`  ✔ Gender selected: ${gender}`);
  }

  /**
   * Taps the "Let's Shop" button to navigate to the products screen.
   */
  async tapLetsShop(): Promise<void> {
    console.log(`  → Tapping "Let's Shop"`);
    const el = await $(`id:${this.letsShopBtn}`);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.click();
    console.log(`  ✔ Tapped "Let's Shop"`);
  }

  /**
   * Convenience method: fills and submits the full home form.
   */
  async completeForm(
    country: string,
    name: string,
    gender: 'Male' | 'Female'
  ): Promise<void> {
    await this.selectCountry(country);
    await this.enterName(name);
    await this.selectGender(gender);
    await this.tapLetsShop();
  }

  /**
   * Returns the currently selected country text from the spinner.
   */
  async getSelectedCountry(): Promise<string> {
    const el = await waitForElement(this.countrySpinnerText);
    return (await el.getText()).trim();
  }
}

export default new HomePage();
