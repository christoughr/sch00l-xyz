# Launch checklist — sch00l.xyz

Use this the day you go live.

## Before deploy

- [ ] Run all 3 SQL migrations in Supabase (`001`, `002`, `003`)
- [ ] Supabase Auth: Site URL = `https://sch00l.xyz`
- [ ] Supabase Auth: Redirect = `https://sch00l.xyz/auth/callback`
- [ ] Vercel env vars set (see `.env.example`)
- [ ] `TEACHER_EMAILS` = your email
- [ ] `npm run build` passes locally

## Deploy

```bash
git push origin main
# Vercel auto-deploys, or: vercel --prod
```

## DNS (sch00l.xyz)

- [ ] Domain added in Vercel → Settings → Domains
- [ ] A record `@` → `76.76.21.21` OR Vercel nameservers
- [ ] CNAME `www` → `cname.vercel-dns.com`
- [ ] HTTPS certificate issued (automatic)

## Smoke test (production)

- [ ] `/` loads, waitlist submits
- [ ] Age gate → Terms/Privacy links work
- [ ] Magic link login → `/onboarding` → `/study`
- [ ] Full session: pre-quiz → tutor → post-quiz → flashcards
- [ ] `/teacher` create class → student `/join`
- [ ] `/settings` export JSON works
- [ ] `/privacy` and `/terms` accessible

## Growth (week 1)

- [ ] Post in 1 student Discord / subreddit
- [ ] 1 teacher pilot with real join code
- [ ] Track waitlist `.edu` count in `/teacher`
- [ ] Screenshot learning lift for pitch deck

## Acquirer-ready metrics to track

| Metric | Target |
|--------|--------|
| WAU | 500+ |
| Avg session | 15+ min |
| Pre→post lift | +15% avg |
| Waitlist | 200+ |
| Classroom pilots | 3+ |
