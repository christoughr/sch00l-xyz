import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildStudentLearningContext,
  formatStudentContextForPrompt,
  hasPersonalizationData,
} from "../src/lib/student-profile.ts";
import { EMPTY_PROGRESS } from "../src/lib/progress.ts";

describe("student-profile", () => {
  it("formats weak topics for prompt", () => {
    const ctx = buildStudentLearningContext({
      ...EMPTY_PROGRESS,
      mastery: [
        {
          subject: "math",
          topic: "derivatives",
          confidence: 30,
          lastPracticed: new Date().toISOString(),
        },
      ],
      totalSessions: 2,
    });
    const block = formatStudentContextForPrompt(ctx);
    assert.match(block, /derivatives/);
    assert.match(block, /30% confidence/);
    assert.equal(hasPersonalizationData(ctx), true);
  });

  it("includes pre-quiz score when provided", () => {
    const ctx = buildStudentLearningContext(EMPTY_PROGRESS, {
      preScoreToday: 67,
    });
    assert.equal(hasPersonalizationData(ctx), true);
    const block = formatStudentContextForPrompt(ctx);
    assert.match(block, /67%/);
  });
});
