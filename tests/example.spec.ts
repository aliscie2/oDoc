import { test, expect } from '@playwright/test'

test('Login with Internet Identity', async ({ page, context }) => {
  await page.goto('http://localhost:5173/')
  
  // Click Login button
  await page.click('button:has-text("Login")')
  
  // Wait for dropdown and click Internet Identity menuitem
  await page.waitForSelector('[role="menuitem"]:has-text("Internet Identity")', { state: 'visible' })
  await page.click('[role="menuitem"]:has-text("Internet Identity")')
  
  // Wait for new tab to open
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
  ])
  
  await newPage.waitForLoadState('networkidle')
  
  // Click "Use existing" in new tab
  await newPage.click('text=Use existing')
  
  // Type 10000 and press Enter
  await newPage.fill('input[type="text"]', '10000')
  await newPage.press('input[type="text"]', 'Enter')
  
  // Wait for auth to complete and tab to close automatically
  await newPage.waitForEvent('close')
  
  // Verify we're back on original page and logged in
  await expect(page.locator('text=Complete Your Account Setup (0/2)')).toBeVisible()
  
  // No need to manually close the tab since it closes automatically
})