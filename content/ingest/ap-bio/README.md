# AP Biology — licensed source ingest

Copy your **publisher-approved** PDFs here (Barron's, Princeton Review, Kaplan, etc.).

```bash
node scripts/ingest-licensed-pdf.mjs --track ap-bio --dir ./content/ingest/ap-bio
```

Output: `content/ingest/ap-bio/out/drafts.sql` — run in Supabase **after** `017` + `018`, then editorial review → `review_status = published`.

EPUB and PDF supported. MOBI: convert to EPUB/PDF first (Calibre).

```bash
# Copy from Windows Downloads + ingest
node scripts/ingest-licensed-pdf.mjs --track ap-bio --from-downloads
```
