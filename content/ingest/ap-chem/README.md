# AP Chemistry — licensed source ingest

Copy **publisher-approved** PDFs/EPUBs here (Barron's, Princeton, Kaplan, etc.).

## SQL order (Supabase)

1. `017_course_lessons.sql` (once per project)
2. `021_seed_ap_chem_course.sql` — 15 original lessons
3. `node scripts/ingest-licensed-pdf.mjs --track ap-chem --dir ./content/ingest/ap-chem` → `out/drafts.sql`
4. **Paste 3** (publish): `update course_lessons set review_status = 'published' where unit_id in (select id from course_units where track_id = 'ap-chem') and ord >= 100;`
5. `npx tsx scripts/polish-ap-chem-lessons.ts` (after we add polish script — mirror AP Bio)

```bash
node scripts/ingest-licensed-pdf.mjs --track ap-chem --from-downloads
```

MOBI: convert to EPUB/PDF first (Calibre), or extract HTML to `mobi-*` folder like AP Bio.
