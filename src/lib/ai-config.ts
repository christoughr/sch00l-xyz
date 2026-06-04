/** Resolve AI API key — supports GROQ_API_KEY alias used in ops docs. */
export function getAiApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || undefined;
}

export function getAiBaseUrl(): string {
  if (process.env.OPENAI_BASE_URL) return process.env.OPENAI_BASE_URL;
  if (process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    return "https://api.groq.com/openai/v1";
  }
  return "https://api.openai.com/v1";
}

export function getAiModel(): string {
  if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;
  if (process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    return "llama-3.3-70b-versatile";
  }
  return "gpt-4o-mini";
}

export function isLiveAiConfigured(): boolean {
  return !!getAiApiKey();
}
