# YOU-DO — operator checklist

**Repo:** https://github.com/christoughr/sch00l-xyz · **Live:** https://sch00l.ai

---

## Vercel env vars (dashboard only — never commit secrets)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin APIs |
| `GROQ_API_KEY` | AI tutor |
| `RESEND_API_KEY` | Magic links |
| `TEACHER_EMAILS` | e.g. `hello@sch00l.ai` |
| `NEXT_PUBLIC_SITE_URL` | `https://sch00l.ai` |
| `STRIPE_SECRET_KEY` | Pro / tutor checkout (optional) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhooks (optional) |
| `LEMONSQUEEZY_API_KEY` | If using LS instead of Stripe |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LS webhooks |

---

## Supabase SQL (run once, in order)

See [RUN_ALL_SQL.md](./RUN_ALL_SQL.md) — migrations **001–011** are applied.

Optional when ready: **`012_budget_tier.sql`** (tutor budget tier on requests).

Use **Run without RLS** in SQL Editor for large scripts if prompted.

---

## Auth

- Supabase → Authentication → URL configuration: site URL `https://sch00l.ai`
- Redirect allow: `https://sch00l.ai/auth/callback`

---

## After each deploy — smoke test

```bash
npm test && npm run build && npm run test:e2e
```

Production (optional): `PLAYWRIGHT_BASE_URL=https://sch00l.ai npm run test:e2e`

Manual pilot:

1. Teacher `hello@sch00l.ai` → `/teacher` → class **9FW69A**
2. Student join `/join` → `/my-classes` → **Discussion**
3. Sign out completes in &lt;3s (no stuck “Signing out…”)

---

## Deferred (see STARRED.md)

- Discord bot marketing
- Full LMS OAuth (CSV import works today)
- Lemon Squeezy live checkout
