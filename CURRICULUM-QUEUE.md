# Curriculum queue — one course at a time

## Done (full pipeline)

| Track | Lessons |
|-------|---------|
| **AP Biology** (`ap-bio`) | ~111 |
| **AP Chemistry** (`ap-chem`) | ~119 |
| **SAT Math** (`sat-math`) | ~47 |
| **AP Calculus AB** (`ap-calc-ab`) | ~135 |
| **AP Physics 1** (`ap-physics-1`) | ~119 |
| **AP Physics 2** (`ap-physics-2`) | ~151 |
| **AP Physics C** (`ap-physics-c`) | ~176 |

## Next (needs PDFs in Downloads)

| Priority | Track | Notes |
|----------|-------|-------|
| 1 | **AP Statistics** (`ap-stats`) | No stats books in Downloads yet |
| 2 | **ACT Math** (`act-math`) | No ACT prep books in Downloads yet |
| 3 | **Calculus I** (`college-calc-1`) | First college full-course target |

Each new track needs: seed SQL → `node scripts/seed-*.mjs` → ingest `--apply` → publish → polish (copy from `ap-physics-2` template).
