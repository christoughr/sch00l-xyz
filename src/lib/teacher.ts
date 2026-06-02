export function getTeacherEmails(): string[] {
  const raw = process.env.TEACHER_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isTeacherEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getTeacherEmails().includes(email.toLowerCase());
}

export function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
