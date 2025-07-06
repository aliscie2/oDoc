import { test, expect } from "@playwright/test";

// Use the authentication state from setup
test.use({ storageState: "playwright/.auth/user.json" });

// test("Login with Internet Identity", async ({ page }) => {
//   await page.goto("http://localhost:5173/");

//   // Should already be logged in due to storageState
//   await expect(page.locator("text=Job Matches")).toBeVisible();
// });

// Alternative test without using storageState (if you want to test the login flow)
test("Fresh login flow", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // Should already be logged in due to storageState
  await expect(
    page.locator('h6.MuiTypography-h6:has-text("Recent Posts")'),
  ).toBeVisible();
});
