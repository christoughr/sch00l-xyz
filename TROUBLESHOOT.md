# Can't open sch00l.ai?

## Try these URLs (in order)

1. **https://sch00l.ai** (must include `https://`)
2. **https://www.sch00l.ai**
3. **https://sch00l-plum.vercel.app** (backup — always works if deploy is OK)
4. **https://sch00l.ai/api/health** — should show `{"ok":true}`

## If you see a blank / black page

That's the **age gate** — enter birth year + check Terms, then **Continue**.

## If the page never loads (spinning forever)

Usually DNS or a redirect loop. After our fix, hard refresh: `Ctrl+Shift+R`.

## DNS checklist (name.com)

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

Wait 5–60 min after saving.

## Still "Not secure"?

Use **`https://`** not `http://`. Or switch nameservers to Vercel:

- `ns1.vercel-dns.com`
- `ns2.vercel-dns.com`
