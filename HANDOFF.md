# sch00l.ai — Handoff for Claude / next agent

**Production:** https://sch00l.ai  
**Repo:** https://github.com/christoughr/sch00l-xyz  
**Stack:** Next.js 16, Supabase, Vercel, Groq AI, Resend magic links

## Pilot credentials

| Role | Email | Notes |
|------|-------|-------|
| Teacher | `hello@sch00l.ai` | Magic link → `/teacher` |
| Classroom | AP Biology Period 2 | Join code **9FW69A** |

Teachers are excluded from roster “study minutes” stats (`src/lib/classroom-roster.ts`).

## SQL (user has run 001–011)

No further migrations required unless adding columns. See `RUN_ALL_SQL.md`.

- **008** assignments, materials  
- **009** LMS sections, grades, imports  
- **010** forums, battles, practice tests, integrations, marketplace (run with “Run without RLS” in Supabase UI)  
- **011** practice_tests public read  

## Feature map (where things live)

| Feature | Student | Teacher |
|---------|---------|---------|
| **Discussion** | Nav **Classes** → `/my-classes` → class → Discussion → `/class/{id}?tab=forum` | `/teacher` → class hub → **Forum** tab |
| **Live battles** | `/my-classes` or `/class/{id}` | Classroom hub → **Live battle** |
| **Practice tests** | `/practice` | — |
| **Assignments** | `/my-classes` | Classroom hub → **Assign** |
| **LMS import** | — | **Integrations** tab |
| **Human tutors** | `/tutors` (market rates, budget tiers) | — |
| **Learning lift** | `/progress`, `/outcomes` | Teacher dashboard charts |
| **Exclusive concepts** | `/exclusive` | — |
| **Feature directory** | `/community` | — |

## Recent fixes (this deploy)

1. **Logout** — Client `signOut({ scope: 'global' })` + `POST /api/auth/signout` clears SSR cookies; redirect to `/`.
2. **Nav** — “Classes” in primary nav; visible “Sign out” label (desktop + mobile + Settings).
3. **Study UX** — `ClassDiscussionBanner` + `StudyFeatureStrip` on `/study`.
4. **Tutor UI** — Full-width subject grid; dynamic pricing (`src/lib/tutor-pricing.ts`, 18% fee).
5. **E2E** — Playwright on port **3099** (avoids wrong app on :3000); 10 tests.

## Test commands

```bash
npm test              # unit (node:test)
npm run build
npm run test:e2e      # local server on :3099
```

Production E2E (optional): `PLAYWRIGHT_BASE_URL=https://sch00l.ai npm run test:e2e` (no webServer).

## Env (Vercel)

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `TEACHER_EMAILS`, `NEXT_PUBLIC_SITE_URL=https://sch00l.ai`

## Known gaps / backlog

- Full OAuth per LMS (stubs + CSV import exist)
- Lemon Squeezy checkout wiring
- `budgetTier` on `tutor_requests` DB column (API accepts; optional migration)
- Lift Battles™ full live flow (marketing on `/exclusive`)

## Key files

- Auth: `src/components/AuthProvider.tsx`, `src/app/api/auth/signout/route.ts`
- Teacher: `src/app/teacher/`, `ClassroomHub.tsx`
- Student classes: `src/app/my-classes/`, `src/app/api/student/classrooms/`
- Tracks: `src/lib/study-tracks.ts`, `study-tracks-global.ts`
- SQL: `supabase/migrations/`
- E2E: `e2e/`, `playwright.config.ts`

## Competitor positioning

See `COMPETITORS.md`, `PR-SCOPE.md`.
