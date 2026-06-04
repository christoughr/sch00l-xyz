import { test, expect } from "@playwright/test";

test.describe("checkout", () => {
  test("pricing page loads without error", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toContainText("Pricing");
    const body = await page.textContent("body");
    expect(body).toBeTruthy();
  });

  test("checkout API fails gracefully when payments not configured", async ({
    request,
  }) => {
    const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3099";
    const res = await request.post(`${base}/api/payments/checkout`, {
      data: { plan: "pro" },
    });
    expect([200, 401, 503]).toContain(res.status());
  });
});
