const MAX_CHARS = 50_000;

export async function extractTextFromBuffer(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  const lower = fileName.toLowerCase();

  if (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return new TextDecoder().decode(buffer).slice(0, MAX_CHARS);
  }

  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      const joined = Array.isArray(text) ? text.join("\n") : String(text ?? "");
      return joined.slice(0, MAX_CHARS);
    } catch {
      return `PDF upload: ${fileName}. Could not extract text — use title/filename for auto-assign.`;
    }
  }

  return `Uploaded file: ${fileName}`;
}
