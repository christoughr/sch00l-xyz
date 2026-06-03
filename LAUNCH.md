# Launch — sch00l.ai public beta

## ✅ Agent (done)

- Production: https://sch00l.ai (Groq AI, no Supabase)
- Study flow: pre-quiz → tutor → post-quiz → auto flashcards → progress lift
- Topic passed to tutor; share link copy on session complete
- DNS/SSL docs, redirect loop fix, COPPA age gate

---

## 👤 Only you can do

### Now (beta)

1. **Share** with friends: **https://sch00l.ai/study**  
   (or tap “Copy share link” after a session)
2. **One full test** yourself: topic → pre-quiz → chat → post-quiz → check **Progress**
3. **Marketing** (optional): post + waitlist emails from landing page

### When Supabase support replies (last)

1. Create Supabase project (Gmail if `hello@sch00l.ai` blocked)
2. Run SQL migrations `001` → `002` → `003` in Supabase SQL editor
3. Vercel → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TEACHER_EMAILS=your@email.com`
4. Supabase Auth → URL config → redirect: `https://sch00l.ai/auth/callback`
5. Redeploy Vercel, test Sign in + teacher portal

### DNS (only if site stops loading again)

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

Then `ipconfig /flushdns` on Windows.

Backup: **https://sch00l-plum.vercel.app**

---

## Skipped (your choice)

- Groq key rotation — you declined
- Supabase — until signup works
