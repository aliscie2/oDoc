import { test } from "@playwright/test";
import { registerUser } from "./utils/login";

test("Posting Job", async ({ page }) => {
  // secon user Talent
  await registerUser(page);
  await page.getByRole("textbox", { name: "Type a message..." }).click();
  await page
    .getByRole("textbox", { name: "Type a message..." })
    .fill("job//as>icp,rust");
  await page.locator('#submitAIMessage').click();
  await page.getByRole("combobox").click();
  await page.getByRole("button").nth(1).click();
  await page.getByRole("button", { name: "Skills (2)" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^rust$/ })
    .click();
  await page.locator("div").filter({ hasText: /^icp$/ }).click();
});



test('Posting talent and find job', async ({ page }) => {
  await registerUser(page);
  await page
    .getByRole("textbox", { name: "Type a message..." })
    .fill("talent//as>icp,rust");
  await page.locator('#submitAIMessage').click();
  await page.locator('#main').getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('button', { name: 'Skills (2)' }).click();
  await page.locator('div').filter({ hasText: /^icp$/ }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.locator('.MuiBox-root.css-1o8dslu').first().click();
  await page.getByRole('combobox').click();
  await page.locator('#menu- div').filter({ hasText: /^Talent$/ }).click();
});