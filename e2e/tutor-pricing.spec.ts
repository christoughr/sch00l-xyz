import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

test.describe("tutor pricing", () => {
  test("/tutors shows hourly rate range", async ({ page }) => {
    await gotoApp(page, "/tutors");
    await expect(page.getByText(/\$\d+–\$\d+/).first()).toBeVisible();
    await expect(page.getByText(/\/hr/i).first()).toBeVisible();
  });
});
