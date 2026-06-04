import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FREE_AI_SESSIONS_PER_DAY,
  PRICING,
  freeSessionsMarketingLabel,
  freeSessionsShortLabel,
} from "../src/lib/pricing.ts";

describe("pricing consistency", () => {
  it("free tier uses single source of truth", () => {
    assert.equal(PRICING.free.aiSessionsPerDay, FREE_AI_SESSIONS_PER_DAY);
    assert.equal(FREE_AI_SESSIONS_PER_DAY, 3);
  });

  it("marketing labels match session count", () => {
    assert.equal(freeSessionsMarketingLabel(), "3 AI sessions/day");
    assert.equal(freeSessionsShortLabel(), "3 sessions/day");
  });

  it("free plan features mention session count", () => {
    assert.ok(
      PRICING.free.features[0].includes(String(FREE_AI_SESSIONS_PER_DAY))
    );
  });
});
