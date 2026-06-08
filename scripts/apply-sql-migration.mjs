#!/usr/bin/env node
/** Apply a single migration file via Supabase SQL (needs DATABASE_URL in .env.local). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql-migration.mjs supabase/migrations/029_….sql");
  process.exit(1);
}

async function loadEnv() {
  const { loadEnvLocal } = await import("./load-env.mjs");
  loadEnvLocal(path.join(__dirname, ".."));
}

async function main() {
  await loadEnv();
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error(
      "Add DATABASE_URL (Supabase → Settings → Database → connection string) to .env.local, or paste migration in SQL editor."
    );
    process.exit(1);
  }
  const sql = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const pg = await import("pg");
  const client = new pg.default.Client({ connectionString: dbUrl });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Applied", file);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
