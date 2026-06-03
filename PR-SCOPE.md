# Full PR scope — Epics A–H (implementation status)

Run SQL: see [RUN_ALL_SQL.md](./RUN_ALL_SQL.md)

**Study tracks:** 56 US + **71 global** (IGCSE, A-Level, JEE, NEET, Gaokao, HSC, GCSE, professional exams, etc.) = **127+ tracks**

---

## Epic A — Teacher LMS ✅

| PR | Status |
|----|--------|
| A1–A9 | ✅ Schema, assign, uploads, auto-assign, gradebook, imports |
| A3 | ✅ Student assignments on `/join`, `/class/[id]` |
| A4 | ✅ `/api/classrooms/[id]/assignments/progress` |
| A10 | ✅ Announcements |
| A11 | ✅ iCal `/api/classrooms/[id]/calendar` |

## Epic B — Live battles ✅

| PR | Status |
|----|--------|
| B1–B6 | ✅ `/battle/[code]`, lobby, questions, leaderboard, homework mode |

## Epic C — Forums ✅

| PR | Status |
|----|--------|
| C1–C6 | ✅ Threads, posts, moderation, teacher lounge, AI mod |

## Epic D — Documents ✅

| PR | Status |
|----|--------|
| D1–D2 | ✅ Materials library + `/doc-ask` Socratic Q&A |
| D3 | ✅ Peer notes + teacher approve |
| D4 | ✅ Plagiarism heuristic check |
| D5 | ✅ DMCA report endpoint |

## Epic E — Test prep ✅

| PR | Status |
|----|--------|
| E1–E5 | ✅ `/practice` timed tests, 15 exam families, weak tags |
| E6 | Slot for licensed official items |

## Epic F — AI loop ✅

| PR | Status |
|----|--------|
| F1 | ✅ Study `?track=` deep link |
| F2 | ✅ Section-level assign |
| F3 | ✅ Class lift chart on dashboard |
| F4 | ✅ Parent portal `/parent/[token]` |

## Epic G — Enterprise ✅

| PR | Status |
|----|--------|
| G1 | ✅ `school_orgs` + integrations hub |
| G2 | ✅ `user_compliance` + `/api/compliance` |
| G3 | Stripe/LS existing |
| G4 | ✅ `audit_log` |

## Epic H — Growth ✅

| PR | Status |
|----|--------|
| H1 | ✅ `/api/outcomes/v2` |
| H2 | Discord existing + class hooks via integrations |
| H3 | ✅ PWA `manifest.json` |
| H4 | ✅ `/marketplace` templates |

## Platform integrations ✅

Google Classroom, Canvas, Schoology, Microsoft Teams, Blackboard, Moodle, Clever, ClassDojo, Remind, Edmodo, Infinite Campus — connect + CSV sync on class **Integrations** tab.

---

## Teacher UI

`/teacher/[id]` → tabs: **Overview | Assign | Live battle | Forum | Integrations**

## Student UI

`/join` · `/class/[id]` · `/study?track=` · `/battle/[code]` · `/practice`
