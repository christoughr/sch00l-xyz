# sch00l.xyz

**AI for students who study** — full stack ready for launch.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Docs

| Doc | Purpose |
|-----|---------|
| [DEPLOY.md](./DEPLOY.md) | Vercel + Supabase + DNS |
| [LAUNCH.md](./LAUNCH.md) | Day-one checklist |
| `.env.example` | All env vars |

## Supabase migrations (run in order)

1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_classrooms.sql`
3. `supabase/migrations/003_compliance.sql`

## Product

| Area | Routes |
|------|--------|
| Student | `/study`, `/flashcards`, `/progress`, `/join` |
| Auth | `/login`, `/onboarding` |
| Teacher | `/teacher`, `/teacher/[id]` |
| Legal | `/privacy`, `/terms`, `/settings` |
| B2B API | `/api/v1/classroom/[id]/summary`, `/api/v1/student/[id]/mastery` |

## Features

- Socratic AI tutor (Groq/OpenAI)
- Pre/post quizzes → learning lift metrics
- SM-2 flashcards
- Classroom pilots + teacher dashboard
- COPPA age gate + parental consent
- Data export / account deletion
- `.edu` waitlist priority
- GitHub CI

## Deploy

```bash
npm run check:env   # after filling .env.local
git push origin main   # Vercel auto-deploy
```

See **[LAUNCH.md](./LAUNCH.md)** for the full go-live checklist.
