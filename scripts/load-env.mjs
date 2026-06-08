import fs from "fs";
import path from "path";

/** Load .env.local into process.env (does not override existing vars). */
export function loadEnvLocal(rootDir = process.cwd()) {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return false;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    if (process.env[key]) continue;
    process.env[key] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return true;
}
