import { test, expect } from "@playwright/test";
import { acceptAgeGate, gotoApp } from "./helpers";

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
    await gotoApp(page, "/study");
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
    ).toBeVisible({ timeout: 25_000 });
  });

  test("study tracks: exam prep category", async ({ page }) => {
    await gotoApp(page, "/study");
    await page
      .getByRole("button", { name: "Exam prep", exact: true })
      .click();
    await expect(page.getByText(/MCAT/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("community page lists discussion", async ({ page }) => {
    await gotoApp(page, "/community");
    await expect(page.getByRole("heading", { name: /Community/i })).toBeVisible();
    await expect(page.getByText(/Class discussion/i)).toBeVisible();
  });

  test("study page shows discussion promo", async ({ page }) => {
    await gotoApp(page, "/study");
    await expect(
      page.getByText(/Class discussion|discussion & battles/i)
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Discussion" })).toBeVisible();
  });

  test("sign out API", async ({ request }) => {
    const res = await request.post("/api/auth/signout");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("tutors page layout", async ({ page }) => {
    await gotoApp(page, "/tutors");
    await expect(
      page.getByRole("heading", { name: /Request a human tutor/i })
    ).toBeVisible();
    await expect(page.getByText(/Math/i).first()).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
  });

  test("pricing and pro guard", async ({ page }) => {
    await gotoApp(page, "/pro/success");
    await expect(page.getByText(/Almost there/i)).toBeVisible({
      timeout: 20_000,
    });
  });
});
