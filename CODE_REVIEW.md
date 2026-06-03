# CODE_REVIEW.md — sch00l.ai

**Review date:** 2026-06-03  
**Reviewer:** Cursor agent (automated audit + fixes in same PR)  
**For:** Second-pass review (e.g. Claude, human)  

---

## Executive summary

sch00l is a Next.js 16 student tutoring app with AI (Groq), local-first progress, optional Supabase, human tutor handoff, and a freemium pricing model. P0 bugs fixed; Stripe checkout + webhook scaffolded (needs Vercel env keys).

---

## Revenue model (maximize platform take)

| Stream | Student pays | sch00l keeps | Status |
|--------|-------------|--------------|--------|
| **Pro** | $14.99/mo | ~100% | Checkout API + webhook — **add Stripe keys** |
| **Human tutor** | $49/hr | **35% (~$17/hr)** | Checkout + request flow — **add Stripe keys** |
| **School B2B** | $9/seat/mo (30 min) | ~100% | Teacher portal — **contracts TODO** |
| **Free AI** | $0 | Loss leader (3 sessions/day) | **Implemented** |

See `src/lib/pricing.ts` and `/pricing`.

---

## P0 bugs — FIXED

### 1. Wrong learning lift pairing
**Was:** `latestQuizLiftLocal()` paired first pre + first post globally → fake lift after skip or new session.  
**Fix:** `sessionId` per study session (`study-session-id.ts`), stored on quiz results, paired by session. Migration `006_quiz_session_id.sql`.

### 2. Double session count in TutorChat
**Was:** `persistSession()` on unmount + End → duplicate streaks/minutes.  
**Fix:** `persistedRef` guard; cleanup no longer persists.

### 3. Mobile nav overflow
**Was:** 8+ links clipped on phone; no sign-out on mobile.  
**Fix:** Hamburger menu + mobile sign-out.

---

## P1 — FIXED or IMPROVED

| Issue | Fix |
|-------|-----|
| Skip pre-quiz silent lift bug | `preSkipped` flag; copy warns "no learning lift" |
| Empty topic allowed | Validation before session start |
| Custom track kept old fields | Resets topic/grade on Custom |
| SessionQuiz API failure | Error state + retry |
| TutorChat dev error message | User-friendly copy |
| Age gate blank flash | Loading spinner |
| Birth year min 1990 | Changed to 1920 |
| Tutor request without email | Email required |
| `/tutors` hardcoded math | Subject picker |
| Settings blocked anonymous | Local clear without login |
| Login auth callback error | Shows message for `?error=auth` |
| Onboarding silent failure | Error display |
| Investor copy on student pages | Replaced with learner copy |
| Flashcard badge stale | `FLASHCARDS_UPDATED` event |

---

## P2 — OPEN (future)

| Item | Recommendation |
|------|----------------|
| **Stripe keys** | Set env vars in Vercel (code shipped) |
| **SubjectPicker a11y** | `aria-pressed` on toggles |
| **TeacherPortal.tsx** | Split `ClassroomStats`; replace `alert()` |
| **Outcomes API** | Rename "unique studiers" → sessions tracked |
| **E2E tests** | Playwright: study flow + lift |
| **Rate limiting** | API routes (tutor, quiz, analytics) |
| **Pro unlock** | Replace `localStorage` hack with Stripe subscription check |

---

## Architecture notes (for Claude)

```
/study flow
  setup → pre quiz [sessionId] → TutorChat → post quiz [sessionId] → done
  → auto flashcards, analytics, optional human tutor request

Monetization funnel
  Free (3/day) → limit hit → /pricing → Pro waitlist OR human tutor $49/hr

Data
  localStorage: progress, quizzes, flashcards, free tier count
  Supabase (optional): sync, tutor_requests, analytics_events
```

---

## Files changed in this review pass

- `src/lib/pricing.ts`, `src/lib/free-tier.ts`, `src/app/pricing/page.tsx`
- `src/lib/quiz-local.ts`, `src/lib/study-session-id.ts`, `src/lib/types.ts`
- `src/components/Nav.tsx`, `SessionQuiz.tsx`, `TutorChat.tsx`, `AgeGate.tsx`
- `src/app/study/page.tsx`, `settings/page.tsx`, `login/page.tsx`
- `supabase/migrations/006_quiz_session_id.sql`

---

## Suggested second review prompt (paste to Claude)

> Review sch00l.ai codebase at github.com/christoughr/sch00l-xyz. Focus on: (1) revenue model completeness, (2) remaining lift/session bugs, (3) mobile UX, (4) security of API routes, (5) COPPA compliance gaps. Compare with CODE_REVIEW.md and list anything we missed.

---

## Verdict

**Ship-ready for public beta** with local-first mode. **Payment-ready** once Stripe env vars + webhook are set; run Supabase migrations 001–007 for cloud Pro sync.
