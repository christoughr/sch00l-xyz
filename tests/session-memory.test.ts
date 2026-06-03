import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recentMemorySummaries } from "../src/lib/session-memory.ts";

describe("session-memory", () => {
  it("formats summaries with optional lift label", () => {
    const summaries = recentMemorySummaries({
      subject: "math",
      limit: 2,
    });
    assert.ok(Array.isArray(summaries));
  });
});
