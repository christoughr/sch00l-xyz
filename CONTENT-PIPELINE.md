# Content pipeline — per subject

Same steps for each track. **Paste 3 is per subject** (publish only that track's drafts).

| Step | What |
|------|------|
| **0** | `017_course_lessons.sql` (once) |
| **1** | Seed SQL — 15 original lessons (`018` ap-bio, `021` ap-chem, `022` sat-math, `024` ap-calc-ab) |
| **2** | `node scripts/ingest-licensed-pdf.mjs --track <id>` → `drafts.sql` |
| **3** | Paste 2 in Supabase SQL Editor |
| **4** | Paste 3 — `update ... set review_status = 'published' where ord >= 100` for that `track_id` |
| **5** | Polish — **terminal only**: `npx tsx scripts/polish-<track>-lessons.ts` |
| **6** | Deploy — push `main`; Vercel auto-deploys |

## Live courses (polished)

| Track | Seed | Polish script | Lessons (approx.) |
|-------|------|---------------|-------------------|
| `ap-bio` | `018` | `polish-ap-bio-lessons.ts` | 111 |
| `ap-chem` | `021` | `polish-ap-chem-lessons.ts` | 119 |
| `sat-math` | `022` | `polish-sat-math-lessons.ts` | 47 (+ publisher) |
| `sat-reading` | — | Uses `sat-math` course (unit 3 = R&W) | alias only |

## Ready to ingest (seed only)

| Track | Seed | Polish script |
|-------|------|---------------|
| `ap-calc-ab` | `024_seed_ap_calc_ab_course.sql` | `polish-ap-calc-ab-lessons.ts` |

After you add licensed PDFs: ingest → Paste 3 → polish.

## Editorial (human)

Polish does **not** replace full lesson writing. See [CONTENT-EDITORIAL.md](./CONTENT-EDITORIAL.md) and run:

`npx tsx scripts/audit-lesson-quality.ts`

## Study flow

`/study` → pick track → **Course lessons** → read → AI tutor + quizzes + practice.
