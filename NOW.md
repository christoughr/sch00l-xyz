# NOW — launch without Supabase or Lemon Squeezy

**Starred for later:** [STARRED.md](./STARRED.md)

---

## ✅ Already live (no setup)

| What | URL |
|------|-----|
| Study flow | https://sch00l.ai/study |
| Progress + lift | https://sch00l.ai/progress |
| Flashcards | https://sch00l.ai/flashcards |
| Tutor request | https://sch00l.ai/tutors |
| Pricing (waitlist mode) | https://sch00l.ai/pricing |
| Share copy | [SHARE.md](./SHARE.md) |
| Screenshots + Twitter assets | [MARKETING.md](./MARKETING.md) |

---

## You — today (~30 min)

1. **Twitter/X** — upload `public/brand/twitter-avatar.png` + `twitter-header.png`, bio from chat
2. **Pin a post** — copy from SHARE.md (lift screenshot attached)
3. **Share** https://sch00l.ai/study — 10–20 people (HN / Reddit / 카톡)
4. **Recruit tutors** — share https://sch00l.ai/tutors apply link
5. **Optional (2 min): Discord webhook** — see below → get waitlist/tutor emails without Supabase

---

## Optional: collect emails without Supabase (2 min)

1. Discord → your server → channel → Edit → Integrations → **Webhook** → copy URL
2. Vercel → Project → Settings → Environment Variables:
   - `FOUNDER_WEBHOOK_URL` = that webhook URL
3. Redeploy

New **waitlist**, **tutor requests**, and **tutor applications** ping your Discord.

---

## Manual ops (until Lemon Squeezy)

| Event | You do |
|-------|--------|
| Tutor request submitted | Email student + match a tutor manually |
| Tutor application | Review → reply by email |
| Pro interest (waitlist) | Note email → notify when Pro launches |
| Human tutor payment | Invoice or LS when live |

Export your browser data anytime: **Settings → Export local data**.

---

## Agent next (when you say go)

- Lemon Squeezy checkout API (paste variant IDs)
- Supabase connect (paste env vars)
