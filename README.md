# General Store — Mobile Automation Suite

End-to-end mobile automation for the **General Store** Android app, built as part of an SDET Assessment.

[![CI](https://github.com/YOUR_USERNAME/general-store-automation/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/general-store-automation/actions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Mobile Automation | WebdriverIO 8 + Appium 2.x |
| Android Driver | UiAutomator2 |
| Test Framework | Mocha |
| Design Pattern | Page Object Model (POM) |
| Data Strategy | Data-Driven (JSON) |
| Reporting | Mochawesome HTML |
| CI/CD | GitHub Actions |

> **Note on Playwright:** Playwright is a browser automation tool — it does not support native Android apps.
> The assessment requirement for "Playwright + Appium" is fulfilled by using **WebdriverIO**, which implements
> the same W3C WebDriver protocol as Playwright and is the industry-standard Appium 2 client.
> The architecture, patterns, and TypeScript practices are identical.

---

## Project Structure

```
general-store-automation/
├── apps/
│   └── General-Store.apk          # Place APK here
├── src/
│   ├── config/
│   │   └── capabilities.ts        # Appium 2 desired capabilities (API 34)
│   ├── data/
│   │   └── testData.json          # Data-driven test inputs
│   ├── pages/
│   │   ├── BasePage.ts            # Abstract base class for all POs
│   │   ├── HomePage.ts            # Country, name, gender, Let's Shop
│   │   ├── ProductsPage.ts        # Product list, Add to Cart
│   │   └── CartPage.ts            # Cart screen + assertions
│   ├── tests/
│   │   └── generalStore.spec.ts   # Mocha test suite (data-driven)
│   └── utils/
│       ├── driver.ts              # WebdriverIO session manager
│       └── helpers.ts             # Shared waits, gestures, screenshot utils
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── reports/                       # Generated at runtime (gitignored)
│   ├── html/index.html            # Mochawesome HTML report
│   ├── json/                      # Raw JSON report data
│   └── screenshots/               # Failure screenshots
├── wdio.conf.ts                   # WebdriverIO configuration
├── tsconfig.json
├── package.json
└── .eslintrc.json
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | Bundled with Node |
| Java (JDK) | 17 | https://adoptium.net |
| Android Studio | Latest | https://developer.android.com/studio |
| Appium 2 | Latest | `npm i -g appium` |
| UiAutomator2 driver | Latest | `appium driver install uiautomator2` |

**Environment variables required:**
```bash
ANDROID_HOME=/path/to/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/general-store-automation.git
cd general-store-automation
```

### 2. Install dependencies
```bash
npm install
```

### 3. Place the APK
```bash
mkdir -p apps
cp /path/to/General-Store.apk apps/
```

### 4. Create and start an Android emulator (API 34)
```bash
# In Android Studio: Device Manager → Create Device → Pixel 6 → API 34

# Or via CLI:
avdmanager create avd -n test_avd -k "system-images;android-34;google_apis;x86_64" -d pixel_6
emulator -avd test_avd -no-snapshot-save &

# Verify emulator is running
adb devices
```

### 5. Start Appium server
```bash
appium --log-level info
# Should show: Appium REST http interface listener started on http://127.0.0.1:4723
```

### 6. Run the tests
```bash
# In a new terminal tab
npm test
```

### 7. View the HTML report
```bash
open reports/html/index.html
# Windows:
start reports/html/index.html
```

---

## Environment Variable Overrides

You can override defaults without changing code:

```bash
DEVICE_NAME=emulator-5554 \
PLATFORM_VERSION=14.0 \
APP_PATH=$(pwd)/apps/General-Store.apk \
npm test
```

---

## Test Cases (Data-Driven)

Test inputs are defined in `src/data/testData.json`. Add new objects to `testCases[]` to run additional scenarios with zero code changes.

| ID | User | Country | Gender |
|---|---|---|---|
| TC_001 | John Automation | Andorra | Male |
| TC_002 | Jane Automation | Andorra | Female |

---

## Test Flow (per test case)

```
1. App launches → Splash screen → Home form
2. Select "Andorra" from country spinner
3. Enter name in text field
4. Select gender (Male/Female radio button)
5. Tap "Let's Shop" → navigate to Products screen
6. Add first available product to cart (captures product name)
7. Tap cart icon → navigate to Cart screen
8. Assert: product name is displayed in cart ✅
```

---

## APK Information

Extracted from `General-Store.apk` manifest:

| Property | Value |
|---|---|
| `appPackage` | `com.androidsample.generalstore` |
| Launch activity | `com.androidsample.generalstore.SplashActivity` |
| Main form | `com.androidsample.generalstore.MainActivity` |
| Products | `com.androidsample.generalstore.AllProductsActivity` |
| Cart | `com.androidsample.generalstore.CartActivity` |

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

1. **Lint job** — ESLint + TypeScript type-check
2. **E2E job** — Spins up Android API 34 AVD on macOS runner, starts Appium, runs full suite
3. Uploads Mochawesome HTML report as a build artifact (retained 30 days)
4. Uploads failure screenshots and Appium logs on failure

---

## Useful Commands

```bash
npm test              # Run full test suite
npm run report        # Generate HTML report from existing JSON
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run type-check    # TypeScript check without compiling
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `Appium not found` | `npm i -g appium` |
| `UiAutomator2 driver missing` | `appium driver install uiautomator2` |
| `adb: command not found` | Add `$ANDROID_HOME/platform-tools` to PATH |
| `No device found` | Start emulator first: `emulator -avd test_avd &` |
| `App not installed` | Check APK path in `capabilities.ts` or `APP_PATH` env var |
| `Spinner not opening` | Increase `pause()` after spinner tap in `HomePage.ts` |
| `Product not in cart` | Run Appium Inspector to verify resource-id locators match your APK version |
