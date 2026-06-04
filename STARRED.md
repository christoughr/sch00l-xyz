# ⭐ STARRED — do later (not blocking launch)

Skip these until you're ready. Everything else runs **local-first** without them — see [LOCAL-FIRST.md](./LOCAL-FIRST.md).

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

## ⭐ Google Classroom OAuth — public launch (all teachers)

**Why later:** Pilot works in **Testing** mode with up to 100 test users (`hello@sch00l.ai` + pilot emails). Any Google account requires publish + verification.

**When ready:**

1. **Branding** — add live URLs:
   - Application home page: `https://sch00l.ai`
   - Privacy policy: `https://sch00l.ai/privacy`
   - Terms of service: `https://sch00l.ai/terms`
2. **Data Access** — scopes already set:
   - `classroom.courses.readonly`
   - `classroom.rosters.readonly`
3. **Clients** — redirect URI (must match exactly):
   - `https://sch00l.ai/api/integrations/google/callback`
4. **Verification Center** — submit OAuth verification:
   - Justify why sch00l needs Classroom roster read access
   - **Demo video** (YouTube, unlisted OK): show teacher Connect → consent → Sync flow
   - Explain data use: import course/roster counts for class sync (no selling data)
5. After Google approves → **Publish app** (In production)

**Until then:** **Audience → Testing** + add each pilot teacher email as **Test user**. They will see an “unverified app” warning — OK to continue.

---

## ⭐ Lemon Squeezy (payments — Korea-friendly)

**Why later:** need LS store **approved/activated**. **Code is ready** — paste env vars when store is live.

**When ready:**

1. [lemonsqueezy.com](https://lemonsqueezy.com) → Store (complete activation)
2. Products: **Pro** **$149.99/mo** · **Human tutor** hourly variant (optional)
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
