# Google Classroom — public launch checklist

Pilot works in **Testing** mode (up to 100 test users). Any Google account needs **verification + Publish**.

## Before you submit

- [ ] Live URLs on consent screen: `https://sch00l.ai`, `/privacy`, `/terms`
- [ ] Redirect URI exactly: `https://sch00l.ai/api/integrations/google/callback`
- [ ] Vercel env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `INTEGRATION_TOKEN_KEY`
- [ ] Run `014_teacher_oauth.sql` in Supabase

## Verification Center

1. **Scopes** (already in app):
   - `classroom.courses.readonly`
   - `classroom.rosters.readonly`
2. **Justification** — sch00l imports course names and roster counts so teachers can sync classes; no resale of Google user data.
3. **Demo video** (YouTube unlisted OK, ~2–3 min):
   - Teacher signs in → `/teacher` → Connect Google → consent → Sync
   - Show roster import → class appears in sch00l
4. Submit → wait for Google review (often 1–4 weeks).

## Until approved

- OAuth consent screen → **Testing**
- Add each pilot teacher email as **Test user**
- They will see “Google hasn’t verified this app” — expected

## After approval

- **Publish app** (move to Production)
- Remove test-user cap for Classroom connect

See also [STARRED.md](./STARRED.md) and [YOU-DO.md](./YOU-DO.md).
