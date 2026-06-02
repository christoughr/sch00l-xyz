#!/usr/bin/env node
/** Pre-deploy env check — run: npm run check:env */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const recommended = ["OPENAI_API_KEY", "TEACHER_EMAILS", "SCH00L_API_KEY"];

let ok = true;

console.log("\n sch00l.xyz — environment check\n");

for (const key of required) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ✗ ${key} (required for production)`);
    ok = false;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

console.log("");
for (const key of recommended) {
  console.log(
    process.env[key] ? `  ✓ ${key}` : `  ○ ${key} (optional)`
  );
}

console.log(
  ok
    ? "\n  Ready for Vercel deploy.\n"
    : "\n  Copy .env.example → .env.local and fill values. See DEPLOY.md\n"
);

process.exit(ok ? 0 : 1);
