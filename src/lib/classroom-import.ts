export type RosterImportResult = {
  emails: string[];
  invalidRows: number;
};

/** Google Classroom / Canvas roster CSV (Email column required). */
export function parseRosterCsv(csvText: string): RosterImportResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { emails: [], invalidRows: 0 };

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/"/g, ""));
  const emailIdx = header.findIndex((h) =>
    ["email", "email address", "student email", "e-mail"].includes(h)
  );

  const emails: string[] = [];
  let invalidRows = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const raw =
      emailIdx >= 0 ? cols[emailIdx] : cols.find((c) => c.includes("@")) ?? "";
    const email = raw.replace(/"/g, "").trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) emails.push(email);
    else if (cols.some(Boolean)) invalidRows++;
  }

  return { emails: [...new Set(emails)], invalidRows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

/** Minimal Canvas Common Cartridge: extract title + learning objectives text if present. */
export function parseCanvasCcXml(xml: string): {
  title: string;
  excerpt: string;
} {
  const titleM = xml.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleM?.[1]?.trim() ?? "Imported Canvas module";
  const text = xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);
  return { title, excerpt: text };
}
