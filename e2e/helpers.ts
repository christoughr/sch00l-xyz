import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

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

export async function answerQuiz(page: Page, choices: number[]) {
  for (let i = 0; i < choices.length; i += 1) {
    await expect(page.getByText(`Question ${i + 1} of ${choices.length}`)).toBeVisible();
    const options = page
      .getByRole("listbox", { name: "Answer choices" })
      .getByRole("button");
    await options.nth(choices[i]).click();
    await page
      .getByRole("button", {
        name: i + 1 < choices.length ? "Next" : "Finish",
      })
      .click();
  }
}
