import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { inferQuizDifficulty } from "../src/lib/quiz-difficulty.ts";
import { buildStudentLearningContext } from "../src/lib/student-profile.ts";
import { EMPTY_PROGRESS } from "../src/lib/progress.ts";

describe("quiz-difficulty", () => {
  it("uses foundational when pre-quiz is low", () => {
    const ctx = buildStudentLearningContext(EMPTY_PROGRESS, {
      preScoreToday: 40,
    });
    assert.equal(
      inferQuizDifficulty({ phase: "pre", studentContext: ctx }),
      "foundational"
    );
  });

  it("uses challenging when mastery is high", () => {
    const ctx = buildStudentLearningContext({
      ...EMPTY_PROGRESS,
      mastery: [
        {
          subject: "math",
          topic: "integrals",
          confidence: 85,
          lastPracticed: new Date().toISOString(),
        },
      ],
    });
    assert.equal(
      inferQuizDifficulty({ phase: "pre", studentContext: ctx }),
      "challenging"
    );
  });
});
