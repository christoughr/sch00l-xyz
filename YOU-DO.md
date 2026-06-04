# YOU-DO — operator checklist

**Repo:** https://github.com/christoughr/sch00l-xyz · **Live:** https://sch00l.ai

---

## Vercel env vars (dashboard only — never commit secrets)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/admin APIs |
| `GROQ_API_KEY` | AI tutor (alias — also set as `OPENAI_API_KEY` or use GROQ alone) |
| `OPENAI_API_KEY` | AI tutor/quiz (Groq key works here with `OPENAI_BASE_URL`) |
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

Before Lemon Squeezy live: **`013_pro_subscription.sql`** (`ls_subscription_id`, `ls_order_id` on profiles).

Before Google/Canvas OAuth: **`014_teacher_oauth.sql`** (`teacher_integrations` table).

Use **Run without RLS** in SQL Editor for large scripts if prompted.

---

## LMS OAuth (operator setup)

### Google Classroom

1. [Google Cloud Console](https://console.cloud.google.com/) → project **sch00l**
2. Enable **Google Classroom API** and **Google People API**
3. OAuth consent screen (External). Scopes:
   - `.../auth/classroom.courses.readonly`
   - `.../auth/classroom.rosters.readonly`
4. Credentials → OAuth 2.0 Client ID → Web application  
   Redirect URI: `https://sch00l.ai/api/integrations/google/callback`
5. Vercel env:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `INTEGRATION_TOKEN_KEY` (32+ char secret for AES token encryption; optional — falls back to service role hash)

### Canvas (per institution)

- `CANVAS_CLIENT_ID` / `CANVAS_CLIENT_SECRET` from each school's Canvas admin
- Teachers enter their Canvas domain (e.g. `myschool.instructure.com`) in Integrations
- Until approved: **Request Canvas integration** emails `hello@sch00l.ai`

### Lemon Squeezy

| Variable | Purpose |
|----------|---------|
| `LEMONSQUEEZY_API_KEY` | Checkout API |
| `LEMONSQUEEZY_STORE_ID` | Store |
| `LEMONSQUEEZY_VARIANT_PRO` | Pro subscription variant |
| `LEMONSQUEEZY_VARIANT_TUTOR` | Tutor hour variant (optional) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook HMAC |

Webhook URL: `https://sch00l.ai/api/lemonsqueezy/webhook`

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
