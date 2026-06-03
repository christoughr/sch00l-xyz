# YOU-DO — only things you must do

Everything else is built and deployed. Stripe checkout + webhook code is ready — you only add keys.

---

## Phase 0 — Today (15 min)

1. Open https://sch00l.ai/study → complete one session (pre → tutor → post)
2. Screenshot your **learning lift** %
3. Share using copy in **`SHARE.md`** (10–20 people)

---

## Phase 1 — This week

| Task | Link / action |
|------|----------------|
| Share study link | https://sch00l.ai/study |
| Recruit 3 human tutors | https://sch00l.ai/tutors (apply form) |
| Match tutor requests by email | Until Stripe keys are live |
| Collect feedback + lift screenshots | For `/outcomes` social proof |

---

## Phase 2 — Supabase (when support replies)

Run SQL in order: **001 → 007** (`007` = Pro + payments tables)

Vercel env:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TEACHER_EMAILS` (your email)

Auth redirect: `https://sch00l.ai/auth/callback` → **Redeploy**

---

## Phase 3 — Stripe (revenue unlock)

1. [dashboard.stripe.com](https://dashboard.stripe.com) → create account
2. **Products**
   - Pro — recurring **$14.99/month**
   - Human tutor — one-time **$49** (1 hour)
3. Copy **Price IDs** → Vercel:

| Variable | Value |
|----------|--------|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | from webhook endpoint |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_...` |
| `STRIPE_PRICE_TUTOR_HOUR` | `price_...` |

4. Stripe → **Developers → Webhooks** → Add endpoint:
   - URL: `https://sch00l.ai/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
5. **Redeploy** Vercel → test https://sch00l.ai/pricing → Subscribe to Pro

Tutor payouts later: Stripe Connect Express (manual email matching until then).

---

## Phase 4 — Optional school pilot

1 teacher → 1 classroom → https://sch00l.ai/teacher

---

## Skip (your choice)

- Groq API key rotation
- DNS (working on sch00l.ai)

---

**Agent already shipped:** pricing, free tier limits, tutor linkage, analytics, PWA, Stripe APIs, migration 007.

**You ship:** share → tutors → Supabase → Stripe keys.
