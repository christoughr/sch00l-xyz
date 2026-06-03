# Local-first mode (no keys required)

sch00l.ai runs in production **without** Supabase, Lemon Squeezy, or Discord. Students can study immediately; data stays in the browser.

## What works today

| Feature | Storage |
|---------|---------|
| Study flow (pre → tutor → post → lift) | Browser |
| **56 study tracks** (AP, SAT/ACT, exam prep, college, K–12, languages) | Picker on `/study` |
| **18 subjects** (math → social studies) | Picker + all APIs |
| **Session memory** (last 12 summaries) | Browser — feeds next tutor/quiz |
| **Adaptive tutor & quizzes** | Mastery, lift, pre-quiz %, session memory |
| Progress, learning lift, session history | Browser |
| Flashcards (SM-2 review) | Browser |
| Pro waitlist / tutor requests | Browser (+ optional founder webhook) |
| AI tutor & quizzes | Groq if `OPENAI_API_KEY` set, else **demo mode** |

Check status: `GET https://sch00l.ai/api/health` — `aiMode: "demo"` or `"live"`.

## Demo vs live AI

- **No `OPENAI_API_KEY`:** Socratic demo replies, sample quizzes, generated flashcards — good for UX testing.
- **With Groq env** (see `DEPLOY.md` §6): real LLM on `/api/tutor`, `/api/quiz/generate`, `/api/flashcards/generate`.

## Export data (founder / GDPR)

**Settings → Export local data (JSON)** includes:

- Progress, quizzes, flashcards, session memory  
- Waitlist emails, tutor requests/applications  
- Age consent, free-tier counter, Pro flag  

Use this until Supabase is connected.

## Clear everything

**Settings → Clear local browser data** removes all keys in `src/lib/storage-keys.ts` (including consent — refresh may show age gate again).

## When you add cloud (see `STARRED.md`)

1. **Supabase** — login, cloud progress, teacher portal  
2. **Lemon Squeezy** — `/pricing` checkout, `/pro/success` after real payment  
3. **Discord** — `FOUNDER_WEBHOOK_URL` or bot for alerts  

## Local dev

```bash
npm install
npm run dev
npm run check:env -- --local
```

No `.env` required for demo mode.
