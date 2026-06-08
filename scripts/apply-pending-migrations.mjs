#!/usr/bin/env node
/**
 * Apply all SQL files in supabase/migrations/ (needs DATABASE_URL in .env.local).
 * Usage: node scripts/apply-pending-migrations.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(root);

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error(
    "Missing DATABASE_URL in .env.local\n" +
      "Supabase → Connect (top of project) → ORM / URI → copy postgresql://…\n" +
      "Use the *Session pooler* or *Direct* connection string with your DB password."
  );
  process.exit(1);
}

const migDir = path.join(root, "supabase", "migrations");
const files = fs
  .readdirSync(migDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const pg = await import("pg");
const client = new pg.default.Client({ connectionString: dbUrl });
await client.connect();

for (const file of files) {
  const sql = fs.readFileSync(path.join(migDir, file), "utf8");
  try {
    await client.query(sql);
    console.log("OK", file);
  } catch (e) {
    if (/already exists/i.test(e.message)) console.log("skip (exists)", file);
    else throw e;
  }
}

await client.end();
console.log("All migrations applied.");
