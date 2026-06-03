# Full PR scope — sch00l.ai #1 in academia

**Rule:** Each PR is shippable alone. Run SQL migrations in order. Parent issue per epic.

**You are not wrong:** Teachers never need study minutes for the checklist. Minutes are **student** activity only (we now exclude teacher accounts from roster stats).

---

## Epic A — Teacher LMS core (Canvas / Classroom killer)

| PR | Title | Deliverables |
|----|--------|--------------|
| A1 | **Assignments schema** | `008_assignments_materials.sql` (done in repo — run in Supabase) |
| A2 | **Assign study track** | API + dashboard UI: pick track, due date, whole class or selected students |
| A3 | **Student assignment home** | `/join` or `/home` shows “Your assignments” with deep link to Study |
| A4 | **Per-student progress on assignment** | Dashboard: % complete, minutes, lift per student per assignment |
| A5 | **Upload materials** | ✅ Drag-drop + Storage `classroom-materials` |
| A6 | **Material → AI context** | ✅ Tutor gets classroom material excerpts |
| A7 | **Manual gradebook column** | ✅ Score + notes per student (first assignment) |
| A8 | **Google Classroom import** | ✅ CSV roster import + invite copy |
| A9 | **Canvas LTI / Common Cartridge** | ✅ CSV + basic CC XML parse (full LTI later) |
| A10 | **Announcements stream** | Teacher posts; students see pinned on class home |
| A11 | **Calendar + due dates** | iCal export, email reminders (Resend) |

---

## Epic B — Live engagement (Kahoot / Gimkit / Blooket)

| PR | Title | Deliverables |
|----|--------|--------------|
| B1 | **Live session room** | Teacher starts “Battle”; 6-digit room code |
| B2 | **Real-time lobby** | Supabase Realtime or Pusher: students join with name |
| B3 | **Question deck from unit** | 10 questions from assigned track or upload |
| B4 | **Scoring + leaderboard** | Points for speed + correctness; anti-cheat basic |
| B5 | **Lift tie-in** | Post-battle optional 3-question lift check |
| B6 | **Homework mode** | Async Kahoot-style quiz due by date |

---

## Epic C — Forums (Piazza / Schoology / Discord replacement)

| PR | Title | Deliverables |
|----|--------|--------------|
| C1 | **Threads schema** | `classroom_threads`, `posts`, `reactions`; RLS per class |
| C2 | **Student forum UI** | Per-class + per-unit boards; markdown posts |
| C3 | **Teacher forum UI** | Moderation queue, pin, lock, delete |
| C4 | **Teacher lounge** | Cross-class private board for pilot teachers |
| C5 | **AI moderation** | Flag toxicity, academic dishonesty patterns |
| C6 | **@mentions + email digest** | Resend notify on reply |

---

## Epic D — Document / answer economy (Course Hero / Chegg / Studocu)

| PR | Title | Deliverables |
|----|--------|--------------|
| D1 | **Document library** | Upload, OCR text extract, search by course |
| D2 | **Socratic doc Q&A** | Ask about *your* upload — hints not full paste |
| D3 | **Peer notes (licensed)** | Students share notes; teacher approves |
| D4 | **Plagiarism guard** | Compare submissions to library + web (API) |
| D5 | **Institution copyright mode** | DMCA workflow, school admin role |

*Positioning:* Same convenience as Chegg/Course Hero but **teacher-controlled** + no blind copy-paste.

---

## Epic E — Test prep moat (1600.io / Magoosh / UWorld / Kaplan / 7Sage / RV)

| PR | Title | Deliverables |
|----|--------|--------------|
| E1 | **Timed practice test engine** | SAT/ACT/AP sections, clock, break rules |
| E2 | **Score report + weak areas** | Route to study tracks from misses |
| E3 | **Question item bank tables** | Per-exam tagged items; teacher can add |
| E4 | **Full-length sims** | MCAT, LSAT, GMAT, GRE, NCLEX, IB |
| E5 | **Bluebook-style UI** | SAT digital practice shell |
| E6 | **Official partnership slot** | License real retired tests when ready |

---

## Epic F — AI study loop (existing product — extend)

| PR | Title | Deliverables |
|----|--------|--------------|
| F1 | **Assign → default track** | Student opens assignment → pre-selected track |
| F2 | **Section-level assign** | ✅ Unit sections per track on assign form |
| F3 | **Class-wide lift dashboard** | Chart over 2-week unit |
| F4 | **Parent read-only portal** | Minutes + lift only |

---

## Epic G — Admin / scale / enterprise

| PR | Title | Deliverables |
|----|--------|--------------|
| G1 | **School org + SSO** | Google/Microsoft SAML |
| G2 | **FERPA/COPPA mode** | Age gate, data retention policies |
| G3 | **Billing per seat** | Lemon Squeezy / Stripe school plan |
| G4 | **Audit log** | Who exported what roster data |

---

## Epic H — Growth / integrations

| PR | Title | Deliverables |
|----|--------|--------------|
| H1 | **Public outcomes v2** | Anonymized aggregate by subject |
| H2 | **Discord bot v2** | Class sync, battle notifications |
| H3 | **Mobile PWA polish** | Offline cards, push |
| H4 | **Marketplace templates** | Teachers sell unit packs |

---

## Build order (parallel tracks)

```
Week 1–2:  A1→A4, B1→B3, C1→C2
Week 3–4:  A5→A7, B4→B6, C3→C5, E1→E2
Week 5–8:  D1→D3, E3→E5, A8, G1
Ongoing:   E6, D4→D5, H*, G2→G4
```

---

## Not shown to teachers/students (dev-only)

- `SUPABASE_AUTH.md`, `TEACHER_EMAILS`, migration numbers, SMTP paths
- Shown only when Supabase is down or login fails (support path)

---

## SQL you need to run now

```text
008_assignments_materials.sql
```

Then deploy; **PR A2** UI lands in app after deploy.
