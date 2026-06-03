import { describe, it } from "node:test";
import assert from "node:assert";
import { parseRosterCsv } from "../src/lib/classroom-import";

describe("parseRosterCsv", () => {
  it("parses Google Classroom style CSV", () => {
    const csv = `First name,Last name,Email Address
Ada,Lovelace,ada@school.edu
Bob,Smith,bob@school.edu`;
    const r = parseRosterCsv(csv);
    assert.equal(r.emails.length, 2);
    assert.ok(r.emails.includes("ada@school.edu"));
  });
});
