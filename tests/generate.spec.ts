import { test, expect } from "@playwright/test";

test("User can play and export a Wordle activity", async ({ page }) => {
  await page.goto("http://localhost:3000/activities");

  await page.locator("h2", { hasText: "Wordle Activities" })
    .locator("..")
    .getByRole("button", { name: "Play" })
    .first()
    .click();

  await expect(page.locator(".wordle-container")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Download HTML/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("wordle");
});
