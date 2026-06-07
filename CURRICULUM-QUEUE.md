# Curriculum queue

## Done (full pipeline)

| Track | Lessons |
|-------|---------|
| SAT Math (`sat-math`) | 423 |
| SAT Reading (`sat-reading`) | 301 |
| ACT Math (`act-math`) | 272 |
| ACT English & Reading (`act-english`) | 255 |
| ACT Science (`act-science`) | 93 |
| AP Biology (`ap-bio`) | 135 |
| AP Chemistry (`ap-chem`) | 128 |
| AP Calculus AB (`ap-calc-ab`) | ~135 |
| AP Physics 1 (`ap-physics-1`) | 151 |
| AP Physics 2 (`ap-physics-2`) | ~167 |
| AP Physics C (`ap-physics-c`) | ~176 |
| AP Statistics (`ap-stats`) | 128 |
| College Calculus I (`college-calc-1`) | 31 |
| College Calculus II (`college-calc-2`) | 23 |

## Downloads status

All prep books classified. Five unrelated files (index pages, business registration docs) are intentionally excluded from routing.

## Ingest policy

- Legacy SAT Subject Test, classroom guides, and scanned PDFs are **included** (auto-convert/OCR via `prepare-downloads.mjs`).
- Drop `.azw3` / `.fb2` / `.mobi` in Downloads — we convert to `.converted.epub` before ingest.
- Full ACT prep books route to math + english + science.
- Combined SAT/ACT books route to both tracks.
- `Calculus All-In-One for Dummies` routes to Calc I + Calc II.

## Next courses to build

| Priority | Track | Notes |
|----------|-------|-------|
| 1 | ACT Science | Thinnest exam track — add science-only prep books when available |
| 2 | College Physics I | Stub exists in `study-tracks-college.ts`; needs seed + pipeline |
| 3 | College Gen Chem I | Stub exists; AP chem books partially overlap |
| 4 | AP Calc AB refresh | Many calc AB books in Downloads not yet re-ingested |
