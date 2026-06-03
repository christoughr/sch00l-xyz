import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aggregateLift, liftsBySessionId } from "../src/lib/quiz-lift.ts";

describe("quiz-lift", () => {
  it("pairs pre/post by session_id", () => {
    const lifts = liftsBySessionId([
      { session_id: "a", phase: "pre", score: 1, total: 2 },
      { session_id: "a", phase: "post", score: 2, total: 2 },
      { session_id: "b", phase: "pre", score: 0, total: 2 },
      { session_id: "b", phase: "post", score: 2, total: 2 },
    ]);
    assert.deepEqual(lifts, [50, 100]);
  });

  it("skips pre-skipped sessions", () => {
    const lifts = liftsBySessionId([
      {
        session_id: "x",
        phase: "pre",
        score: 0,
        total: 2,
        skipped: true,
      },
      { session_id: "x", phase: "post", score: 2, total: 2 },
    ]);
    assert.equal(lifts.length, 0);
  });

  it("aggregateLift averages session lifts", () => {
    const { averageLiftPercent, lifts } = aggregateLift([
      { session_id: "s1", phase: "pre", score: 1, total: 4 },
      { session_id: "s1", phase: "post", score: 3, total: 4 },
    ]);
    assert.equal(lifts[0], 50);
    assert.equal(averageLiftPercent, 50);
  });
});
