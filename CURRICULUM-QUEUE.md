# Curriculum queue

## Done (full pipeline)

| Track | Lessons |
|-------|---------|
| SAT Math (`sat-math`) | 423 |
| SAT Reading (`sat-reading`) | 301 |
| ACT Math (`act-math`) | 272 |
| ACT English & Reading (`act-english`) | 255 |
| ACT Science (`act-science`) | 87 |
| AP Biology (`ap-bio`) | 135 |
| AP Chemistry (`ap-chem`) | 128 |
| AP Calculus AB (`ap-calc-ab`) | ~135 |
| AP Physics 1 (`ap-physics-1`) | 151 |
| AP Physics 2 (`ap-physics-2`) | ~167 |
| AP Physics C (`ap-physics-c`) | ~176 |
| AP Statistics (`ap-stats`) | 128 |
| College Calculus I (`college-calc-1`) | 31 |

## Downloads status

**Classified:** all prep books in Downloads folder.

**Intentionally skipped (5):** `index.pdf`, `indexeng.pdf`, `indexkr.pdf`, Korean business-registration docs.

## Ingest policy

- Legacy SAT Subject Test, classroom guides, and scanned PDFs are **included** (auto-convert/OCR via `prepare-downloads.mjs`).
- Drop `.azw3` / `.fb2` / `.mobi` in Downloads — we convert to `.converted.epub` before ingest.
- Full ACT prep books route to math + english + science.
- Combined SAT/ACT books route to both tracks.

## Still to do

1. **Commit & push** — `act-english`, `college-calc-1` track wiring + classifier updates are local only; Vercel won't show new courses until pushed to `main`.
2. **ACT Science** — thinnest course (87 lessons); drop ACT Science-only books if you have them.
3. **Optional** — delete junk `index*.pdf` and `정부24` files from Downloads.
