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
