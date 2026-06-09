import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FREE_AI_SESSIONS_PER_DAY,
  PLATFORM_FEE,
  PRICING,
  SELLABLE_CURRICULA,
  alaCarteTotal,
  annualSavingsPercent,
  bundleSavings,
  bundleSavingsPercent,
  freeSessionsMarketingLabel,
  freeSessionsShortLabel,
} from "../src/lib/pricing.ts";

describe("pricing consistency", () => {
  it("free tier uses single source of truth", () => {
    assert.equal(PRICING.free.aiSessionsPerDay, FREE_AI_SESSIONS_PER_DAY);
    assert.equal(FREE_AI_SESSIONS_PER_DAY, 1);
  });

  it("marketing labels match session count", () => {
    assert.equal(freeSessionsMarketingLabel(), "1 AI session/day");
    assert.equal(freeSessionsShortLabel(), "1 session/day");
  });

  it("free plan features mention session count", () => {
    assert.ok(
      PRICING.free.features[0].includes(String(FREE_AI_SESSIONS_PER_DAY))
    );
  });

  it("bundle is cheaper than à la carte", () => {
    assert.ok(SELLABLE_CURRICULA.length >= 4);
    assert.ok(bundleSavings("monthly") > 0);
    assert.ok(bundleSavings("annual") > 0);
    assert.ok(bundleSavingsPercent("annual") > 0);
    assert.ok(alaCarteTotal("monthly") > PRICING.bundle.priceMonthly);
  });

  it("annual billing saves vs 12 months", () => {
    const m = PRICING.membership;
    assert.ok(annualSavingsPercent(m.priceMonthly, m.priceAnnual) > 0);
  });

  it("each curriculum has its own price", () => {
    const prices = SELLABLE_CURRICULA.map((c) => c.priceMonthly);
    assert.ok(new Set(prices).size > 1);
    assert.ok(PRICING.bundle.priceMonthly >= 150);
  });

  it("tutor platform fee is 45%", () => {
    assert.equal(PLATFORM_FEE.humanTutorPercent, 45);
  });
});
