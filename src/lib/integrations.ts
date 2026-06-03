export const PLATFORMS = [
  {
    id: "google_classroom",
    label: "Google Classroom",
    description: "Import roster & assignments via CSV or API key",
    csv: true,
    api: true,
  },
  {
    id: "canvas",
    label: "Canvas LMS",
    description: "Common Cartridge, CSV roster, course ID",
    csv: true,
    api: true,
  },
  {
    id: "schoology",
    label: "Schoology",
    description: "CSV gradebook export + course sync",
    csv: true,
    api: false,
  },
  {
    id: "microsoft_teams",
    label: "Microsoft Teams for Education",
    description: "Class roster CSV from Teams admin",
    csv: true,
    api: false,
  },
  {
    id: "blackboard",
    label: "Blackboard Learn",
    description: "Roster CSV + course copy",
    csv: true,
    api: false,
  },
  {
    id: "moodle",
    label: "Moodle",
    description: "MBZ/CSV export import",
    csv: true,
    api: false,
  },
  {
    id: "clever",
    label: "Clever",
    description: "District SSO roster (API key)",
    csv: false,
    api: true,
  },
  {
    id: "classdojo",
    label: "ClassDojo",
    description: "Parent/student list CSV",
    csv: true,
    api: false,
  },
  {
    id: "remind",
    label: "Remind",
    description: "Copy join link to Remind chat",
    csv: false,
    api: false,
  },
  {
    id: "edmodo",
    label: "Edmodo",
    description: "Legacy class CSV export",
    csv: true,
    api: false,
  },
  {
    id: "infinite_campus",
    label: "Infinite Campus",
    description: "SIS roster CSV",
    csv: true,
    api: false,
  },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]["id"];

export function isPlatformId(s: string): s is PlatformId {
  return PLATFORMS.some((p) => p.id === s);
}
