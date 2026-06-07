# AP Calculus AB — licensed source ingest

Copy **publisher-approved** PDFs/EPUBs here (Barron's, Princeton, 5 Steps to a 5, etc.).

## Status

| Step | Status |
|------|--------|
| Seed (`024`) — 15 original lessons | Done (live on sch00l.ai) |
| Paste 2 — publisher drafts | **Waiting for PDFs in this folder** |
| Paste 3 — publish drafts | After Paste 2 |
| Polish — `polish-ap-calc-ab-lessons.ts` | After Paste 3 |

## Commands

```bash
# Copy matching files from Downloads, then ingest:
node scripts/ingest-licensed-pdf.mjs --track ap-calc-ab --from-downloads

# Or if PDFs are already in this folder:
node scripts/ingest-licensed-pdf.mjs --track ap-calc-ab --dir ./content/ingest/ap-calc-ab
```

Output: `content/ingest/ap-calc-ab/out/drafts.sql` → paste in Supabase SQL Editor.

## Paste 3 (publish only ap-calc-ab drafts)

```sql
update public.course_lessons
set review_status = 'published'
where unit_id in (select id from public.course_units where track_id = 'ap-calc-ab')
  and ord >= 100;
```

## Polish (terminal — not SQL Editor)

```bash
npx tsx scripts/polish-ap-calc-ab-lessons.ts
```
