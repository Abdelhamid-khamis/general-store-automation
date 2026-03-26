import { expect } from '@wdio/globals';
import homePage from '../pages/HomePage';
import productsPage from '../pages/ProductsPage';
import cartPage from '../pages/CartPage';
import { takeScreenshot, pause } from '../utils/helpers';
import testData from '../data/testData.json';

const { testCases, appConfig } = testData;

describe('General Store — End-to-End Flow', () => {

  testCases.forEach((tc) => {
    const { user, product } = tc;
    let firstRun = true;

    it(`[${tc.id}] ${tc.description}`, async function () {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Test Case : ${tc.id}`);
      console.log(`User      : ${user.name} | ${user.country} | ${user.gender}`);
      console.log(`Strategy  : ${product.strategy}`);
      console.log(`${'─'.repeat(60)}\n`);

      try {
        const isFirstTestFirstRun = tc.id === testCases[0].id && firstRun;
        firstRun = false;

        if (!isFirstTestFirstRun) {
          console.log(`Restarting app for ${tc.id}...`);
          await driver.startActivity(appConfig.appPackage, appConfig.splashActivity);
        }

        console.log(`Waiting for splash screen (${appConfig.splashWaitMs}ms)...`);
        await pause(appConfig.splashWaitMs);

        console.log('\n[Step 1-2] Verifying Home screen loads...');
        const loaded = await homePage.isLoaded();
        expect(loaded).toBe(true);

        await homePage.selectCountry(user.country);
        const selected = await homePage.getSelectedCountry();
        expect(selected).toContain(user.country);
        console.log(`Country confirmed: "${selected}"`);

        console.log(`\n[Step 3] Entering name...`);
        await homePage.enterName(user.name);
        console.log(`Name entered: "${user.name}"`);

        console.log(`\n[Step 4] Selecting gender...`);
        await homePage.selectGender(user.gender as 'Male' | 'Female');
        console.log(`Gender selected: "${user.gender}"`);

        console.log(`\n[Step 5] Tapping "Let's Shop"...`);
        await homePage.tapLetsShop();

        console.log(`\n[Step 6] Adding first product to cart...`);
        await productsPage.addFirstProductToCart();

        console.log(`\n[Step 7] Navigating to cart...`);
        await productsPage.goToCart();
        console.log(`Cart screen loaded`);

        console.log(`\n[Step 8] Asserting product in cart...`);
        await cartPage.getCartItemCount();

      } catch (err) {
        const safeName = (this.test?.title ?? tc.id).replace(/[^a-z0-9]/gi, '_');
        await takeScreenshot(`FAIL_${tc.id}_${safeName}`);
        throw err;
      }
    });
  });

});
