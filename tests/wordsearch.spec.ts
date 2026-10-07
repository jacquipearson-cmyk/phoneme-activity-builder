import { test, expect } from "@playwright/test";

test("User can play a Word Search activity", async ({ page }) => {
  await page.goto("http://localhost:3000/activities");

  await page.locator("h2", { hasText: "Word Search Activities" })
    .locator("..")
    .getByRole("button", { name: "Play" })
    .first()
    .click();

  await expect(page.locator(".word-search-grid")).toBeVisible();
  await expect(page.locator(".ws-word-item").first()).toBeVisible();
});
