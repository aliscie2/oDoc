import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page, context }) => {
  await page.goto("http://localhost:5173/");

  // Click Login button
  await page.click('button:has-text("Login")');

  // Wait for dropdown and click Internet Identity menuitem
  await page.waitForSelector(
    '[role="menuitem"]:has-text("Internet Identity")',
    { state: "visible" },
  );
  // await page.click('[role="menuitem"]:has-text("Internet Identity")')

  // Wait for new tab to open
  const popupPromise = page.waitForEvent("popup");
  await page.click('[role="menuitem"]:has-text("Internet Identity")');
  const newPage = await popupPromise;
  // console.log(await popup.evaluate('location.href'));
  // const [newPage] = await Promise.all([
  //   context.waitForEvent('page'),
  // ])

  await newPage.waitForLoadState("networkidle");

  // Click "Use existing" in new tab
  await newPage.click("text=Use existing");

  // Type 10000 and press Enter
  await newPage.fill('input[type="text"]', "10000");
  await newPage.press('input[type="text"]', "Enter");

  // Wait for auth to complete and tab to close automatically
  await newPage.waitForEvent("close");

  // Verify we're back on original page and logged in
  await expect(
    page.locator("text=Job Matches"),
  ).toBeVisible();
  await page.context().storageState({ path: authFile });
  // await newPage.context().storageState({ path: authFile });
});
