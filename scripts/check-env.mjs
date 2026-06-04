#!/usr/bin/env node
/** Pre-deploy env check — run: npm run check:env  |  Local-only: npm run check:env -- --local */

const localMode = process.argv.includes("--local");

const productionRequired = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
  "INTEGRATION_TOKEN_KEY",
];

const recommended = [
  "OPENAI_API_KEY",
  "GROQ_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_MODEL",
  "TEACHER_EMAILS",
  "SCH00L_API_KEY",
  "LEMONSQUEEZY_API_KEY",
  "FOUNDER_WEBHOOK_URL",
];

let ok = true;

console.log("\n sch00l.ai — environment check\n");

if (localMode) {
  console.log("  Mode: local-first (no Supabase required)\n");
  console.log(
    process.env.OPENAI_API_KEY
      ? "  ✓ OPENAI_API_KEY — live AI tutor/quiz"
      : "  ○ OPENAI_API_KEY — demo AI mode (still fully usable)"
  );
  console.log(
    process.env.NEXT_PUBLIC_APP_URL
      ? `  ✓ NEXT_PUBLIC_APP_URL`
      : "  ○ NEXT_PUBLIC_APP_URL (defaults to sch00l.ai in code)"
  );
  console.log("\n  Site runs without Supabase/Lemon/Discord. See LOCAL-FIRST.md\n");
  process.exit(0);
}

for (const key of productionRequired) {
  if (!process.env[key]) {
    console.log(`  ✗ ${key} (required for full cloud production)`);
    ok = false;
  } else if (key === "INTEGRATION_TOKEN_KEY" && process.env[key].length < 32) {
    console.log(`  ✗ ${key} (must be at least 32 characters)`);
    ok = false;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

console.log("");
for (const key of recommended) {
  console.log(
    process.env[key] ? `  ✓ ${key}` : `  ○ ${key} (optional / when ready)`
  );
}

console.log(
  ok
    ? "\n  Ready for full production deploy.\n"
    : "\n  For local beta without Supabase: npm run check:env -- --local\n     See LOCAL-FIRST.md and STARRED.md\n"
);

process.exit(ok ? 0 : 1);
