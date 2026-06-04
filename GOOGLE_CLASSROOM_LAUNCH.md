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
2. **Justification** (paste into Google form):

   > sch00l.ai helps teachers sync Google Classroom course titles and roster membership into sch00l class spaces so students can join with a class code, view assignments, and use an AI tutor scoped to teacher-uploaded materials. We request read-only Classroom access to list courses the teacher owns and read rosters to display enrolled students in the teacher dashboard. We do not sell, advertise against, or share Google user data with third parties. Data is used only to operate class sync for authenticated teachers who explicitly connect Google. Students authenticate separately; we do not access student Gmail or Drive.

3. **Demo video script** (record screen + voice, 2–3 min, upload unlisted to YouTube):

   | Step | Show on screen |
   |------|----------------|
   | 1 | `https://sch00l.ai/teacher` — signed-in teacher |
   | 2 | Click **Connect Google Classroom** → Google consent → Allow |
   | 3 | Click **Sync** — courses appear |
   | 4 | Open a class — roster count visible |
   | 5 | Student view: `/join` with class code → joined class |

5. Submit in Verification Center → wait for Google review (often 1–4 weeks).

## Until approved

- OAuth consent screen → **Testing**
- Add each pilot teacher email as **Test user**
- They will see “Google hasn’t verified this app” — expected

## After approval

- **Publish app** (move to Production)
- Remove test-user cap for Classroom connect

See also [STARRED.md](./STARRED.md) and [YOU-DO.md](./YOU-DO.md).
