import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test("Test Open Graph meta tags", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  // Wait for page to load
  await page.waitForLoadState("networkidle");

  const ogTitle = await page.getAttribute(
    'meta[property="og:title"]',
    "content",
  );
  const ogDescription = await page.getAttribute(
    'meta[property="og:description"]',
    "content",
  );
  const ogImage = await page.getAttribute(
    'meta[property="og:image"]',
    "content",
  );
  const ogUrl = await page.getAttribute('meta[property="og:url"]', "content");

  expect(ogTitle).toBe(
    "ODOC | crypto agreements | Trustless Document Management on Blockchain",
  );
  expect(ogDescription).toBe(
    "Enterprise-grade document automation with ICP smart contracts and decentralized identity management.",
  );
  expect(ogUrl).toBe("https://odoc.app");
  expect(ogImage).toContain("github-production-user-asset");

  console.log({
    title: ogTitle,
    description: ogDescription,
    image: ogImage,
    url: ogUrl,
  });
});

test("Test Twitter meta tags", async ({ page }) => {
  await page.goto("http://localhost:5173/");

  const twitterCard = await page.getAttribute(
    'meta[property="twitter:card"]',
    "content",
  );
  const twitterTitle = await page.getAttribute(
    'meta[property="twitter:title"]',
    "content",
  );
  const twitterSite = await page.getAttribute(
    'meta[property="twitter:site"]',
    "content",
  );

  expect(twitterCard).toBe("summary_large_image");
  expect(twitterTitle).toBe("ODOC | crypto agreements");
  expect(twitterSite).toBe("@odoc_ic");
});
