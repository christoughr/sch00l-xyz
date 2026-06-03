import { describe, it } from "node:test";
import assert from "node:assert";
import { tutorRateRange } from "../src/lib/tutor-pricing";

describe("tutor-pricing", () => {
  it("returns competitive ranges by subject", () => {
    const m = tutorRateRange("math");
    assert.ok(m.min >= 45 && m.max <= 150);
    assert.ok(m.typical >= m.min && m.typical <= m.max);
  });

  it("urgent tier increases rates", () => {
    const n = tutorRateRange("science", "standard");
    const u = tutorRateRange("science", "urgent");
    assert.ok(u.min >= n.min);
  });
});
