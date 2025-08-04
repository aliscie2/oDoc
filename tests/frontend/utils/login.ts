export const loginAs = async (identityNumber: string, page) => {
  await page.goto("http://localhost:5173/");
  const page1Promise = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Internet Identity Login with" })
    .click();
  const page1 = await page1Promise;
  await page1.getByRole("button", { name: "Use existing" }).click();
  await page1.getByRole("textbox", { name: "Identity Anchor" }).click();
  await page1
    .getByRole("textbox", { name: "Identity Anchor" })
    .fill(identityNumber);
  await page1.getByRole("textbox", { name: "Identity Anchor" }).press("Enter");
  await page1.waitForEvent("close");
  await page.waitForLoadState("networkidle");
  await page.locator("#basic-button").click();
  // await page.getByRole('link', { name: 'Profile' }).click();
};

export const registerUser = async (page) => {
  await page.goto("http://localhost:5173/");
  const page1Promise = page.waitForEvent("popup");
  await page
    .getByRole("button", { name: "Internet Identity Login with" })
    .click();
  const page1 = await page1Promise;
  await page1.getByRole("button", { name: "Create Internet Identity" }).click();
  await page1
    .getByRole("textbox", { name: "Type the characters you see" })
    .click();
  await page1
    .getByRole("textbox", { name: "Type the characters you see" })
    .fill("a");
  await page1.getByRole("button", { name: "Next" }).click();
  await page1.getByRole("button", { name: "Copy phrase to clipboard" }).click();
  await page1.getByRole("button", { name: "I saved it, continue" }).click();
  await page1.waitForEvent("close");
  await page.waitForLoadState("networkidle");
  await page
    .getByRole("textbox", { name: "Username" })
    .fill(Math.random().toString(36).substring(7));
  await page
    .getByRole("textbox", { name: "Bio" })
    .fill(Math.random().toString(36).substring(7));
  await page.getByRole("button", { name: "Complete Registration" }).click();
};
