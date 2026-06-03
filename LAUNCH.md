# Launch checklist — sch00l.ai (no Supabase beta)

Public beta **without** accounts. Supabase is **last**.

## ✅ Done (by agent)

- [x] Deployed on Vercel → https://sch00l.ai
- [x] Groq AI on production
- [x] Redirect loop fix
- [x] Terms / Privacy links
- [x] Age gate (COPPA)
- [x] Local-only progress, quizzes, flashcards

## 👤 You — now

- [ ] Open **https://sch00l.ai** (must be `https://`)
- [ ] Complete age gate → **Continue**
- [ ] Test **/study** (full flow)
- [ ] **Rotate Groq API key** (was exposed in chat) → Vercel → Redeploy
- [ ] Share link with 3 friends for feedback

## 👤 You — DNS (if site won’t load)

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

Backup URL: **https://sch00l-plum.vercel.app**

## 👤 You — public beta marketing

- [ ] Post: “free AI study tutor that won’t do your homework”
- [ ] Link: https://sch00l.ai/study
- [ ] Collect waitlist on landing page

---

## 🔜 LAST — Supabase (when signup works)

- [ ] Create project (Gmail if hello@sch00l.ai blocked)
- [ ] Run SQL `001` → `002` → `003`
- [ ] Vercel env: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Auth redirect: `https://sch00l.ai/auth/callback`
- [ ] `TEACHER_EMAILS=your@email.com`
- [ ] Test login + teacher dashboard

---

## What works without Supabase

| Feature | Works? |
|---------|--------|
| AI tutor (Groq) | ✅ |
| Pre/post quiz | ✅ (browser) |
| Flashcards | ✅ (browser) |
| Progress/streaks | ✅ (browser) |
| Waitlist form | ✅ (local fallback) |
| Sign in | ⏸ last |
| Teacher portal | ⏸ last |
| Join class | ⏸ last |
