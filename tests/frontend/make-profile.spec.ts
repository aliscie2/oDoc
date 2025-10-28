import { test } from "@playwright/test";

test("create profile with existing identity", async ({ page }) => {
  // Set default timeout for all actions
  test.setTimeout(300000); // 5 minutes for the whole test
  page.setDefaultTimeout(90000); // 90 seconds for each action

  await page.goto("http://localhost:5173/");

  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Sign Up" }).click();
  const page1 = await page1Promise;

  await page1.getByRole("button", { name: "Use existing" }).click();
  await page1.getByRole("textbox", { name: "Identity Anchor" }).click();
  await page1.getByRole("textbox", { name: "Identity Anchor" }).fill("10007");
  await page1.getByRole("button", { name: "Continue", exact: true }).click();

  // Wait for popup to close and navigation to complete
  await page1.waitForEvent("close");
  await page.waitForURL("http://localhost:5173/**");
  await page.waitForLoadState("networkidle");

  // Wait for the search textbox to be visible
  const searchBox = page.getByRole("textbox", {
    name: "Ask about candidates, metrics",
  });
  await searchBox.waitFor({ state: "visible" });
  await searchBox.click();
  await searchBox.fill(
    "I have a startup and am looking for a developer good at icp,rust,javascript,react,django",
  );
//   await searchBox.fill(
//     "I a software developer and am looking for a job, I am good at icp,rust,javascript,react,django",
//   );

  // Wait for send button to be enabled and click it
  const sendButton = page.locator(
    'button[type="button"]:has(svg[data-testid="SendIcon"])',
  );
  await sendButton.waitFor({ state: "visible" });
  // Wait for button to be enabled (not disabled)
  await page.waitForFunction(
    (btn) => !btn.disabled,
    await sendButton.elementHandle(),
  );
  await sendButton.click();

  // Wait for and click View job details button
  const viewJobButton = page.getByRole("button", { name: "View job details" });
  await viewJobButton.waitFor({ state: "visible" });
  await viewJobButton.click();

  // Wait for Skills button and click it
  const skillsButton = page.getByRole("button", { name: "Skills" });
  await skillsButton.waitFor({ state: "visible" });
  await skillsButton.click();

  // Click skills - wait for each to be visible
  const skills = ["ICP", "Rust", "JavaScript", "React", "Django"];
  for (const skill of skills) {
    const skillElement = page.getByText(skill, { exact: true });
    await skillElement.waitFor({ state: "visible" });
    await skillElement.click();
  }
});
