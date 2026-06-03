import { chatCompletion } from "./llm";

export async function moderatePost(body: string): Promise<{
  flagged: boolean;
  reason?: string;
}> {
  const raw = await chatCompletion(
    `Moderate a student forum post for academic community safety. Reply JSON only: {"flagged":boolean,"reason":"optional short"}`,
    body.slice(0, 2000),
    { maxTokens: 120, temperature: 0 }
  );

  if (!raw) return { flagged: false };

  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) return { flagged: false };
    const parsed = JSON.parse(m[0]) as { flagged?: boolean; reason?: string };
    return { flagged: !!parsed.flagged, reason: parsed.reason };
  } catch {
    return { flagged: false };
  }
}
