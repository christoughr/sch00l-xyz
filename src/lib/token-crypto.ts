import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const MIN_KEY_LEN = 32;

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Dedicated 32+ char secret for OAuth tokens (Vercel: INTEGRATION_TOKEN_KEY).
 * Never use the Supabase service role as encryption key in production.
 */
export function integrationTokenKeyConfigured(): boolean {
  const raw = process.env.INTEGRATION_TOKEN_KEY?.trim();
  return !!raw && raw.length >= MIN_KEY_LEN;
}

function key(): Buffer | null {
  const dedicated = process.env.INTEGRATION_TOKEN_KEY?.trim();
  if (dedicated && dedicated.length >= MIN_KEY_LEN) {
    return crypto.createHash("sha256").update(dedicated, "utf8").digest();
  }

  if (isProduction()) {
    return null;
  }

  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!fallback) return null;
  return crypto.createHash("sha256").update(fallback, "utf8").digest();
}

export function encryptToken(plain: string): string | null {
  const k = key();
  if (!k) return null;
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, k, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptToken(blob: string): string | null {
  const k = key();
  if (!k) return null;
  try {
    const buf = Buffer.from(blob, "base64");
    if (buf.length < IV_LEN + 16 + 1) return null;
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + 16);
    const data = buf.subarray(IV_LEN + 16);
    const decipher = crypto.createDecipheriv(ALGO, k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString(
      "utf8"
    );
  } catch {
    return null;
  }
}
