import { getAiApiKey, getAiBaseUrl, getAiModel } from "./ai-config";

export async function chatCompletion(
  system: string,
  userContent: string,
  opts?: { maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const apiKey = getAiApiKey();
  if (!apiKey) return null;

  const baseUrl = getAiBaseUrl();
  const model = getAiModel();
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: opts?.temperature ?? 0.5,
      max_tokens: opts?.maxTokens ?? 1500,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

export function parseJsonArray<T>(raw: string): T[] | null {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}
