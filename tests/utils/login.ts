import { ai } from '@zerostep/playwright'
import { test, expect } from "@playwright/test";

export const loginAs = async (identityNumber: string, page) => {
 await page.goto('http://localhost:5173/');
 const page1Promise = page.waitForEvent('popup');
 await page.getByRole('button', { name: 'Internet Identity Login with' }).click();
 const page1 = await page1Promise;
 await page1.getByRole('button', { name: 'Use existing' }).click();
 await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(identityNumber);
 await page1.getByRole('button', { name: 'Continue', exact: true }).click();
//  await page1.waitForLoadState('networkidle');
//  const errorText = `Unknown Internet Identity Failed to find Internet Identity ${identityNumber}. Please check`;
//  const errorElement = await page1.getByText(errorText).first().isVisible().catch(() => false);
 ai("wait loadig then, if u see `Unknown Internet Identity Failed to find Internet Identity` click on `Create Internet Identity` then type `a` then click next",{ page:page1, test })
//  if (errorElement) {
//    await page1.getByRole('button', { name: 'Create Internet Identity' }).click();
//    await page1.getByRole('textbox', { name: 'Type the characters you see' }).fill('a');
//    await page1.getByRole('button', { name: 'Next' }).click();
//    await page1.getByRole('button', { name: 'Copy phrase to clipboard' }).click();
//    await page1.getByRole('button', { name: 'I saved it, continue' }).click();
//  }
 
 await page1.waitForEvent('close');
 await page.waitForLoadState('networkidle');
 
 try {
   await page.waitForSelector('[role="textbox"][name="Username"], #basic-button', { timeout: 5000 });
 } catch {
   return null;
 }
 
//  ai('If you see a form fill it with realistic data and hit submit, if you see loading wait to see th form, else just pass.', { page, test });

 for (let i = 0; i < 3; i++) {
   await page.locator('#basic-button').click();
   await page.waitForTimeout(500);
   
   const menuItems = await page.locator('[role="menuitem"]').count();
   if (menuItems === 0) continue;
   if (menuItems > 1) return null;
   
   const isLogout = await page.getByRole('menuitem').getByText('Logout').isVisible().catch(() => false);
   if (isLogout) {
    ai('If you see a form fill it with realistic data, if you see loading wait to see th form, else just pass.', { page, test })
     await page.locator('#username').fill(identityNumber);
     await page.locator('#bio').fill(identityNumber);
     await page.locator('#submitButton').click();
     await page.waitForLoadState('networkidle');
     return;
   }
 }
 
 return null;
}