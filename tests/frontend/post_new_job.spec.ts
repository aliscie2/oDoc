import { test, expect } from "@playwright/test";
import { loginAs, registerUser } from "./utils/login";
import { ai } from "@zerostep/playwright";

// Use the authentication state from setup
test.use({ storageState: "playwright/.auth/user.json" });

// Alternative test without using storageState (if you want to test the login flow)
// test("Posting jop", async ({ page }) => {
//   await registerUser( page);
//   await page.locator('#aiAssistantInput').fill('job//as>icp,rust');
//   await page.locator('#aiAssistantInput').press('Enter');
//   await page.waitForTimeout(500);

//   // ai("In the input type `job//as>icp,rust` and hit enter",{ page, test })
//   // ai('wait a bit for chat box to shrink and click the dropdown list of id #selectMyJob', { page, test })
//   await page.locator('#VisibilityIcon').click();
//   await page.getByRole('button', { name: 'Skills (2)' }).click();
//   await page.locator('div').filter({ hasText: /^icp$/ }).click();
//   await page.locator('div').filter({ hasText: /^rust$/ }).click();
//   await page.getByRole('button', { name: 'Close' }).click();
//   await page.getByLabel(/Auto-saving changes in \d+ seconds?/).hover();
//   await page.getByRole('button', { name: 'Save Now' }).click();
// });

test("Posting talent and find job", async ({ page }) => {
  // secon user Talent
  await registerUser(page);
  await page.getByRole("textbox", { name: "Type a message..." }).click();
  await page
    .getByRole("textbox", { name: "Type a message..." })
    .fill("job//as>icp,rust");
  await page.getByRole("textbox", { name: "Type a message..." }).press("Enter");
  await page.getByRole("combobox").click();
  await page.getByRole("button").nth(1).click();
  await page.getByRole("button", { name: "Skills (2)" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^rust$/ })
    .click();
  await page.locator("div").filter({ hasText: /^icp$/ }).click();
});
