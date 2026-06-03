import { test, expect } from "@playwright/test";
import { gotoApp, seedQuizLift, seedSessionMemory } from "./helpers";

test.describe("progress page", () => {
  test("shows learning lift from local quiz data", async ({ page }) => {
    await seedQuizLift(page);
    await gotoApp(page, "/progress");

    await expect(
      page.getByRole("heading", { name: "Your progress" })
    ).toBeVisible();
    await expect(page.getByText(/Latest learning lift/i)).toBeVisible();
    await expect(page.getByText(/33%.*67%.*lift/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows session history from local memory", async ({ page }) => {
    await seedSessionMemory(page);
    await gotoApp(page, "/progress");

    await expect(page.getByRole("heading", { name: "Session history" })).toBeVisible();
    await expect(page.getByText(/chain rule/i)).toBeVisible();
    await expect(page.getByText(/33% → 67%/)).toBeVisible();
  });
});
