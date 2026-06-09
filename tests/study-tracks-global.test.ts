import { describe, it } from "node:test";
import assert from "node:assert";
import { STUDY_TRACKS, tracksInCategory } from "../src/lib/study-tracks";

describe("global study tracks", () => {
  it("has 280+ tracks including international", () => {
    assert.ok(STUDY_TRACKS.length >= 280);
    const intl = tracksInCategory("international");
    assert.ok(intl.length >= 45);
  });

  it("has professional exam tracks", () => {
    const pro = tracksInCategory("professional");
    assert.ok(pro.length >= 10);
  });

  it("has 60+ college and university courses", () => {
    const college = tracksInCategory("college");
    assert.ok(college.length >= 60);
    assert.ok(college.some((t) => t.id === "college-calc-1"));
    assert.ok(college.some((t) => t.id === "college-data-structures"));
  });
});
