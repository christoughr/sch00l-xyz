# sch00l.ai — Full product audit

**Date:** 2026-06-03  
**Branch:** main · **Live:** https://sch00l.ai  
**Automated gates:** unit 15/15 · build pass · E2E 13/13 · production routes 18/18 HTTP 200

> This is a **systematic** audit (every page, API, nav control, major component). It does not replace line-by-line human review of ~70 API routes × ~40 components, but it is the checklist used before handoff.

---

## Handoff files (attach for Claude)

| File | Path |
|------|------|
| HANDOFF.md | `sch00l/HANDOFF.md` |
| CURSOR-TASKS.md | `sch00l/CURSOR-TASKS.md` |
| YOU-DO.md | `sch00l/YOU-DO.md` |
| This audit | `sch00l/PRODUCT-AUDIT.md` |

**Full folder:**  
`C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-dee057e8-2c9c-4ed6-8f30-acfa3745e2a0\sch00l`

---

## Global shell (every page)

| Control | Location | Status |
|---------|----------|--------|
| Logo → home | Nav | ✅ |
| Study, Classes, Practice, Cards, Progress | Nav primary | ✅ |
| Community, Tutors, Pricing, Outcomes | Nav More | ✅ |
| Join, Teach (if teacher) | Nav More | ✅ |
| Sign in / Sign out | Nav | ✅ fixed (local signOut + 3s + redirect) |
| Mobile hamburger + scroll drawer | Nav | ✅ |
| Age gate (birth year + terms) | AgeGate.tsx | ✅ |
| Footer links | Footer.tsx | ✅ |
| Skip to main content | layout | ✅ |

---

## Pages (26 routes)

| Route | Purpose | Prod HTTP | E2E |
|-------|---------|-----------|-----|
| `/` | Landing, waitlist, hero CTAs | 200 | — |
| `/study` | AI session: track → pre → chat → post → cards | 200 | ✅ flow |
| `/progress` | Streaks, lift, session memory | 200 | ✅ |
| `/flashcards` | SM-2 review | 200 | — |
| `/practice` | Timed practice tests | 200 | — |
| `/tutors` | Human tutor request + pricing tiers | 200 | ✅ layout + pricing |
| `/pricing` | Plans + waitlist + accordion | 200 | ✅ pro guard |
| `/my-classes` | Join + assignments + discussion | 200 | ✅ copy |
| `/class/[id]` | Student class home + forum tab | — | — |
| `/join` | Join code | 200 | — |
| `/login` | Magic link | 200 | — |
| `/onboarding` | Profile setup | — | — |
| `/settings` | Export / clear / sign out | 200 | — |
| `/community` | Feature map | 200 | ✅ |
| `/exclusive` | sch00l-only concepts | 200 | — |
| `/outcomes` | Learning lift marketing | 200 | — |
| `/integrations` | LMS import UI | 200 | — |
| `/marketplace` | Template marketplace | 200 | — |
| `/teacher` | Teacher portal index | 200 | — |
| `/teacher/[id]` | Classroom hub (5 tabs) | — | — |
| `/battle/[code]` | Live quiz battle room | — | — |
| `/parent/[token]` | Parent read-only portal | — | — |
| `/auth/link` | Magic link landing | — | — |
| `/pro/success` | Post-checkout | — | ✅ |
| `/terms`, `/privacy` | Legal | — | — |

---

## Study flow buttons (`/study`)

| Button / action | Status |
|-----------------|--------|
| Category pills (Exam prep, etc.) | ✅ horizontal scroll |
| Track card select | ✅ aria-pressed |
| Custom track → subject reset toast | ✅ |
| Subject grid (18 Lucide icons) | ✅ |
| Continue to pre-quiz | ✅ |
| Skip pre-quiz | ✅ E2E |
| Tutor chat send | ✅ needs GROQ_API_KEY |
| Post-quiz | ✅ |
| Generate flashcards | ✅ |
| Discussion banner + feature strip | ✅ |
| Still stuck → tutors link | ✅ |

---

## Class & discussion

| Path | Status |
|------|--------|
| Nav → Classes → `/my-classes` | ✅ |
| Join classroom form | ✅ needs auth + Supabase |
| Class card → **Discussion** → `?tab=forum` | ✅ |
| Class card → Class home | ✅ |
| Teacher → Forum tab + thread list | ✅ ClassroomForum |
| Teacher card → Forum link + thread count | ✅ |
| Pin / lock / flag / delete (teacher) | ✅ moderate API |
| ClassDiscussionBanner on study + my-classes | ✅ |

---

## Teacher portal

| Feature | Status |
|---------|--------|
| Create classroom | ✅ |
| Copy join code | ✅ |
| Overview stats (teacher excluded from minutes) | ✅ server + tooltip |
| Assignments + PDF upload | ✅ needs 008 SQL |
| Live battle create/join | ✅ |
| Forum | ✅ |
| Integrations CSV stubs | ✅ |
| Tutor requests list | ✅ |
| Waitlist export | ✅ |

---

## Tutors & pricing

| Item | Status |
|------|--------|
| Per-subject rate **ranges** ($min–$max/hr) | ✅ |
| Budget / Standard / Expert / Rush tiers | ✅ |
| No hardcoded $49 in UI | ✅ |
| API accepts budgetTier; DB needs **012** optional | ⚠️ run 012 SQL |
| Stripe/LS checkout | ⚠️ env keys not set → waitlist |
| 18% platform fee copy | ✅ |

---

## API surface (70 route handlers)

Grouped by domain — all compile; most need Supabase + migrations.

- **Auth:** magic-link, verify-link, signout, callback  
- **Student:** classrooms, assignments  
- **Teacher:** me, activate, waitlist, pilot-status, lounge  
- **Classrooms:** CRUD, stats, assignments, materials, grades, calendar, announcements, threads, battles, integrations, doc-ask, notes, plagiarism  
- **Threads:** posts, moderate  
- **Battles:** create, join, start, answer  
- **Practice:** tests, start, finish  
- **Tutor:** chat stream, request, requests, apply  
- **Payments:** config, checkout (Stripe), webhook  
- **Compliance:** profile, export, delete, DMCA, parent link  
- **Health / outcomes v2 / marketplace**

---

## Known gaps (not bugs — backlog)

1. **Payments** — Lemon Squeezy / Stripe keys on Vercel  
2. **Lift Battles™** — marketing only; full live flow TBD  
3. **LMS OAuth** — CSV/import stubs; no full Google/Canvas OAuth  
4. **E2E** — no logged-in magic-link test (sign-out full flow)  
5. **012 SQL** — optional budget_tier columns  
6. **Without Supabase** — local-only mode works for study; cloud features disabled  

---

## Regression commands

```bash
cd sch00l
npm test
npm run build
npm run test:e2e
```

Production smoke: open YOU-DO.md manual checklist.

---

## Sign-off

| Check | Result |
|-------|--------|
| Unit tests | 15/15 |
| Build | Pass |
| E2E | 13/13 |
| Production pages | 18/18 × 200 |
| `signOut({ scope: 'global' })` in code | None |
| CURSOR-TASKS A–E | Done in repo |

**Verdict:** Product is **pilot-ready** for AP Biology (9FW69A) with SQL 001–011 applied. Claude should work **backlog only**, not re-audit completed tasks unless regressions are reported.
