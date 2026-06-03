import { test, expect } from "@playwright/test";
import { acceptAgeGate } from "./helpers";

test.describe("sch00l smoke", () => {
  test("health API", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("sch00l");
    expect(["demo", "live"]).toContain(body.aiMode);
  });

  test("study flow: setup → skip pre → tutor input", async ({ page }) => {
    await acceptAgeGate(page);
    await page.goto("/study");
    await expect(
      page.getByRole("heading", { name: "Study session" })
    ).toBeVisible();

    const startBtn = page.getByRole("button", {
      name: /Continue to pre-quiz/i,
    });
    if (await startBtn.isDisabled()) {
      test.skip(true, "Free tier limit reached on this device/IP");
    }

    await startBtn.click();
    await page.getByRole("button", { name: /Skip pre-quiz/i }).click();

    await expect(
      page.getByPlaceholder(/stuck/i)
    ).toBeVisible({ timeout: 20_000 });
  });

  test("pricing and pro guard", async ({ page }) => {
    await acceptAgeGate(page);
    await page.goto("/pro/success");
    await expect(page.getByText(/Almost there/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
