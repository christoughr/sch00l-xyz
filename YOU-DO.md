# YOU-DO — only things you must do

Everything else is built and deployed. See **`CODE_REVIEW.md`** for full audit + Claude second-review prompt.

---

## 💰 Monetization (your decisions + setup)

We built pricing + limits. **You connect payments:**

| Stream | Your action |
|--------|-------------|
| **Pro $14.99/mo** | Stripe Checkout → unlock unlimited AI (replace `free-tier` local hack) |
| **Human tutor $49/hr** | Stripe Connect or manual invoice; sch00l keeps **35%** (~$17/hr) |
| **School $9/seat/mo** | Find 1 teacher → pilot → invoice or Stripe |

**Pages live:** https://sch00l.ai/pricing · https://sch00l.ai/tutors

---

## 🔥 This week

1. **Share** https://sch00l.ai/study (10–20 people)
2. **Recruit 3 tutors** → https://sch00l.ai/tutors apply form
3. **Match tutor requests manually** (email) until Stripe live
4. Collect lift screenshots + feedback

---

## 📅 Supabase (when support replies)

Run SQL **001 → 006** (006 = quiz session pairing for accurate lift)

Vercel env: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `TEACHER_EMAILS`

Auth redirect: `https://sch00l.ai/auth/callback` → Redeploy

---

## 📅 Stripe (when ready — big revenue unlock)

1. Create Stripe account
2. Products: Pro monthly, Human tutor hour
3. Webhook → Vercel `/api/stripe/webhook` (TODO in code)
4. Tutor payouts: Stripe Connect Express for partner tutors

---

## ❌ Skip (your choice)

- Groq key rotation
- DNS (working)

---

**Now:** share + recruit tutors. **Next money:** Stripe + Supabase.
