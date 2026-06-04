import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  scoreUnit,
  polishBodyMarkdown,
  publisherTargets,
  planPublisherLessonUpdates,
} from "../src/lib/ap-bio-lesson-polish.ts";
import { minimalLessonTitle } from "../src/lib/lesson-polish-shared.ts";

describe("ap-bio lesson polish", () => {
  it("uses minimal lesson titles", () => {
    assert.equal(minimalLessonTitle(4), "Lesson 4");
    assert.ok(!minimalLessonTitle(1).includes("Barron"));
  });

  it("scores genetics content to unit 2", () => {
    assert.equal(scoreUnit("DNA replication and Punnett squares"), 2);
  });

  it("polishes body without openstax", () => {
    const out = polishBodyMarkdown(
      "# ugly — part 1\n\n**Publisher source:** foo\n\n### Study notes (extract)\n\nHello\n\n---\n**Free textbook:** [OpenStax](https://openstax.org/books/biology-2e)"
    );
    assert.ok(!out.includes("openstax.org"));
    assert.ok(!out.includes("Publisher source"));
  });

  it("balances 96 publisher lessons across units", () => {
    const targets = publisherTargets(96);
    assert.deepEqual(targets, { 1: 20, 2: 19, 3: 19, 4: 19, 5: 19 });
    const unitIds = { 1: "u1", 2: "u2", 3: "u3", 4: "u4", 5: "u5" };
    const lessons = Array.from({ length: 96 }, (_, i) => ({
      id: `id-${i}`,
      unit_id: "u1",
      unit_ord: 1,
      ord: 100 + i,
      title: `AP Biology Premium part ${(i % 8) + 1}`,
      body_markdown: "practice test mcq frq exam strategy",
      source_pdf_name: "barrons-2025.pdf",
    }));
    const updates = planPublisherLessonUpdates(lessons, unitIds);
    const dist: Record<number, number> = {};
    for (const u of updates) dist[u.unit_ord] = (dist[u.unit_ord] ?? 0) + 1;
    assert.deepEqual(dist, targets);
  });
});
