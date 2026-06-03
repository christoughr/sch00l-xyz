import { chatCompletion } from "./llm";
import { STUDY_TRACKS } from "./study-tracks";
import { getTrackSections, buildSectionTopic } from "./track-sections";

export type AutoAssignResult = {
  title: string;
  studyTrackId: string;
  sectionId: string | null;
  topic: string;
};

export async function suggestAssignmentFromMaterial(
  fileName: string,
  extractedText: string
): Promise<AutoAssignResult | null> {
  const catalog = STUDY_TRACKS.slice(0, 40).map((t) => ({
    id: t.id,
    label: t.label,
    topic: t.topic,
  }));

  const raw = await chatCompletion(
    `You match teacher uploads to a study catalog. Reply with ONLY valid JSON:
{"title":"string","studyTrackId":"id from catalog","sectionId":"unit id or null","confidence":0-1}
Pick the best track for AP/exam/K-12 content. sectionId can be null if unclear.`,
    `Filename: ${fileName}\n\nContent excerpt:\n${extractedText.slice(0, 6000)}\n\nCatalog:\n${JSON.stringify(catalog)}`,
    { maxTokens: 400, temperature: 0.2 }
  );

  if (!raw) return fallbackAssign(fileName, extractedText);

  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return fallbackAssign(fileName, extractedText);
    const parsed = JSON.parse(m[0]) as {
      title?: string;
      studyTrackId?: string;
      sectionId?: string | null;
    };
    const track =
      STUDY_TRACKS.find((t) => t.id === parsed.studyTrackId) ??
      matchTrackByKeywords(fileName + extractedText);
    if (!track) return fallbackAssign(fileName, extractedText);

    const sections = getTrackSections(track.id);
    const sectionId =
      parsed.sectionId &&
      sections.some((s) => s.id === parsed.sectionId)
        ? parsed.sectionId
        : sections[0]?.id ?? null;

    return {
      title: parsed.title?.slice(0, 120) ?? fileName.replace(/\.[^.]+$/, ""),
      studyTrackId: track.id,
      sectionId,
      topic: buildSectionTopic(track.id, sectionId),
    };
  } catch {
    return fallbackAssign(fileName, extractedText);
  }
}

function matchTrackByKeywords(text: string) {
  const t = text.toLowerCase();
  if (t.includes("biology") || t.includes("cell") || t.includes("genetics"))
    return STUDY_TRACKS.find((x) => x.id === "ap-bio");
  if (t.includes("calculus") || t.includes("derivative"))
    return STUDY_TRACKS.find((x) => x.id === "ap-calc-ab");
  if (t.includes("sat") || t.includes("act"))
    return STUDY_TRACKS.find((x) => x.id.includes("sat"));
  return STUDY_TRACKS[0];
}

function fallbackAssign(fileName: string, text: string): AutoAssignResult | null {
  const track = matchTrackByKeywords(fileName + " " + text);
  if (!track) return null;
  const sectionId = getTrackSections(track.id)[0]?.id ?? null;
  return {
    title: fileName.replace(/\.[^.]+$/, ""),
    studyTrackId: track.id,
    sectionId,
    topic: buildSectionTopic(track.id, sectionId),
  };
}
