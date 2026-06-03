# ⭐ STARRED — do later (not blocking launch)

Skip these until you're ready. Everything else runs **local-first** without them.

---

## ⭐ Supabase (cloud auth + DB)

**Why later:** signup/support blocked; local mode works fine for beta.

**When ready:**

1. New project at [supabase.com](https://supabase.com) (or support unblocks account)
2. SQL Editor → run **001 → 007** in order (`supabase/migrations/`)
3. Auth → Site URL `https://sch00l.ai`, redirect `https://sch00l.ai/auth/callback`
4. Vercel env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TEACHER_EMAILS=your@email.com`
5. Redeploy

**Unlocks:** magic-link login, cloud progress, teacher portal, waitlist DB, tutor inbox.

---

## ⭐ Lemon Squeezy (payments — Korea-friendly)

**Why later:** need LS account + variant IDs. **Code is ready** — paste env vars when account exists.

**When ready:**

1. [lemonsqueezy.com](https://lemonsqueezy.com) → Store
2. Products: **Pro** $14.99/mo · **Human tutor** $49 (optional)
3. Vercel env:

| Variable | Example |
|----------|---------|
| `LEMONSQUEEZY_API_KEY` | Settings → API |
| `LEMONSQUEEZY_STORE_ID` | store ID |
| `LEMONSQUEEZY_VARIANT_PRO` | variant ID |
| `LEMONSQUEEZY_VARIANT_TUTOR` | variant ID (optional) |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | webhook signing secret |

4. Webhook URL: `https://sch00l.ai/api/lemonsqueezy/webhook`  
   Events: `order_created`, `subscription_created`, `subscription_payment_success`, `subscription_cancelled`
5. Redeploy → `/pricing` shows **Subscribe to Pro**

**Until then:** Pro waitlist · Tutor request form.

---

## ⭐ Discord (webhook + bot)

**Why later:** no server/channel yet. Code is already deployed — you only add env when ready.

**When ready:** follow [DISCORD.md](./DISCORD.md)

1. Create a Discord server + channel (e.g. `#sch00l-alerts`)
2. **Webhook:** copy URL → Vercel `FOUNDER_WEBHOOK_URL` → redeploy
3. **Bot (optional):** Developer Portal → `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN` → Interactions URL `https://sch00l.ai/api/discord/interactions` → `npm run discord:register`

**Until then:** waitlist/tutor data stays in each user's browser; you can export via **Settings → Export local data** on your machine.

---

## Also starred (your choice)

- X pin post, public sharing (marketing)

- Groq API key rotation
- Stripe (replaced by Lemon Squeezy for Korea)
