# Curriculum queue

## College tracks live (with pipelines)

| Track | Lessons | Notes |
|-------|---------|-------|
| `college-calc-1` | 31 | Springer Calc I + Dummies |
| `college-calc-2` | 23 | Dummies multivariable chapters |
| `college-calc-3` | 31 | Dummies |
| `college-linear-algebra` | 111 | 12 LA textbooks |
| `college-physics-1` | 135 | AP Physics 1 dual-route |
| `college-physics-2` | 344 | AP Physics 2/C dual-route |
| `college-gen-chem-1` | ~191 | Gen chem + AP chem dual-route |
| `college-gen-chem-2` | ~31 | Delaware State ACP + seed |
| `college-stats-intro` | ~47 | De Veaux / Bock Intro Stats |
| `college-discrete-math` | ~31+ | Gallier, Bender, zyBooks zip |
| `college-org-chem` | 15 seed | **Drop Wade/Bruice/Klein to grow** |
| `college-differential-equations` | 15 seed | **Drop Boyce/Zill to grow** |

## Exam prep (summary)

SAT Math 423 · SAT Reading 301 · ACT Math 272 · ACT English 255 · ACT Science 93 · AP Calc AB 135 · AP Bio 135 · AP Chem 128 · AP Physics 1 151 · AP Physics 2 ~167 · AP Physics C ~176 · AP Stats ~136

## Drop textbooks

See **TEXTBOOK-DROP-LIST.md** for the full prioritized list.

## Ingest notes

- **zyBooks `.zip`**: auto-extracted (HTML inside zip, or embedded PDFs)
- **MOBI**: convert to EPUB/PDF first
- Classifier: `node scripts/classify-downloads.mjs`
- Ingest: `node scripts/run-track-pipeline.mjs <track> [--refresh]`

## Billing (⭐ skipped for now)

- SQL 028 entitlements: **done**
- Lemon Squeezy checkout: **later**
- Content gating: **wired** — activates when `LEMONSQUEEZY_VARIANT_PRO` is set (or `CONTENT_GATING=true`)
