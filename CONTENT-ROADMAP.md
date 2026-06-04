# Content roadmap (separate from product engineering)

## Honest scope

**Shipped in the app today**

- Structure + AI tutor + quizzes + practice for **all study tracks**
- **Original MCQ banks** for major practice exams (bundled in `src/lib/practice-catalog.ts` + SQL seeds)
- **AP Bio** pilot with real unit sections and questions
- Everything else: **AI-generated**, topic-specific session content

**Not in this repo (content project)**

- Hundreds of Khan Academy–style lessons per course
- Official SAT/AP/A-Level past papers (licensed)
- Scraping textbooks from Sci-Hub, LibGen, Z-Library, Anna's Archive, etc. — **we do not do this** (copyright + ToS + student safety)

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
