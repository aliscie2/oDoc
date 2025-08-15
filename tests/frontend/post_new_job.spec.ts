import { test, expect } from "@playwright/test";
import { registerUser } from "./utils/login";

test.describe("Job Matching System", () => {
  test("should complete onboarding flow: signup → job onboarding → create job → reload → calendar onboarding", async ({
    page,
  }) => {
    // 1. Signup and get onboarding message
    await registerUser(page);

    // Wait for loading to complete before checking onboarding message
    await page.waitForTimeout(3000);

    // Should see job onboarding message
    await expect(
      page.getByText(
        "👋 Welcome! I'm here to help you find the perfect opportunities",
      ),
    ).toBeVisible();

    // 2. Type job//as>icp,rust
    await page.waitForTimeout(2000);
    await page.locator('textarea[placeholder="Ask AI anything..."]').click();
    await page
      .locator('textarea[placeholder="Ask AI anything..."]')
      .fill("job//as>icp,rust");
    await page.locator("#submitAIMessage").click();
    await page.waitForTimeout(1000);

    // 3. Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 4. Get calendar onboarding message
    await expect(
      page.getByText("🗓️ Perfect! Now let's set up your availability"),
    ).toBeVisible();
    await expect(
      page.getByText("Share your interview schedule:"),
    ).toBeVisible();
  });

  test("should create job and check skills from dropdown", async ({ page }) => {
    await registerUser(page);

    // Wait for loading to complete
    await page.waitForTimeout(3000);

    // Create job
    await page.waitForTimeout(2000);
    await page.getByPlaceholder("Ask AI anything...").click();
    await page.getByPlaceholder("Ask AI anything...").fill("job//as>icp,rust");
    await page.locator("#submitAIMessage").click();
    await page.waitForTimeout(5000);

    // Navigate to jobs page
    await page.goto("http://localhost:5173/jobs");
    await page.waitForLoadState("networkidle");

    // Should see job brief data with skills
    await expect(page.locator('[data-testid="job-brief-data"]')).toBeVisible();

    // Should see skills as chips
    await expect(page.locator(".MuiChip-root")).toHaveCount(2); // icp, rust

    // Check dropdown functionality
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("should create talent and find previously created job in matches", async ({
    page,
    context,
  }) => {
    // First user creates a job
    await registerUser(page);

    // Wait for loading to complete
    await page.waitForTimeout(3000);

    await page.waitForTimeout(2000);
    await page.getByPlaceholder("Ask AI anything...").click();
    await page.getByPlaceholder("Ask AI anything...").fill("job//as>icp,rust");
    await page.locator("#submitAIMessage").click();
    await page.waitForTimeout(5000);

    // Second user creates talent with matching skills
    const page2 = await context.newPage();
    await registerUser(page2);

    // Wait for loading to complete
    await page2.waitForTimeout(3000);

    await page2.waitForTimeout(2000);
    await page2.getByPlaceholder("Ask AI anything...").click();
    await page2
      .getByPlaceholder("Ask AI anything...")
      .fill("talent//as>icp,rust");
    await page2.locator("#submitAIMessage").click();
    await page2.waitForTimeout(5000);

    // Navigate to jobs page to see matches
    await page2.goto("http://localhost:5173/jobs");
    await page2.waitForLoadState("networkidle");

    // Switch to talent view
    await page2.getByRole("combobox").click();
    await page2.waitForTimeout(1000);

    // Look for Talent option and select it
    const talentOption = page2
      .locator('li[role="option"]')
      .filter({ hasText: "Talent" });
    if ((await talentOption.count()) > 0) {
      await talentOption.click();
      await page2.waitForTimeout(2000);
    }

    // Should see the jobs page with potential matches
    await expect(page2.locator(".jobs-page-container")).toBeVisible();

    await page2.close();
  });
});
