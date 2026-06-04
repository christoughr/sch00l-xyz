/** Shared body cleanup for publisher lesson polish (no OpenStax, minimal headings). */

export function polishBodyMarkdown(body: string, addHeading = false): string {
  let b = body;

  b = b.replace(/^#\s*.+$/m, addHeading ? "# Study notes\n" : "");
  b = b.replace(/\*\*Publisher source:\*\*[^\n]+\n*/gi, "");
  b = b.replace(
    /### Study notes \(extract[^\)]*\)[^\n]*\n*/gi,
    "### Key ideas\n\n"
  );
  b = b.replace(/\*Digital adaptation for sch00l[^\n]*\*/gi, "");
  b = b.replace(
    /\*Replace this block with original sch00l lesson prose before publishing\.\*/gi,
    ""
  );
  b = b.replace(/\n+---\n+\*\*Free textbook:\*\*[^\n]*openstax\.org[^\n]*\n*/gi, "\n");
  b = b.replace(/…/g, "...");
  b = b.replace(/\n{3,}/g, "\n\n");

  if (!b.includes("### Key ideas") && b.length > 80) {
    const intro =
      "### Key ideas\n\nWork through this section with the AI tutor — ask for practice questions, not answer keys.\n\n";
    if (b.match(/^#\s/m)) {
      b = b.replace(/^#\s[^\n]+\n\n/, (m) => m + intro);
    } else {
      b = intro + b;
    }
  }

  return b.trim();
}

/** Minimal list label — unit name is shown in the outline header. */
export function minimalLessonTitle(sequenceInUnit: number): string {
  return `Lesson ${sequenceInUnit}`;
}
