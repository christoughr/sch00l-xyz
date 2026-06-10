import crypto from "crypto";

/** Short-lived signed token for per-request lesson body fetch (default 5 min). */
const TTL_MS = 5 * 60 * 1000;

function secret(): string {
  const key =
    process.env.LESSON_SESSION_SECRET ||
    process.env.INTEGRATION_TOKEN_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("LESSON_SESSION_SECRET or INTEGRATION_TOKEN_KEY required");
  }
  return key;
}

function signPayload(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueLessonSessionToken(lessonId: string, userId: string): {
  token: string;
  expiresAt: number;
} {
  const expiresAt = Date.now() + TTL_MS;
  const payload = `${lessonId}|${userId}|${expiresAt}`;
  const sig = signPayload(payload);
  const token = Buffer.from(`${payload}|${sig}`).toString("base64url");
  return { token, expiresAt };
}

export function verifyLessonSessionToken(
  token: string,
  lessonId: string,
  userId: string
): boolean {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parts = raw.split("|");
    if (parts.length !== 4) return false;
    const [lid, uid, expStr, sig] = parts;
    if (lid !== lessonId || uid !== userId) return false;
    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;
    const payload = `${lid}|${uid}|${exp}`;
    const expected = signPayload(payload);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Insert user email watermark after each paragraph block in markdown. */
export function watermarkLessonBody(body: string, email: string): string {
  const tag = `<!-- wm:${email} -->`;
  const lines = body.split("\n");
  const out: string[] = [];
  let para: string[] = [];

  const flush = () => {
    if (para.length === 0) return;
    out.push(para.join("\n"));
    out.push(`\n> _Licensed to ${email} · sch00l.ai_\n`);
    para = [];
  };

  for (const line of lines) {
    if (line.trim() === "") {
      flush();
      out.push("");
    } else if (/^#{1,6}\s/.test(line) || /^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      flush();
      out.push(line);
    } else {
      para.push(line);
    }
  }
  flush();
  return `${tag}\n${out.join("\n")}`;
}
