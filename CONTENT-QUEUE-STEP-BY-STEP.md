# sch00l content queue — one track at a time

## Live progress

```bash
# Snapshot (quick check)
node scripts/prep-status.mjs

# Live dashboard — elapsed, rate, ETA (refreshes every 60s)
node scripts/prep-watch.mjs

# Faster refresh (every 30s)
node scripts/prep-watch.mjs --interval 30
```

Reset ETA baseline: delete `.prep-watch-state.json` and restart watch.

---

## Per-track recipe (repeat for each subject)

1. **Drop** PDF/EPUB/MOBI into `Downloads`
2. **Classify** (optional check): `node scripts/classify-downloads.mjs`
3. **Ingest** one track:
   ```bash
   node scripts/run-track-pipeline.mjs <track-id> --skip-quiz --skip-rewrite
   ```
   Use `--refresh` to replace old publisher lessons from prior ingests.
4. **Paraphrase** (if bulk rewrite isn't running):
   ```bash
   npx tsx scripts/rewrite-publisher-lessons.ts <track-id> --limit 500 --concurrency 5
   ```
5. **Prep quizzes** (after paraphrase):
   ```bash
   npx tsx scripts/generate-lesson-quizzes.ts <track-id> --limit 500
   ```
6. **Verify**: https://sch00l.ai/study → pick track → open a lesson → prep quiz

---

## Queue order

### Phase A — let bulk jobs finish (in progress)
Current rewrite + exam ingest running. Watch with `prep-watch.mjs`.

### Phase B — K–12 textbooks (biggest gap)
| Step | Track ID | Drop |
|------|----------|------|
| B1 | `k12-k-math` | Go Math K, Eureka Math K |
| B2 | `k12-k-reading` | Phonics / sight-word workbook |
| B3 | `k12-elem-math` | Saxon or Go Math grades 1–5 |
| B4 | `k12-elem-reading` | Journeys / Reading Street |
| B5 | `k12-elem-science` | Science Fusion / FOSS |
| B6 | `k12-ms-math` | Big Ideas Math 6–8 |
| B7 | `k12-ms-science` | Holt / Amplify MS science |
| B8 | `k12-ms-ela` | MS ELA anthology or workbook |

### Phase C — AP (no files yet)
| Step | Track ID | Drop |
|------|----------|------|
| C1 | `ap-psych` | Barron's / Princeton AP Psych |
| C2 | `ap-us-history` | AMSCO or Princeton APUSH |
| C3 | `ap-world` | Princeton / Barron's AP World |
| C4 | `ap-lang` | Princeton AP Lang |
| C5 | `ap-env-sci` | Barron's APES |
| C6 | `ap-human-geo` | Barron's APHG |
| C7 | `ap-cs-a` | Barron's AP CSA |

### Phase D — grad / admissions
| Step | Track ID | Drop |
|------|----------|------|
| D1 | `lsat` | PowerScore Bibles |
| D2 | `nclex-rn` | Saunders NCLEX |
| D3 | `dat` | Kaplan DAT |
| D4 | `oat` | Kaplan OAT |

### Phase E — college depth
| Step | Track ID | Drop |
|------|----------|------|
| E1 | `college-calc-1` | Stewart / OpenStax Calc 1 |
| E2 | `college-calc-2` | OpenStax Calc 2 |
| E3 | `college-physics-1` | OpenStax / Halliday vol 1 |
| E4 | `college-biochemistry` | Lehninger |
| E5 | `college-gen-chem-2` | Tro / OpenStax Chem 2 |
