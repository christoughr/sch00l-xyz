import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

test.describe("forum navigation", () => {
  test("my-classes page promotes class discussion", async ({ page }) => {
    await gotoApp(page, "/my-classes");
    await expect(page.getByText(/class discussion/i).first()).toBeVisible();
  });

  test("community links to class discussion", async ({ page }) => {
    await gotoApp(page, "/community");
    await expect(page.getByText(/Class discussion/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /My classes/i })).toBeVisible();
  });
});
