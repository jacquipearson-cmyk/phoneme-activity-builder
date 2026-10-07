import { test, expect } from "@playwright/test";

test("Builder can create a Wordle activity", async ({ page }) => {
  await page.goto("http://localhost:3000/wordle/create");

  await page.locator("input.input-field").first().fill("cat");
  await page.locator("textarea.input-field").fill("animal");

  await page.locator("button.key", { hasText: /^k$/ }).click();
  await page.locator("button.key", { hasText: /^æ$/ }).click();
  await page.locator("button.key", { hasText: /^t$/ }).click();

  await page.getByRole("button", { name: "Save Wordle Activity" }).click();

  await page.waitForURL("**/activities");

  await expect(page.locator("h2", { hasText: "Wordle Activities" })).toBeVisible();
});
