import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveCourseTrackId,
  getCourseTrackHint,
  hasCourseTrackAlias,
} from "../src/lib/course-tracks.ts";

describe("course track aliases", () => {
  it("resolves tracks to themselves by default", () => {
    assert.equal(resolveCourseTrackId("sat-reading"), "sat-reading");
    assert.equal(resolveCourseTrackId("ap-bio"), "ap-bio");
  });

  it("no aliased track hints", () => {
    assert.equal(getCourseTrackHint("sat-reading"), null);
    assert.equal(getCourseTrackHint("ap-bio"), null);
    assert.equal(hasCourseTrackAlias("sat-reading"), false);
  });
});
