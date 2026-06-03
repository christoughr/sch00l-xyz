import { isTeacherEmail } from "./teacher";

/** Students only — excludes classroom owner and teacher-role accounts. */
export function isRosterStudent(opts: {
  userId: string;
  teacherId: string;
  email?: string | null;
  role?: string | null;
}): boolean {
  if (opts.userId === opts.teacherId) return false;
  if (opts.role === "teacher") return false;
  if (isTeacherEmail(opts.email)) return false;
  return true;
}
