# Deploy sch00l.ai to Vercel

Step-by-step production launch for **sch00l.ai** (primary). **sch00l.ai** redirects automatically.

## 1. GitHub

```bash
cd sch00l
git init
git add .
git commit -m "Initial sch00l.ai launch"
```

Create a repo on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USER/sch00l.git
git branch -M main
git push -u origin main
```

## 2. Supabase (production)

1. [supabase.com](https://supabase.com) → New project (region close to users)
2. **SQL Editor** → run in order:
   - `supabase/migrations/001_initial.sql`
   - `supabase/migrations/002_classrooms.sql`
   - `supabase/migrations/003_compliance.sql`
   - `supabase/migrations/004_analytics.sql`
   - `supabase/migrations/005_tutor_linkage.sql`
   - `supabase/migrations/006_quiz_session_id.sql`
   - `supabase/migrations/007_stripe_pro.sql`
3. **Authentication → URL Configuration**
   - Site URL: `https://sch00l.ai`
   - Redirect URLs:
     - `https://sch00l.ai/auth/callback`
     - `http://localhost:3000/auth/callback`
4. **Authentication → Providers** → Email ON (magic link)
5. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (never expose to client)

## 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. Root directory: `sch00l` (if monorepo) or repo root
3. **Environment variables** (Production + Preview):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (secret) |
| `NEXT_PUBLIC_APP_URL` | `https://sch00l.ai` |
| `OPENAI_API_KEY` | Groq or OpenAI key |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` (optional) |
| `OPENAI_MODEL` | `llama-3.3-70b-versatile` (optional) |
| `TEACHER_EMAILS` | `you@gmail.com,co-founder@school.edu` |
| `STRIPE_SECRET_KEY` | `sk_live_...` (optional until monetization) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `STRIPE_PRICE_PRO_MONTHLY` | `price_...` ($14.99/mo) |
| `STRIPE_PRICE_TUTOR_HOUR` | `price_...` ($49 one-time) |

4. Deploy → note the `.vercel.app` URL

### Stripe webhook

- Endpoint: `https://sch00l.ai/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.deleted`
- After checkout, Pro unlocks via `/pro/success` (local) + `profiles.is_pro` (when Supabase + same email)

## 4. Domains (sch00l.ai + sch00l.xyz)

Add both in Vercel → Settings → Domains. **sch00l.xyz** redirects to **sch00l.ai** (configured in `vercel.json`).

At your registrar (Namecheap, Cloudflare, etc.) for **each** domain:

**Option A — Vercel DNS (easiest)**  
Vercel project → **Settings → Domains** → Add `sch00l.ai` and `www.sch00l.ai` → follow nameserver instructions.

**Option B — Keep registrar DNS**

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Wait 5–60 min for DNS. Vercel will issue HTTPS automatically.

## 5. Post-deploy checklist

- [ ] Open `https://sch00l.ai` — landing loads
- [ ] Join waitlist — row in Supabase `waitlist` table
- [ ] Magic link login works
- [ ] Complete one study session (pre → tutor → post)
- [ ] Teacher: set `TEACHER_EMAILS`, sign in, create classroom at `/teacher`
- [ ] Student: `/join` with class code
- [ ] Teacher classroom dashboard shows student + learning lift

## 6. Groq (free AI)

1. [console.groq.com](https://console.groq.com) → API Keys
2. Vercel env:
   ```
   OPENAI_API_KEY=gsk_...
   OPENAI_BASE_URL=https://api.groq.com/openai/v1
   OPENAI_MODEL=llama-3.3-70b-versatile
   ```
3. Redeploy

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Magic link redirects to localhost | Set `NEXT_PUBLIC_APP_URL=https://sch00l.ai` and Supabase Site URL |
| Join class fails | Add `SUPABASE_SERVICE_ROLE_KEY` on Vercel |
| Teacher portal locked | Add your email to `TEACHER_EMAILS`, redeploy |
| Demo AI only | Add `OPENAI_API_KEY` |

## CLI deploy (optional)

```bash
npm i -g vercel
cd sch00l
vercel login
vercel --prod
```
