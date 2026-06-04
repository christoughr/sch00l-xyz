import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveCourseTrackId,
  getCourseTrackHint,
  hasCourseTrackAlias,
} from "../src/lib/course-tracks.ts";

describe("course track aliases", () => {
  it("maps sat-reading to sat-math", () => {
    assert.equal(resolveCourseTrackId("sat-reading"), "sat-math");
    assert.equal(resolveCourseTrackId("ap-bio"), "ap-bio");
  });

  it("hints for aliased tracks", () => {
    assert.ok(getCourseTrackHint("sat-reading")?.includes("SAT Math"));
    assert.equal(getCourseTrackHint("ap-bio"), null);
    assert.equal(hasCourseTrackAlias("sat-reading"), true);
  });
});
