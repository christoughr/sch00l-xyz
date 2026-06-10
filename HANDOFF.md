# sch00l.ai — Project handoff & status

**Live:** https://sch00l.ai  
**Repo:** https://github.com/christoughr/sch00l-xyz  
**Deploy:** Vercel (auto on push to `main`)

---

## What we built

| Area | Status |
|------|--------|
| **307+ study tracks** | AP, SAT/ACT, MCAT, GED, homeschool, OSSD (24 courses), US HS diploma, 60+ college, international exams, professional certs |
| **Publisher lessons** | 6,000+ ingested from PDFs in Downloads; LLM paraphrase + quiz bank |
| **Study Notebook** | `/notebook` — NotebookLM-style summarize / outline / Q&A / quiz |
| **Pricing** | Premium tier — membership $79/mo + library subscriptions; bundle $449/mo |
| **Paywall** | All lesson content gated — membership + curriculum subscription required (0 free previews) |
| **Content shield** | Copy/print/context-menu blocked on study pages; overlay on tab blur / PrintScreen |
| **Payments** | Lemon Squeezy webhooks → `user_entitlements` table |

---

## Database

**Provider:** [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage)

| Item | Detail |
|------|--------|
| **Plan** | Likely **Free tier** unless upgraded — check Supabase dashboard → Settings → Billing |
| **Free limits** | 500 MB database, 1 GB file storage, 50K MAU |
| **Our usage** | Lesson text in `course_lessons.body_markdown` (~6K rows). Estimate **50–200 MB** today depending on paraphrase length |
| **Headroom** | Fine for now. At **50K+ lessons**, upgrade to **Pro ($25/mo)** for 8 GB DB |
| **PDFs** | Not stored in Supabase — only extracted/paraphrased text. Original PDFs stay local in `content/ingest/` |

**Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `DATABASE_URL` for scripts.

---

## Content pipeline

```bash
node scripts/prep-watch.mjs --once          # status
node scripts/run-track-pipeline.mjs <track> --skip-seed --skip-quiz --skip-rewrite
npx tsx scripts/rewrite-publisher-lessons.ts <track> --limit 500 --concurrency 5
npx tsx scripts/generate-lesson-quizzes.ts <track> --limit 500
```

Drop PDFs in **`C:\Users\Administrator\Downloads`** — classifier routes automatically.

---

## Recent deploys (git)

| Commit | Summary |
|--------|---------|
| `ca269db` | 300+ tracks (OSSD, US HS, AP, certs, college) |
| `40b9ccb` | Sweet-spot pricing, Study Notebook, science ingest |
| `ee61e60` | K math classifier, prep-watch dashboard |

---

## Weak tracks (need more PDFs)

### OSSD — you dropped Nelson math/science; still thin on:

| Track | Get this book |
|-------|---------------|
| **ENG1D–ENG4U** | *Crossroads* or *Imprints* (Nelson English 9–12) |
| **CHC2D Canadian History** | *Counterpoints* Pearson ISBN **9780133256928** OR *Creating Canada* ISBN **9780132413667** |
| **CHV2O Civics** | *Civics and Citizenship* Nelson ISBN **9780176530154** |
| **CLN4U Law** | *Introduction to Canadian Law* Nelson |
| **SNC1D Science 9** | Nelson *Science & Technology 9* ISBN **9780176355288** |

### US HS — ingesting from your drop today:

| Track | Your files |
|-------|-------------|
| World History | McDougal *Patterns of Interaction* ✅ |
| English | Prentice Hall Literature ✅ |
| Physics | Giancoli + Hewitt Conceptual ✅ |
| Chemistry | Holt *Modern Chemistry* ✅ (NOT Pearson AU) |
| Biology | Miller & Levine ✅ |
| US History | Pearson *United States History* + *The Americans* ✅ |
| Civics | Magruder's ✅ |
| Math | Big Ideas + Saxon ✅ |

---

## Video classrooms (Zoom / Meet)

`/classroom` page added — embed links for tutors/teachers. Full API integration (auto-create meetings, roster sync) needs Zoom OAuth app or Google Workspace — not wired yet.

---

## Pricing (current)

| Plan | Monthly |
|------|---------|
| Membership (required) | $79 |
| K–12 library | $99 |
| International (OSSD) | $109 |
| All-in-one bundle | $449 |
| Family (4 seats) | $199 |

No free trial. No refunds. Lessons locked until Lemon Squeezy webhook confirms payment.

---

## Honest note on screenshot blocking

Web apps **cannot** fully block OS screenshots, phone cameras, or external monitors (Netflix uses HDCP on native apps, not browsers). We implement best-effort deterrence: no copy, no print, blur overlay on capture signals, terms of service enforcement.
