import { test, expect } from "@playwright/test";

test("pricing page loads without error", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page).not.toHaveURL(/error/);
  const body = await page.textContent("body");
  expect(body).toBeTruthy();
});

test("checkout API returns 503 or 200 when LS not configured", async ({
  request,
}) => {
  const res = await request.post("/api/payments/checkout", {
    data: { plan: "pro" },
  });
  expect([200, 503, 429]).toContain(res.status());
});
