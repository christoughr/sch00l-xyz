import { describe, it } from "node:test";
import assert from "node:assert";
import { STUDY_TRACKS, tracksInCategory } from "../src/lib/study-tracks";

describe("global study tracks", () => {
  it("has 120+ tracks including international", () => {
    assert.ok(STUDY_TRACKS.length >= 120);
    const intl = tracksInCategory("international");
    assert.ok(intl.length >= 30);
  });

  it("has professional exam tracks", () => {
    const pro = tracksInCategory("professional");
    assert.ok(pro.length >= 3);
  });
});
