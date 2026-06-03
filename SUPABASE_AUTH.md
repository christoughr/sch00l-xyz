# Supabase auth — magic links & custom email (sch00l.ai)

## Why you see “Check your email” but no email

The app **did** call Supabase (`signInWithOtp`). A **200** from Supabase only means “queued” — delivery uses Supabase’s mailer unless you configure **custom SMTP**.

Default Supabase email often:

- Lands in **spam** / Promotions
- Is sent from `noreply@mail.app.supabase.io` (filters block it)
- Has **low rate limits** on new projects
- May delay several minutes on free tier

**Fix:** Custom SMTP (Resend, SendGrid, AWS SES, etc.) + branded templates below.

---

## 1. Auth URLs (required)

Supabase → **Authentication** → **URL configuration**

| Field | Value |
|-------|--------|
| Site URL | `https://sch00l.ai` |
| Redirect URLs | `https://sch00l.ai/auth/callback` |
| | `https://sch00l.ai/**` (optional wildcard) |
| | `http://localhost:3000/auth/callback` (local dev) |

Enable **Email** provider under Sign In / Providers.

---

## 2. Custom SMTP (recommended)

Supabase → **Project Settings** → **Authentication** → **SMTP Settings**

Example with **[Resend](https://resend.com)** (simple, good deliverability):

1. Resend → API Keys → create key
2. Verify domain **sch00l.ai** (DNS records Resend gives you)
3. Supabase SMTP:

| Field | Example |
|-------|---------|
| Host | `smtp.resend.com` |
| Port | `465` (SSL) or `587` (TLS) |
| User | `resend` |
| Password | your Resend API key |
| Sender email | `hello@sch00l.ai` |
| Sender name | `sch00l` |

Save → send a test magic link from https://sch00l.ai/login

---

## 3. Email templates (copy into Supabase)

Supabase → **Authentication** → **Email Templates** → **Magic Link**

Paste HTML from: [`supabase/email-templates/magic-link.html`](./supabase/email-templates/magic-link.html)

Subject line suggestion:

```
Sign in to sch00l.ai
```

**Confirm signup** template (optional): [`confirm-signup.html`](./supabase/email-templates/confirm-signup.html)

Template variables Supabase provides: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .SiteURL }}`

---

## 4. Vercel env (already set)

```
NEXT_PUBLIC_SUPABASE_URL=https://stmzdixhjwavnauvqbeh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server only
TEACHER_EMAILS=hello@sch00l.ai
```

Redeploy after any env change.

---

## 5. Teacher portal checklist

The checklist on `/teacher` is **progress**, not an error state. Empty waitlist / no classrooms = normal on day one.

Steps 1–2 are done when:

- https://sch00l.ai/api/health → `"supabase": true`
- You’re signed in as `hello@sch00l.ai` and can create a classroom

---

## 6. Verify login

1. https://sch00l.ai/login → `hello@sch00l.ai` → magic link  
2. Link should open `https://sch00l.ai/auth/callback?code=...`  
3. Redirect to `/onboarding` (first time) or `/study`  
4. https://sch00l.ai/teacher → create classroom  

If link expires: request a new one (links are single-use, ~1 hour).

---

## 7. Still stuck?

| Check | Where |
|-------|--------|
| Auth logs | Supabase → Authentication → Logs |
| Spam folder | Gmail “All Mail” |
| Rate limit | Wait 60s between OTP requests |
| Rotate keys | Keys were posted in chat — rotate in Supabase + Vercel |
