import { describe, it } from "node:test";
import assert from "node:assert";
import { generateBattleCode, scoreAnswer } from "../src/lib/battle";

describe("battle", () => {
  it("generates 6-char room codes", () => {
    const code = generateBattleCode();
    assert.equal(code.length, 6);
    assert.match(code, /^[23456789A-Z]+$/);
  });

  it("scores correct answers with speed bonus", () => {
    const fast = scoreAnswer(true, 5000);
    const slow = scoreAnswer(true, 25000);
    assert.ok(fast > slow);
    assert.equal(scoreAnswer(false, 1000), 0);
  });
});
