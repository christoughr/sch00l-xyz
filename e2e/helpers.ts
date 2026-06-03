import type { Page } from "@playwright/test";

const CONSENT_KEY = "sch00l_age_consent_v1";

const E2E_CONSENT = {
  birthYear: 2000,
  isUnder13: false,
  parentalConsent: true,
  termsAccepted: true,
  at: new Date().toISOString(),
};

export async function acceptAgeGate(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "sch00l_age_consent_v1",
      JSON.stringify({
        birthYear: 2000,
        isUnder13: false,
        parentalConsent: true,
        termsAccepted: true,
        at: new Date().toISOString(),
      })
    );
  });
}

/** Navigate after consent; reload once if age gate still blocks content. */
export async function gotoApp(page: Page, path: string) {
  await acceptAgeGate(page);
  await page.goto(path, { waitUntil: "domcontentloaded" });

  const gate = page.getByRole("heading", { name: "Welcome to sch00l" });
  if (await gate.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.evaluate(
      ({ key, data }) => localStorage.setItem(key, data),
      { key: CONSENT_KEY, data: JSON.stringify(E2E_CONSENT) }
    );
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await gate.waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
}

/** Seed paired pre/post quiz for learning lift on /progress */
export async function seedQuizLift(page: Page) {
  await page.addInitScript(() => {
    const sid = "e2e-lift-session";
    const now = new Date().toISOString();
    localStorage.setItem(
      "sch00l_quiz_results_v1",
      JSON.stringify([
        {
          id: "e2e-pre",
          subject: "math",
          topic: "derivatives",
          phase: "pre",
          score: 1,
          total: 3,
          sessionId: sid,
          createdAt: now,
        },
        {
          id: "e2e-post",
          subject: "math",
          topic: "derivatives",
          phase: "post",
          score: 2,
          total: 3,
          sessionId: sid,
          createdAt: now,
        },
      ])
    );
  });
}

export async function seedSessionMemory(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "sch00l_session_memory_v1",
      JSON.stringify([
        {
          id: "e2e-mem-1",
          subject: "math",
          topic: "AP Calculus AB",
          summary: "Worked through chain rule with u-substitution.",
          liftLabel: "33% → 67% (+34 lift)",
          createdAt: new Date().toISOString(),
        },
      ])
    );
  });
}
