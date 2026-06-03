import { STUDY_TRACKS, type StudyTrackId } from "./study-tracks";

export type TrackSection = {
  id: string;
  label: string;
  description: string;
};

const GENERIC_UNITS: TrackSection[] = [
  { id: "unit-1", label: "Unit 1 — Foundations", description: "Core concepts and vocabulary" },
  { id: "unit-2", label: "Unit 2 — Skills practice", description: "Worked examples and guided practice" },
  { id: "unit-3", label: "Unit 3 — Application", description: "Mixed problems and reasoning" },
  { id: "unit-4", label: "Unit 4 — Review", description: "Spiral review and exam-style items" },
  { id: "unit-5", label: "Unit 5 — Assessment prep", description: "Timed practice and lift check" },
];

const AP_BIO_SECTIONS: TrackSection[] = [
  { id: "cells", label: "Unit — Cells & organelles", description: "Structure, membrane transport, energetics" },
  { id: "genetics", label: "Unit — Genetics & heredity", description: "DNA, gene expression, inheritance" },
  { id: "evolution", label: "Unit — Evolution", description: "Natural selection, phylogeny, population genetics" },
  { id: "ecology", label: "Unit — Ecology", description: "Ecosystems, populations, conservation" },
  { id: "exam-prep", label: "Unit — AP exam prep", description: "FRQ strategies and full review" },
];

const BY_TRACK: Partial<Record<StudyTrackId, TrackSection[]>> = {
  "ap-bio": AP_BIO_SECTIONS,
};

export function getTrackSections(trackId: string): TrackSection[] {
  return BY_TRACK[trackId as StudyTrackId] ?? GENERIC_UNITS;
}

export function getSectionLabel(trackId: string, sectionId: string | null): string {
  if (!sectionId) return "";
  const s = getTrackSections(trackId).find((x) => x.id === sectionId);
  return s?.label ?? sectionId;
}

export function buildSectionTopic(trackId: string, sectionId: string | null): string {
  const track = STUDY_TRACKS.find((t) => t.id === trackId);
  const base = track?.topic ?? track?.label ?? "Study topic";
  const section = getTrackSections(trackId).find((s) => s.id === sectionId);
  if (!section) return base;
  return `${base} — ${section.label}: ${section.description}`;
}
