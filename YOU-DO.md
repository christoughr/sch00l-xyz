# YOU-DO — only things you must do

Everything else is built and deployed. This is your checklist.

---

## 🔥 This week (beta launch)

### 1. Share the product (30 min)
- Send **https://sch00l.ai/study** to 10–20 people
- Also share **https://sch00l.ai/tutors** if they want human help
- Message template:
  > Free AI study tutor — won't do your homework. Pre-quiz → tutor → post-quiz shows your learning lift. Stuck? Request a human tutor with your session context: https://sch00l.ai/study

### 2. One full session yourself (15 min)
- Pick **AP Calculus AB** track → pre → chat → post → Progress
- Try **Human** button in chat or **Still stuck?** after session complete

### 3. Collect 5 feedback quotes
- Ask: "Did the AI help you learn vs just give answers?"
- Ask: "Would you pay for a human tutor with this session summary?"

### 4. Waitlist + tutor pipeline
- .edu emails → landing waitlist
- Recruit **3 partner tutors** (friends, AP teachers, college tutors) → send to **https://sch00l.ai/tutors** apply form

---

## 👥 Tutor 연계 — your part (important)

We built **AI → human handoff**. You run the people side:

| Step | You do |
|------|--------|
| **Recruit 3 tutors** | AP Calc, SAT Math, AP Bio — apply at `/tutors` or email you |
| **Match requests** | When Supabase live: check `/teacher` → "Human tutor requests" |
| **First match manually** | Email student + tutor the session summary (until auto-match) |
| **Pricing** | Decide later: free pilot → $20–40/hr or school B2B |
| **Quality** | Tutors must agree: Socratic, no homework cheating |

**Why this wins:** ChatGPT = AI only. Chegg = answers. **sch00l = AI + qualified human with context.**

---

## 📅 When Supabase support replies

### 5. Create Supabase project (~20 min)

### 6. Run SQL migrations (order matters)
1. `001_initial.sql`
2. `002_classrooms.sql`
3. `003_compliance.sql`
4. `004_analytics.sql`
5. **`005_tutor_linkage.sql`** ← tutor requests + applications

### 7. Vercel environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TEACHER_EMAILS=your@email.com`

→ **Redeploy**

### 8. Supabase Auth redirect
- Site URL: `https://sch00l.ai`
- Redirect: `https://sch00l.ai/auth/callback`

### 9. Test after Supabase
- [ ] Sign in, progress sync
- [ ] Teacher portal + tutor requests list
- [ ] Submit tutor request from `/study` → appears in teacher dashboard
- [ ] `/outcomes` live stats

---

## 🏫 Month 1–2 (school pilot)

### 10. Find one teacher ally
### 11. Run one 2-week pilot (15–30 students)
### 12. Pitch deck: `/outcomes` + class lift + tutor request volume

---

## 📣 Marketing (pick 3)

| Channel | Hook |
|---------|------|
| TikTok | "AI tutor that won't cheat + human backup" |
| Reddit r/APStudents | Share lift screenshot |
| Discord | AP study servers |

---

## ❌ Skip (your choice)

- Groq key rotation
- DNS (working)

---

## Success metrics (30 days)

| Metric | Target |
|--------|--------|
| Full sessions completed | 50+ |
| Tutor applications | 3+ |
| Tutor requests (student) | 10+ |
| Waitlist | 100+ |
| School pilot | 1 class |

---

**Now:** share `/study` + recruit 3 tutors. Supabase when support replies.
