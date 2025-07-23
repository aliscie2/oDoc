import { test, expect } from "@playwright/test";
import { loginAs } from "./utils/login";
import { ai } from '@zerostep/playwright'

// Use the authentication state from setup
test.use({ storageState: "playwright/.auth/user.json" });


// Alternative test without using storageState (if you want to test the login flow)
test("Posting jop", async ({ page }) => {
  await loginAs("10002", page);
  await page.locator('#aiAssistantInput').fill('job//as>icp,rust');
  await page.locator('#aiAssistantInput').press('Enter');
  await page.waitForTimeout(500);

  // ai("In the input type `job//as>icp,rust` and hit enter",{ page, test })
  // ai('wait a bit for chat box to shrink and click the dropdown list of id #selectMyJob', { page, test })
  await page.locator('#VisibilityIcon').click();  
  await page.getByRole('button', { name: 'Skills (2)' }).click();
  await page.locator('div').filter({ hasText: /^icp$/ }).click();
  await page.locator('div').filter({ hasText: /^rust$/ }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByLabel(/Auto-saving changes in \d+ seconds?/).hover();
  await page.getByRole('button', { name: 'Save Now' }).click();
});


test("Posting talent and find job", async ({ page }) => {


  // secon user Talent
  await loginAs("10001", page)
  await page.getByRole('textbox', { name: 'Type a message...' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).fill('talent//as>icp,rust');
  await page.getByRole('textbox', { name: 'Type a message...' }).press('Enter');
  await page.getByRole('button', { name: '×' }).nth(1).click();
  await page.getByText('Talent').click();
  await page.getByTestId('VisibilityIcon').click();
  await page.getByRole('button', { name: 'Skills (2)' }).click();
  await page.locator('div').filter({ hasText: /^icp$/ }).click();
  await page.locator('div').filter({ hasText: /^rust$/ }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.locator('#main').getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('button', { name: 'Skills (2)' }).click();
  await page.locator('div').filter({ hasText: /^icp$/ }).click();
  await page.locator('div').filter({ hasText: /^rust$/ }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: '2' }).click();
  await page.getByRole('menuitem', { name: 'Message' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).fill('test, hi');
  await page.getByRole('textbox', { name: 'Type a message...' }).press('Enter');
  await page.locator('form').getByRole('button').click();
  await page.getByTestId('VisibilityIcon').click();  
  // note the playwright codegen can't do this
  await page.getByLabel(/Auto-saving changes in \d+ seconds?/).hover();
  await page.getByRole('button', { name: 'Save Now' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).click();
  await page.getByRole('textbox', { name: 'Type a message...' }).fill('hi');
  await page.getByRole('textbox', { name: 'Type a message...' }).press('Enter');
  await page.locator('form').getByRole('button').click();
  await page.getByText('Message sent successfully').click();
});