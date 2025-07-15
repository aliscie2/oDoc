import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

// setup("authenticate", async ({ page }) => {
//   await page.goto("http://localhost:5173");

//   // Click Login button using the specific MUI button class
//   const popupPromise = page.waitForEvent("popup");
//   await page.click(
//     'button.MuiButton-root:has-text("Login with Internet Identity")',
//   );

//   const newPage = await popupPromise;

//   // Wait for the new page to load completely
//   await newPage.waitForLoadState("networkidle");

//   // Click "Use existing" button with the specific ID and class
//   await newPage.click(
//     'button#loginButton.c-button--secondary:has-text("Use existing")',
//   );

//   // Fill the input field with the specific data-role attribute
//   await newPage.fill('input[data-role="anchor-input"]', "10000");

//   // Press Enter on the input field
//   await newPage.press('input[data-role="anchor-input"]', "Enter");

//   // Wait for the popup tab to close automatically
//   await newPage.waitForEvent("close");

//   // Verify we're back on the original page and logged in
//   // Check for the specific MUI Typography element with "Recent Posts"
//   await expect(
//     page.locator('h6.MuiTypography-h6:has-text("Recent Posts")'),
//   ).toBeVisible();

//   // Save authentication state
//   await page.context().storageState({ path: authFile });
// });
