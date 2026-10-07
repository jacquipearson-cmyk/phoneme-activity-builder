import { test, expect } from "@playwright/test";

test("Builder can create a Word Search activity", async ({ page }) => {
  await page.goto("http://localhost:3000/wordsearch/create");

  await page.getByLabel("Title").fill("Playwright WordSearch");
  await page.getByLabel("Difficulty (label only)").selectOption("medium");

  await page.getByLabel("English Word").first().fill("cat");
  await page.getByLabel("Hint").first().fill("animal");

  await page.locator("button.phoneme-key", { hasText: /^k$/ }).click();
  await page.locator("button.phoneme-key", { hasText: /^æ$/ }).click();
  await page.locator("button.phoneme-key", { hasText: /^t$/ }).click();

  await page.getByRole("button", { name: "Create Activity" }).click();

  await page.waitForURL("**/wordsearch/**");

  await expect(page.locator(".word-search-grid")).toBeVisible();
});
