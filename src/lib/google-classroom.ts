import { createAdminClient } from "@/lib/supabase/admin";
import { decryptToken, encryptToken } from "@/lib/token-crypto";

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
].join(" ");

export function googleOAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function googleRedirectUri(): string {
  return `${siteUrl()}/api/integrations/google/callback`;
}

export function buildGoogleAuthUrl(teacherId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: teacherId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
} | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
} | null> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getGoogleAccessToken(
  teacherId: string
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: row } = await admin
    .from("teacher_integrations")
    .select("*")
    .eq("teacher_id", teacherId)
    .eq("provider", "google_classroom")
    .eq("status", "connected")
    .maybeSingle();

  if (!row?.access_token_enc) return null;

  let access = decryptToken(row.access_token_enc);
  if (!access) return null;

  const expires = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expires > Date.now() + 60_000) return access;

  const refresh = row.refresh_token_enc
    ? decryptToken(row.refresh_token_enc)
    : null;
  if (!refresh) return access;

  const tokens = await refreshGoogleToken(refresh);
  if (!tokens) {
    await admin
      .from("teacher_integrations")
      .update({ status: "disconnected" })
      .eq("id", row.id);
    return null;
  }

  const enc = encryptToken(tokens.access_token);
  if (enc) {
    await admin
      .from("teacher_integrations")
      .update({
        access_token_enc: enc,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }
  return tokens.access_token;
}

export async function storeGoogleTokens(
  teacherId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const accessEnc = encryptToken(tokens.access_token);
  const refreshEnc = tokens.refresh_token
    ? encryptToken(tokens.refresh_token)
    : null;
  if (!accessEnc) return false;

  const { error } = await admin.from("teacher_integrations").upsert(
    {
      teacher_id: teacherId,
      provider: "google_classroom",
      access_token_enc: accessEnc,
      refresh_token_enc: refreshEnc,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      status: "connected",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "teacher_id,provider" }
  );

  return !error;
}

export async function syncGoogleClassroom(teacherId: string): Promise<{
  coursesImported: number;
  studentsImported: number;
  error?: string;
}> {
  const access = await getGoogleAccessToken(teacherId);
  if (!access) {
    return { coursesImported: 0, studentsImported: 0, error: "Not connected" };
  }

  const headers = { Authorization: `Bearer ${access}` };
  const coursesRes = await fetch(
    "https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE",
    { headers }
  );

  if (coursesRes.status === 401) {
    const admin = createAdminClient();
    await admin
      ?.from("teacher_integrations")
      .update({ status: "disconnected" })
      .eq("teacher_id", teacherId)
      .eq("provider", "google_classroom");
    return {
      coursesImported: 0,
      studentsImported: 0,
      error: "Google authorization expired — reconnect",
    };
  }

  if (!coursesRes.ok) {
    return {
      coursesImported: 0,
      studentsImported: 0,
      error: "Could not fetch courses from Google",
    };
  }

  const coursesJson = (await coursesRes.json()) as {
    courses?: { id: string; name: string }[];
  };
  const courses = coursesJson.courses ?? [];
  let studentsImported = 0;

  const admin = createAdminClient();
  if (!admin) {
    return { coursesImported: 0, studentsImported: 0, error: "Server not configured" };
  }

  for (const course of courses) {
    const studentsRes = await fetch(
      `https://classroom.googleapis.com/v1/courses/${course.id}/students`,
      { headers }
    );
    if (!studentsRes.ok) continue;

    const studentsJson = (await studentsRes.json()) as {
      students?: { profile?: { emailAddress?: string } }[];
    };
    const emails = (studentsJson.students ?? [])
      .map((s) => s.profile?.emailAddress?.toLowerCase().trim())
      .filter((e): e is string => !!e);

    studentsImported += emails.length;

    await admin
      .from("teacher_integrations")
      .update({
        meta: {
          lastSyncAt: new Date().toISOString(),
          lastCourse: course.name,
          rosterCount: emails.length,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("teacher_id", teacherId)
      .eq("provider", "google_classroom");
  }

  return { coursesImported: courses.length, studentsImported };
}
