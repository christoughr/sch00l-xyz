# YOU-DO — only things you must do

Everything else is built and deployed. This is your checklist.

---

## 🔥 This week (beta launch)

### 1. Share the product (30 min)
- Send **https://sch00l.ai/study** to 10–20 people (friends, classmates, Discord, Reddit r/APStudents, r/SAT)
- Message template:
  > Free AI study tutor — won't do your homework. Pre-quiz → tutor → post-quiz shows your learning lift. Try it: https://sch00l.ai/study

### 2. One full session yourself (15 min)
- Pick **AP Calculus AB** track (or SAT Math)
- Complete pre-quiz → chat 3+ messages → post-quiz
- Check **Progress** and **Flashcards**

### 3. Collect 5 feedback quotes
- Ask: "Did the tutor help you learn vs just give answers?"
- Screenshot any positive lift (pre → post %)

### 4. Waitlist
- Ask .edu emails to join waitlist on landing page
- Note who is a teacher vs student

---

## 📅 When Supabase support replies

### 5. Create Supabase project (~20 min)
- https://supabase.com — use Gmail if `hello@sch00l.ai` still blocked

### 6. Run SQL migrations (order matters)
In Supabase → SQL Editor, run each file:
1. `supabase/migrations/001_initial.sql`
2. `supabase/migrations/002_classrooms.sql`
3. `supabase/migrations/003_compliance.sql`
4. `supabase/migrations/004_analytics.sql`

### 7. Vercel environment variables
Project **onlyus/sch00l** → Settings → Environment Variables:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page (service_role — secret) |
| `TEACHER_EMAILS` | Your email, e.g. `you@gmail.com` |

Then **Redeploy** (Deployments → … → Redeploy).

### 8. Supabase Auth redirect
Supabase → Authentication → URL Configuration:
- Site URL: `https://sch00l.ai`
- Redirect URLs: `https://sch00l.ai/auth/callback`

### 9. Test after Supabase
- [ ] Sign in at `/login`
- [ ] Progress syncs across devices
- [ ] `/teacher` → create classroom → share join code
- [ ] `/outcomes` shows real aggregate stats

---

## 🏫 Month 1–2 (school pilot — optional but huge)

### 10. Find one teacher ally
- Former teacher, tutor, or AP instructor you know
- Pitch: "Free pilot, class-wide learning lift dashboard"

### 11. Run one 2-week pilot
- One topic (e.g. AP Calc derivatives)
- 15–30 students join via `/join` + class code
- Check teacher dashboard for class lift

### 12. Build pitch deck slide
Screenshot:
- `/outcomes` (aggregate lift)
- Teacher classroom stats
- 2–3 student lift quotes

---

## 📣 30-day marketing (pick 3 channels)

| Channel | Action |
|---------|--------|
| **TikTok / Reels** | 30-sec screen record: pre-quiz → tutor hint → post-quiz lift |
| **Reddit** | r/APStudents, r/SAT, r/learnmath — be helpful, link in comment |
| **Discord** | AP study servers — share link, ask for feedback |
| **Twitter/X** | "Built an AI that refuses to cheat" thread |
| **School** | Email one counselor or club president |

Post **2–3× per week**, same link every time.

---

## ❌ You chose to skip (fine)

- Groq API key rotation
- DNS changes (site works after `ipconfig /flushdns`)
- Legal review (privacy/terms exist; lawyer optional for pilots)

---

## 🆘 If something breaks

1. https://sch00l.ai/api/health → should say `{"ok":true}`
2. Hard refresh: `Ctrl+Shift+R`
3. `ipconfig /flushdns`
4. Backup: https://sch00l-plum.vercel.app
5. See `TROUBLESHOOT.md`

---

## Success metrics (when you know you're winning)

| Metric | Target (30 days) |
|--------|------------------|
| People who finish full session | 50+ |
| Avg session time | 10+ min |
| Post-quiz completion | 40%+ of starts |
| Waitlist emails | 100+ |
| School pilot | 1 classroom |

---

**Your only job right now:** share link + get feedback. Supabase when support replies. Everything else is shipped.
