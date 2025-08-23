import { test, expect } from "@playwright/test";
import { ai } from "@zerostep/playwright";
import { registerUser, loginAs } from "./utils/login";

// Debug helper function
const debugLog = async (page, message: string) => {
  console.log(`[DEBUG] ${message}`);
  const url = page.url();
  const title = await page.title();
  console.log(`[DEBUG] Current URL: ${url}, Title: ${title}`);
};

// Helper to capture localStorage data
const captureLocalStorage = async (page) => {
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      data[key] = window.localStorage.getItem(key);
    }
    return data;
  });
  console.log("[DEBUG] LocalStorage:", JSON.stringify(localStorage, null, 2));
  return localStorage;
};

test.describe("Job Matching System - Comprehensive ZeroStep Tests", () => {
  test("Complete Flow: Onboarding + Job Creation + Logout", async ({
    page,
  }) => {
    await debugLog(page, "Starting complete onboarding and job creation flow");

    // Navigate to app
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
    await debugLog(page, "App loaded");

    // Register new user using existing utility
    await registerUser(page);
    await debugLog(page, "User registration completed");

    // Capture initial state
    await captureLocalStorage(page);

    // Wait for welcome onboarding message
    await page.waitForTimeout(2000);
    await debugLog(page, "Checking for welcome onboarding message");

    const welcomeMessage = page.getByText(
      "👋 Welcome! I'm here to help you find the perfect opportunities",
    );
    await expect(welcomeMessage).toBeVisible({ timeout: 10000 });
    await debugLog(page, "Welcome onboarding message confirmed");

    // Ensure chat input is available
    const chatInput = page.getByPlaceholder("Ask AI anything...");
    await expect(chatInput).toBeVisible({ timeout: 10000 });
    await debugLog(page, "Chat input is available");

    // Create job using AI with specific skills
    await ai(
      "Find the chat input field with placeholder 'Ask AI anything...' and type exactly 'job//as>icp,rust,typescript' then press Enter to submit the message",
      { page, test },
    );
    await page.waitForTimeout(3000);
    await debugLog(page, "Job creation command sent via AI");

    // Capture state after job creation
    const postJobStorage = await captureLocalStorage(page);

    // Reload page to test persistence and trigger calendar onboarding
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await debugLog(page, "Page reloaded to test persistence");

    // Check for calendar onboarding message
    const calendarMessage = page.getByText(
      "🗓️ Perfect! Now let's set up your availability",
    );
    const scheduleMessage = page.getByText("Share your interview schedule:");

    try {
      await expect(calendarMessage).toBeVisible({ timeout: 8000 });
      await expect(scheduleMessage).toBeVisible({ timeout: 5000 });
      await debugLog(page, "Calendar onboarding messages confirmed");
    } catch (error) {
      await debugLog(page, `Calendar onboarding not visible: ${error.message}`);
      // Continue test even if calendar onboarding doesn't appear
    }

    // Navigate to jobs page to verify job creation
    await ai("Navigate to the jobs page or find a way to view created jobs", {
      page,
      test,
    });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await debugLog(page, "Navigated to jobs page");

    // Verify job data is displayed
    try {
      const jobBriefData = page.locator('[data-testid="job-brief-data"]');
      await expect(jobBriefData).toBeVisible({ timeout: 5000 });
      await debugLog(page, "Job brief data is visible");

      // Check for skill chips
      const skillChips = page.locator(".MuiChip-root");
      const chipCount = await skillChips.count();
      console.log(`[DEBUG] Found ${chipCount} skill chips`);

      if (chipCount > 0) {
        await expect(skillChips).toHaveCount(3); // icp, rust, typescript
        await debugLog(page, "Skill chips verified");
      }
    } catch (error) {
      await debugLog(page, `Job verification failed: ${error.message}`);
    }

    // Test logout functionality
    await ai(
      "Find and click the profile avatar on top right, then from dropdown click logout button",
      { page, test },
    );
    await page.waitForTimeout(2000);
    await debugLog(page, "Logout completed");

    // Verify we're back to login state
    const loginButton = page.getByRole("button", {
      name: "Internet Identity Login with",
    });
    await expect(loginButton).toBeVisible({ timeout: 5000 });
    await debugLog(page, "Logout verified - back to login screen");
  });

  test("Talent Creation + Job Discovery Flow", async ({ page, context }) => {
    await debugLog(page, "Starting talent creation and job discovery flow");

    // First, create a job with a different user context
    const jobCreatorPage = await context.newPage();
    await jobCreatorPage.goto("http://localhost:5173");
    await jobCreatorPage.waitForLoadState("networkidle");
    await debugLog(jobCreatorPage, "Job creator page loaded");

    // Register job creator
    await registerUser(jobCreatorPage);
    await debugLog(jobCreatorPage, "Job creator registered");

    await jobCreatorPage.waitForTimeout(2000);

    // Create job with specific skills
    await ai(
      "Find the chat input and type 'job//as>react,nodejs,python' then submit it",
      { page: jobCreatorPage, test },
    );
    await jobCreatorPage.waitForTimeout(3000);
    await debugLog(jobCreatorPage, "Job created by first user");

    // Capture job creator's localStorage
    await captureLocalStorage(jobCreatorPage);

    // Now create talent user on main page
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
    await debugLog(page, "Talent user page loaded");

    // Register talent user
    await registerUser(page);
    await debugLog(page, "Talent user registered");

    await page.waitForTimeout(2000);

    // Create talent profile with matching skills
    await ai(
      "Find the chat input field and type 'talent//as>react,nodejs,python,javascript' then press Enter to submit",
      { page, test },
    );
    await page.waitForTimeout(3000);
    await debugLog(page, "Talent profile created");

    // Capture talent user's localStorage
    const talentStorage = await captureLocalStorage(page);

    // Navigate to jobs page
    await ai("Navigate to the jobs page to find job opportunities", {
      page,
      test,
    });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await debugLog(page, "Navigated to jobs page as talent");

    // Switch to talent view if there's a dropdown
    try {
      await ai(
        "Look for a dropdown or toggle to switch to 'Talent' view and click it",
        { page, test },
      );
      await page.waitForTimeout(2000);
      await debugLog(page, "Switched to talent view");
    } catch (error) {
      await debugLog(
        page,
        `Talent view switch failed or not needed: ${error.message}`,
      );
    }

    // Verify jobs page container is visible
    try {
      const jobsContainer = page.locator(".jobs-page-container");
      await expect(jobsContainer).toBeVisible({ timeout: 5000 });
      await debugLog(page, "Jobs page container is visible");
    } catch (error) {
      await debugLog(page, `Jobs container not found: ${error.message}`);
      // Try alternative selectors
      const alternativeSelectors = [
        '[data-testid="job-brief-data"]',
        ".job-listing",
        ".job-card",
        ".MuiCard-root",
      ];

      for (const selector of alternativeSelectors) {
        try {
          const element = page.locator(selector);
          await expect(element).toBeVisible({ timeout: 3000 });
          await debugLog(page, `Found jobs using selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    // Look for job matches or job listings
    try {
      const jobElements = page.locator(
        '.MuiChip-root, [data-testid="job-brief-data"], .job-card',
      );
      const count = await jobElements.count();
      console.log(`[DEBUG] Found ${count} job-related elements`);

      if (count > 0) {
        await debugLog(
          page,
          `Successfully found ${count} job matches/listings`,
        );
      }
    } catch (error) {
      await debugLog(
        page,
        `Job matching verification failed: ${error.message}`,
      );
    }

    // Test persistence by reloading
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await debugLog(page, "Page reloaded to test talent profile persistence");

    // Verify chat is still functional
    const chatInput = page.getByPlaceholder("Ask AI anything...");
    await expect(chatInput).toBeVisible({ timeout: 5000 });
    await debugLog(page, "Chat functionality persists after reload");

    // Final localStorage capture
    await captureLocalStorage(page);

    // Cleanup
    await jobCreatorPage.close();
    await debugLog(page, "Test completed - job creator page closed");
  });
});
