# Discord — one step at a time

Two parts: **A = alerts (webhook)** · **B = bot (slash commands)**

Skip marketing/share — only Discord setup here.

---

## Part A — Webhook alerts (do this first)

Gets waitlist + tutor pings in a channel. **~3 min.**

### A1. Create webhook

1. Open your Discord server
2. Pick a channel (e.g. `#sch00l-alerts`)
3. Click the **gear** next to the channel name
4. **Integrations** → **Webhooks** → **New Webhook**
5. Name: `sch00l alerts` → **Copy Webhook URL**

### A2. Add to Vercel

1. [vercel.com](https://vercel.com) → your **sch00l** project
2. **Settings** → **Environment Variables**
3. Add:

| Name | Value |
|------|--------|
| `FOUNDER_WEBHOOK_URL` | paste webhook URL |

4. Environment: **Production** (and Preview if you want)
5. **Save**

### A3. Redeploy

1. **Deployments** tab → latest → **⋯** → **Redeploy**
2. Wait until **Ready**

### A4. Test

1. Open https://sch00l.ai
2. Scroll to **Join the waitlist** → enter a test email → submit
3. Check Discord — you should see an embed: **📬 New waitlist signup**

**Done Part A?** Reply `A 끝` and we do Part B.

---

## Part B — Slash command bot (optional, after A)

Commands: `/study` `/progress` `/tutors` `/help`

### B1. Create Discord application

1. https://discord.com/developers/applications → **New Application**
2. Name: `sch00l` → Create
3. **General Information** → copy **Application ID** → save as `DISCORD_APPLICATION_ID`

### B2. Create bot + token

1. Left menu **Bot** → **Add Bot**
2. **Reset Token** → copy token → save as `DISCORD_BOT_TOKEN` (secret, once only)
3. Under **Privileged Gateway Intents** — leave defaults (we use slash commands only)

### B3. Invite bot to your server

1. Left menu **OAuth2** → **URL Generator**
2. Scopes: `bot`, `applications.commands`
3. Bot permissions: `Send Messages`, `Use Slash Commands` (or Administrator for testing)
4. Copy generated URL → open in browser → pick your server → Authorize

### B4. Public key + Interactions URL (Vercel)

1. **General Information** → copy **Public Key** → `DISCORD_PUBLIC_KEY`
2. **Interactions Endpoint URL** → set to:

   ```
   https://sch00l.ai/api/discord/interactions
   ```

3. Save — Discord will send a **Ping**; it must succeed after deploy (B5)

### B5. Vercel env vars

Add all three:

| Name | Value |
|------|--------|
| `DISCORD_APPLICATION_ID` | Application ID |
| `DISCORD_PUBLIC_KEY` | Public Key |
| `DISCORD_BOT_TOKEN` | Bot token (for registering commands) |

Keep `FOUNDER_WEBHOOK_URL` from Part A.

**Redeploy** again.

### B6. Register slash commands

On your computer (in the `sch00l` folder):

```bash
# Windows PowerShell — paste your real values
$env:DISCORD_BOT_TOKEN="your_bot_token"
$env:DISCORD_APPLICATION_ID="your_app_id"
# Optional: only your server (faster updates)
# $env:DISCORD_GUILD_ID="your_server_id"

npm run discord:register
```

Wait ~1 min, then in Discord type `/study`.

### B7. Test

| Command | Expected |
|---------|----------|
| `/study` | Link to https://sch00l.ai/study |
| `/progress` | Link to /progress |
| `/tutors` | Link to /tutors |
| `/help` | Command list |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No webhook message | Check `FOUNDER_WEBHOOK_URL`, redeploy, test waitlist again |
| Interactions URL fails | Redeploy first; URL must be exactly `/api/discord/interactions` |
| `/study` not showing | Run `npm run discord:register` again; wait 1–5 min |
| 401 on interactions | `DISCORD_PUBLIC_KEY` wrong — copy from Developer Portal |

---

## Health check

https://sch00l.ai/api/health

Look for: `"founderWebhook": true`, and after B: bot works via `/api/discord/interactions` GET.
