# Digital SAT — licensed source ingest

```bash
node scripts/ingest-licensed-pdf.mjs --track sat-math --dir ./content/ingest/sat-math
```

SQL order: `017` → `022_seed_sat_math_course.sql` → `out/drafts.sql` → `021_publish_sat_math_lessons.sql` → polish (TBD).
