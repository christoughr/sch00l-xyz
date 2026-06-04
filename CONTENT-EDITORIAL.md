# Editorial pass — publisher lessons

Polish scripts fix **structure** (units, `Lesson N` titles, boilerplate). Students still need **real lesson prose**.

## Priority order

1. **AP Biology** — highest traffic; start with units 1–2 publisher lessons.
2. **AP Chemistry** — same pattern.
3. **SAT Math** — shorter publisher set (32 drafts).
4. **AP Calc AB** — after ingest.

## Per-lesson checklist

- [ ] Replace “extract” blocks with original explanations (or licensed rewrite you own).
- [ ] Add 2–3 worked examples where the PDF only had bullets.
- [ ] Objectives match what the body actually teaches.
- [ ] No publisher branding (Barron’s, Princeton, “Set 3”, page refs).
- [ ] Tutor prompt: “ask for practice, not answer keys” — already in Key ideas section.

## Find lessons needing work

```bash
npx tsx scripts/audit-lesson-quality.ts
npx tsx scripts/audit-lesson-quality.ts --track ap-bio --json
```

Flags: short body, extract markers, old title patterns, publisher source lines.

## Workflow

1. Export flagged lesson IDs from audit.
2. Edit `body_markdown` in Supabase (or a future admin UI).
3. Keep `review_status = published` when ready.
4. Re-run audit until the track is clean.

Do **not** re-run polish after manual edits unless you re-ingested drafts (polish overwrites unit/title/body for publisher rows).
