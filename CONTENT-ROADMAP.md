# Content roadmap (separate from product engineering)

## Honest scope

**Shipped in the app today**

- Structure + AI tutor + quizzes + practice for **all study tracks**
- **Original MCQ banks** for major practice exams (bundled in `src/lib/practice-catalog.ts` + SQL seeds)
- **AP Bio** pilot with real unit sections and questions
- Everything else: **AI-generated**, topic-specific session content

## Khan-style courses (130 tracks × hundreds of lessons)

**Yes — this is the target.** It is done in **waves**, not one deploy:

1. **Schema** — `017_course_lessons.sql` (units + lessons per `track_id`)
2. **Your PDFs** — one per row in `PDF-SOURCES-CHECKLIST.md`
3. **Ingestion** — extract → AI draft lesson + MCQ **from your source** → human review → `published`
4. **UI** — lesson reader in `/study` (next sprint after first 20 PDFs land)

Rough scale: 126 tracks × ~8 units × ~12 lessons ≈ **12,000 lessons**. AI can draft; **you** (or reviewers) approve. We start with AP Bio + your first 10 PDFs as the template pipeline.

## How we grow question banks (legitimate)

1. **Original items** — writers + subject experts; exam-*style*, not copied stems
2. **OER** — OpenStax, CK-12, PhET, government open datasets (with attribution)
3. **Partners** — schools, tutors, publishers with license
4. **AI assist** — draft → human review → bank (never publish unreviewed AP/SAT clones)

## Priority regions / exams (incremental)

| Region | Exams | Status |
|--------|-------|--------|
| US | SAT, ACT, AP, MCAT, LSAT, GMAT, GRE | MCQ banks live |
| Korea | CSAT / Suneung (수능) math & English | Tracks + practice banks added |
| India | JEE, NEET | Banks live |
| UK / intl | IGCSE, A-Level | Banks live |
| China | Gaokao math | Bank live |
| Australia | HSC NSW | Bank live |
| New Zealand | NCEA L1 math | Bank added |
| Germany / France | Abitur, Bac math | Banks added |
| Taiwan, HK, Singapore | GSAT, HKDSE, O-Level | Study tracks live; banks next |

## Your role vs ours

- **You**: syllabi priorities, pilot schools, licensed PDFs you already own, reviewer network
- **Us**: schema, ingestion pipeline, QA tooling, weak-tag → study wiring

## SQL

- `015_study_content.sql` — assignment completions + seed MCQs
- `016_daily_ai_usage.sql` — server-side free session counter (run in Supabase)
