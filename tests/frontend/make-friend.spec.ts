import { test, type Page } from "@playwright/test";
import { randDomeName } from "./utils/login";

const TARGET_USER_ID =
  "m4si5-die2y-rfwek-jlz2i-jnndq-g77eo-tkkrh-2mmbw-upgqd-7uk2l-rae";

/**
 * Register a new user with Internet Identity
 */
async function registerNewUser(page: Page) {
  await page.goto("http://localhost:5173/");

  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign Up" }).click();
  const page1 = await page1Promise;

  // Try different button variations for creating identity
  const moreOptionsButton = page1.locator('button[data-role="more-options"]');
  const buttonNames = ["Create Internet Identity", "Create New"];

  let clicked = false;
  for (const buttonName of buttonNames) {
    try {
      await page1
        .getByRole("button", { name: buttonName })
        .click({ timeout: 3000 });
      clicked = true;
      break;
    } catch {
      // Try next button name
    }
  }

  // If no button found, try clicking More options first
  if (!clicked) {
    try {
      await moreOptionsButton.click({ timeout: 3000 });
    } catch {
      // More options might not exist
    }

    // Try again after clicking More options
    for (const buttonName of buttonNames) {
      try {
        await page1
          .getByRole("button", { name: buttonName })
          .click({ timeout: 3000 });
        clicked = true;
        break;
      } catch {
        // Try next button name
      }
    }
  }

  // Fill captcha
  await page1
    .getByRole("textbox", { name: "Type the characters you see" })
    .click();
  await page1
    .getByRole("textbox", { name: "Type the characters you see" })
    .fill("a");
  await page1.getByRole("button", { name: "Next" }).click();

  // Complete identity creation
  const navigationPromise = page.waitForURL("http://localhost:5173/**");
  await page1.getByRole("button", { name: "I saved it, continue" }).click();
  await page1.waitForEvent("close");
  await navigationPromise;

  // Wait for the page to fully load
  await page.waitForLoadState("networkidle");

  // Fill registration form
  await page
    .getByRole("textbox", { name: "Username" })
    .waitFor({ state: "visible" });

  await page.getByRole("textbox", { name: "Username" }).fill(randDomeName());
  await page.getByRole("textbox", { name: "Bio" }).fill(randDomeName());
  await page.getByRole("button", { name: "Complete Registration" }).click();

  // Wait for registration to complete
  // await page.waitForURL("http://localhost:5173/**");
  // await page.waitForLoadState("networkidle");
}

/**
 * Add a friend and logout
 */
async function addFriendAndLogout(page: Page, userId: string) {
  // Navigate to user profile
  await page.goto(`http://localhost:5173/user?id=${userId}`);
  await page.waitForLoadState("networkidle");

  // Wait for Add Friend button to appear and click it
  const addFriendButton = page.getByRole("button", { name: "Add Friend" });
  await addFriendButton.waitFor({ state: "visible" });
  await addFriendButton.click();

  // Click the avatar/profile button and logout
  await page.locator("button#basic-button").click();
  await page.getByRole("link", { name: "Logout" }).click();
}

test("user registration and add friend flow", async ({ page }) => {
  // Set default timeout for all actions in this test
  test.setTimeout(600000); // 10 minutes for the whole test
  page.setDefaultTimeout(90000); // 90 seconds for each action

  // Run the flow multiple times to test stability
  for (let i = 0; i < 7; i++) {
    await registerNewUser(page);
    await addFriendAndLogout(page, TARGET_USER_ID);
  }
});
