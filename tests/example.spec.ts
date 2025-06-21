import { test, expect } from "@playwright/test";
import path from "path";

// const authFile = path.join(__dirname, '../playwright/.auth/user.json');

test("Login with Internet Identity", async ({ browser }) => {
  const adminContext = await browser.newContext({
    storageState: "playwright/.auth/user.json",
  });
  const page = await adminContext.newPage();

  // const adminContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  // const page = await adminContext.newPage();
  await page.goto("http://localhost:5173/");

  await expect(
    page.locator("text=Job Matches"),
  ).toBeVisible();

  // No need to manually close the tab since it closes automatically
});
