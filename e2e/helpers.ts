import type { Page } from "@playwright/test";

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
