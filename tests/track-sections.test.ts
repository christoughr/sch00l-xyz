import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { STUDY_TRACKS } from "../src/lib/study-tracks.ts";
import { getTrackSections, buildSectionTopic } from "../src/lib/track-sections.ts";
import { allBankTestIds, getBankItems } from "../src/lib/practice-catalog.ts";

describe("track sections", () => {
  it("returns 5 sections for every non-custom track", () => {
    for (const track of STUDY_TRACKS) {
      if (track.id === "custom") continue;
      const sections = getTrackSections(track.id);
      assert.ok(sections.length >= 5);
    }
  });

  it("AP Bio has real unit names", () => {
    const sections = getTrackSections("ap-bio");
    assert.ok(sections.some((s) => s.id === "cells"));
    assert.ok(sections.some((s) => s.id === "genetics"));
  });

  it("buildSectionTopic includes section description", () => {
    const topic = buildSectionTopic("ap-bio", "cells");
    assert.ok(topic.toLowerCase().includes("cell"));
  });
});

describe("practice banks", () => {
  it("has curated questions for all catalog tests", () => {
    const ids = allBankTestIds();
    assert.ok(ids.length >= 15);
    for (const id of ids) {
      assert.ok(getBankItems(id, 5).length >= 5);
    }
  });

  it("AP Bio bank has skill tags", () => {
    const items = getBankItems("ap-bio-mcq", 10);
    assert.ok(items.every((q) => q.skillTag && q.choices.length === 4));
  });
});
