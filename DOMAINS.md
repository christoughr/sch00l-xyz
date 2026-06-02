# sch00l domains

| Domain | Role |
|--------|------|
| **sch00l.ai** | Primary — branding, SEO, auth callbacks |
| **sch00l.xyz** | Legacy — 301 redirects to sch00l.ai |
| **www.** variants | Redirect to apex sch00l.ai |

## DNS (both registrars)

Point **sch00l.ai** and **sch00l.xyz** (and optional `www`) to Vercel:

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

Or use Vercel nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

## Vercel

Domains should be attached to project `sch00l`:

- sch00l.ai
- www.sch00l.ai
- sch00l.xyz
- www.sch00l.xyz

```bash
vercel domains add sch00l.ai --scope onlyus
vercel domains add www.sch00l.ai --scope onlyus
```

## Environment

```env
NEXT_PUBLIC_APP_URL=https://sch00l.ai
```

## Supabase Auth

- Site URL: `https://sch00l.ai`
- Redirect URLs:
  - `https://sch00l.ai/auth/callback`
  - `https://sch00l.xyz/auth/callback` (optional, during transition)

## Email (later)

Set up forwarding or Google Workspace:

- `hello@sch00l.ai`
- `support@sch00l.ai`
- `privacy@sch00l.ai`
