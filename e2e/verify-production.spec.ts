import { test, expect } from "@playwright/test";
import { gotoApp } from "./helpers";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "https://sch00l.ai";

test.describe("2-minute production verification", () => {
  test.use({ baseURL: base });

  test("health + copy + practice gate", async ({ request, page }) => {
    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    const h = await health.json();
    expect(h.integrationTokenEncryption).toBe("dedicated_key");

    await gotoApp(page, "/");
    await expect(page.getByText(/1 AI session/i)).toBeVisible();

    await gotoApp(page, "/pricing");
    await expect(page.getByText(/1 AI study session/i).first()).toBeVisible();

    const practice = await request.get("/practice", { maxRedirects: 0 });
    expect([302, 307, 308]).toContain(practice.status());
  });

  test("AP Bio course API after seed", async ({ request }) => {
    const res = await request.get("/api/courses/ap-bio");
    if (!res.ok()) {
      test.skip(true, "Deploy latest app; run SQL 017 + 018");
    }
    const data = await res.json();
    const count = (data.units ?? []).reduce(
      (n: number, u: { lessons?: unknown[] }) =>
        n + (u.lessons?.length ?? 0),
      0
    );
    if (count === 0) {
      test.skip(true, "Run SQL 017 + 018 in Supabase to seed AP Bio lessons");
    }
    expect(count).toBeGreaterThanOrEqual(100);
  });
});
