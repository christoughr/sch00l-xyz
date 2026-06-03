import { test, expect } from "@playwright/test";
import { acceptAgeGate, answerQuiz } from "./helpers";

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

  test("study flow records pre/post learning lift", async ({ page }) => {
    await page.route("**/api/quiz/generate", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          phase: "pre",
          questions: [
            {
              id: "1",
              question: "Best first step when stuck?",
              options: ["Ask for the answer", "Name the confusing step", "Skip it", "Memorize it"],
              correctIndex: 1,
              explanation: "Finding the stuck step makes help targeted.",
            },
            {
              id: "2",
              question: "Which method builds retention?",
              options: ["Rereading", "Highlighting", "Active recall", "Copying"],
              correctIndex: 2,
              explanation: "Retrieval practice improves long-term memory.",
            },
            {
              id: "3",
              question: "What should follow a session?",
              options: ["New topic", "Short brain dump", "Forget it", "Only cram"],
              correctIndex: 1,
              explanation: "Brief recall consolidates learning.",
            },
          ],
        }),
      });
    });

    await acceptAgeGate(page);
    await page.goto("/study");
    await page.getByRole("button", { name: /Continue to pre-quiz/i }).click();
    await answerQuiz(page, [0, 0, 0]);

    const tutorInput = page.getByPlaceholder(/stuck/i);
    await expect(tutorInput).toBeVisible({ timeout: 20_000 });
    await tutorInput.fill("I keep mixing up active recall and rereading.");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByRole("button", { name: /End session/i }).click();

    await answerQuiz(page, [1, 2, 1]);
    await expect(page.getByRole("heading", { name: "Session complete" })).toBeVisible();
    await expect(page.getByText(/Pre-quiz: 0%.*Post-quiz: 100%.*\+100 lift/)).toBeVisible();
    await expect(page.getByText(/Learning lift saved/)).toBeVisible();
  });

  test("pricing and pro guard", async ({ page }) => {
    await acceptAgeGate(page);
    await page.goto("/pro/success");
    await expect(page.getByText(/Almost there/i)).toBeVisible({
      timeout: 15_000,
    });
  });
});
