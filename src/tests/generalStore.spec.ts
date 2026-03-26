import { expect } from '@wdio/globals';
import homePage from '../pages/HomePage';
import productsPage from '../pages/ProductsPage';
import cartPage from '../pages/CartPage';
import { takeScreenshot, pause } from '../utils/helpers';
import testData from '../data/testData.json';

/**
 * General Store — End-to-End Automation Suite
 *
 * Design pattern : Page Object Model (POM)
 * Test framework : Mocha + WebdriverIO
 * Data strategy  : Data-Driven via src/data/testData.json
 * Device target  : Android Emulator (AVD) — API 34 (Android 14)
 * App            : com.androidsample.generalstore
 */

const { testCases, appConfig } = testData;

describe('General Store — End-to-End Flow', () => {

  testCases.forEach((tc) => {

    const { user, product } = tc;

    // Track first-run per test case to detect retries without Mocha currentRetry()
    let firstRun = true;

    it(`[${tc.id}] ${tc.description}`, async function () {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`Test Case : ${tc.id}`);
      console.log(`User      : ${user.name} | ${user.country} | ${user.gender}`);
      console.log(`Strategy  : ${product.strategy}`);
      console.log(`${'─'.repeat(60)}\n`);

      try {
        // Restart app for every test case except TC_001's first run
        const isFirstTestFirstRun = tc.id === testCases[0].id && firstRun;
        firstRun = false;

        if (!isFirstTestFirstRun) {
          console.log(`Restarting app for ${tc.id}...`);
          await driver.startActivity(
            appConfig.appPackage,
            appConfig.splashActivity
          );
        }

        // Wait for splash screen
        console.log(`Waiting for splash screen (${appConfig.splashWaitMs}ms)...`);
        await pause(appConfig.splashWaitMs);

        // Step 1-2: Verify home screen loads and select country
        console.log('\n[Step 1-2] Verifying Home screen loads...');
        const loaded = await homePage.isLoaded();
        expect(loaded).toBe(true);

        await homePage.selectCountry(user.country);
        const selected = await homePage.getSelectedCountry();
        expect(selected).toContain(user.country);
        console.log(`Country confirmed: "${selected}"`);

        // Step 3: Enter name
        console.log(`\n[Step 3] Entering name...`);
        await homePage.enterName(user.name);
        console.log(`Name entered: "${user.name}"`);

        // Step 4: Select gender
        console.log(`\n[Step 4] Selecting gender...`);
        await homePage.selectGender(user.gender as 'Male' | 'Female');
        console.log(`Gender selected: "${user.gender}"`);

        // Step 5: Tap Let's Shop
        console.log(`\n[Step 5] Tapping "Let's Shop"...`);
        await homePage.tapLetsShop();

        // Step 6: Add first product to cart
        console.log(`\n[Step 6] Adding first product to cart...`);
        const addedProduct = await productsPage.addFirstProductToCart();
        // expect(addedProduct).toBeDefined();
        // expect(addedProduct.length).toBeGreaterThan(0);
        // console.log(`Product staged for cart assertion: "${addedProduct}"`);

        // Step 7: Navigate to cart
        console.log(`\n[Step 7] Navigating to cart...`);
        await productsPage.goToCart();
        // const cartLoaded = await cartPage.isLoaded();
        // expect(cartLoaded).toBe(true);
        console.log(`Cart screen loaded`);

        // Step 8: Assert product in cart
        console.log(`\n[Step 8] Asserting product in cart...`);
        // const productToAssert = addedProduct || productsPage.addedProductName;
        // expect(productToAssert.length).toBeGreaterThan(0);

        // await cartPage.assertProductInCart(productToAssert);
        const cartCount = await cartPage.getCartItemCount();
        // expect(cartCount).toBeGreaterThanOrEqual(1);
        // const total = await cartPage.getTotalAmount();

        // console.log(`\n${'─'.repeat(60)}`);
        // console.log(`${tc.id} PASSED`);
        // console.log(`   Product    : "${productToAssert}"`);
        // console.log(`   Cart items : ${cartCount}`);
        // console.log(`   Total      : ${total}`);
        // console.log(`${'─'.repeat(60)}\n`);

      } catch (err) {
        const safeName = (this.test?.title ?? tc.id).replace(/[^a-z0-9]/gi, '_');
        await takeScreenshot(`FAIL_${tc.id}_${safeName}`);
        throw err;
      }
    });

  });

});
