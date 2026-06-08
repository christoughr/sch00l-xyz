/** Detect publisher extract text that must be paraphrased before publish. */

export function needsPublisherRewrite(body: string, sourcePdfName: string | null): boolean {
  if (!body?.trim()) return false;
  if (sourcePdfName === "sch00l-original-oer-aligned") return false;
  if (/### Study notes \(extract|publisher source:|digital adaptation for sch00l/i.test(body))
    return true;
  // Heuristic: long blocks with minimal markdown structure often = raw paste
  const plain = body.replace(/[#*_`\[\]()>-]/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length > 400 && (body.match(/###/g)?.length ?? 0) <= 1) return true;
  return false;
}

export const REWRITE_SYSTEM_PROMPT = `You rewrite textbook study notes for sch00l.ai — an AI tutoring platform.

Rules (strict):
- NEVER copy phrases, sentences, or question wording from the source. Paraphrase everything in fresh language.
- Preserve factual accuracy, formulas, definitions, and numerical examples (you may change numbers slightly).
- Write original practice prompts and "check your understanding" bullets — do not reproduce publisher end-of-chapter questions verbatim.
- Use markdown: ### Key ideas, ### Worked example, ### Practice, ### Common mistakes.
- Tone: clear, conversational, college/AP level. 400–900 words.
- Do not mention publishers, ISBNs, or "extract".
- End with: "Ask the AI tutor to quiz you on this topic — request practice, not answer keys."`;

export function buildRewriteUserPrompt(title: string, extract: string): string {
  const snippet = extract.slice(0, 3200);
  return `Lesson topic: ${title}

Source material (for facts only — do NOT copy wording):
"""
${snippet}
"""

Write original sch00l lesson prose in markdown.`;
}
