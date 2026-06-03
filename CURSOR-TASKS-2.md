# CURSOR-TASKS-2.md — sch00l.ai backlog
**Generated:** 2026-06-03  
**Prerequisite:** CURSOR-TASKS A–E all ✅ (commit 5c518c3)  
**Branch:** main | **Stack:** Next.js 16 + Supabase + Vercel

> **Gate before any push:** `npm test && npm run build && npm run test:e2e` (port 3099)  
> **Never:** re-run migrations 001–011 | bare `signOut({ scope: 'global' })` without timeout  
> **New migrations** (013+): create file, note in RUN_ALL_SQL.md, do NOT auto-run in Supabase

---

## TASK GROUP F — Lemon Squeezy Live Checkout

> **Context from STARRED.md:** LS env vars documented, webhook URL is `https://sch00l.ai/api/lemonsqueezy/webhook`, code described as "ready — paste env vars when account exists." These tasks wire the server logic that fires when the env vars are present.

### F-01 · Webhook handler — verify and harden
**Files:** `src/app/api/lemonsqueezy/webhook/route.ts` (create if missing)

**Steps:**
1. Open or create `src/app/api/lemonsqueezy/webhook/route.ts`. Add `export const dynamic = 'force-dynamic'`.
2. Verify the signature check uses `LEMONSQUEEZY_WEBHOOK_SECRET`:
   ```ts
   import crypto from 'crypto';
   const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '';
   const hmac = crypto.createHmac('sha256', secret)
     .update(rawBody)
     .digest('hex');
   if (hmac !== req.headers.get('x-signature')) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```
3. Handle these events (ignore others with `200 OK`):
   - `order_created` → one-time tutor payment: insert into `tutor_payments`, mark `tutor_requests.paid = true`
   - `subscription_created` + `subscription_payment_success` → set `profiles.is_pro = true`, store `ls_subscription_id`
   - `subscription_cancelled` + `subscription_expired` → set `profiles.is_pro = false`
4. All DB writes go through `SUPABASE_SERVICE_ROLE_KEY` (server-only). Never expose in client.
5. Return `200` for every handled event; `400` only for signature failures.
6. `npm test && npm run build`

**Acceptance:** Posting a test payload to `/api/lemonsqueezy/webhook` with a valid signature returns 200 and updates the DB row.

---

### F-02 · Checkout session creation route
**Files:** `src/app/api/checkout/route.ts` (or `src/app/api/lemonsqueezy/checkout/route.ts`)

**Steps:**
1. Locate the checkout route. Confirm it handles missing env vars gracefully — return `503 { error: 'Payment not configured' }` if `LEMONSQUEEZY_API_KEY` is absent (task E-01 already did this; verify it's still there).
2. For **Pro subscription** checkout:
   ```ts
   const res = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
     method: 'POST',
     headers: {
       Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
       'Content-Type': 'application/vnd.api+json',
     },
     body: JSON.stringify({
       data: {
         type: 'checkouts',
         attributes: {
           checkout_data: { email: userEmail, custom: { user_id: userId } },
         },
         relationships: {
           store: { data: { type: 'stores', id: process.env.LEMONSQUEEZY_STORE_ID } },
           variant: { data: { type: 'variants', id: process.env.LEMONSQUEEZY_VARIANT_PRO } },
         },
       },
     }),
   });
   const { data } = await res.json();
   return Response.json({ url: data.attributes.url });
   ```
3. Pass `custom: { user_id }` so the webhook can map back to the Supabase user without relying on email matching.
4. On the client (`/pricing` page), the "Subscribe to Pro" button calls this route and redirects to `data.url`.
5. `npm test && npm run build`

---

### F-03 · Pro gate — unlock gated features after payment
**Files:** `src/components/AuthProvider.tsx`, `src/lib/pro-gate.ts` (create if missing), `/pricing` page

**Steps:**
1. Create `src/lib/pro-gate.ts`:
   ```ts
   import { createClient } from '@/lib/supabase/server';
   export async function isProUser(userId: string): Promise<boolean> {
     const supabase = createClient();
     const { data } = await supabase
       .from('profiles')
       .select('is_pro')
       .eq('id', userId)
       .single();
     return data?.is_pro ?? false;
   }
   ```
2. In `AuthProvider.tsx`, expose `isPro: boolean` on the auth context. Fetch from `profiles` table on session load.
3. Free tier cap (3 sessions/day) in `src/lib/free-tier.ts`: if `isPro === true`, bypass the cap entirely.
4. On `/pricing`, replace "Join waitlist" button with "Subscribe — $14.99/mo" button that hits the F-02 route. Only show waitlist CTA when LS env vars are absent (dev/staging).
5. After successful checkout LS redirects to `?checkout=success` — detect this in `AuthProvider` or a callback page and refetch `profiles.is_pro` to refresh the UI immediately.
6. `npm test && npm run build`

**Acceptance:** A user who completes Pro checkout sees the free-tier cap disappear without a page reload.

---

### F-04 · Migration 013 — is_pro + ls_subscription_id columns
**Files:** `supabase/migrations/013_pro_subscription.sql`, `RUN_ALL_SQL.md`

**Steps:**
1. Create `supabase/migrations/013_pro_subscription.sql`:
   ```sql
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT FALSE,
     ADD COLUMN IF NOT EXISTS ls_subscription_id TEXT,
     ADD COLUMN IF NOT EXISTS ls_order_id TEXT;

   CREATE INDEX IF NOT EXISTS idx_profiles_is_pro ON profiles(is_pro) WHERE is_pro = TRUE;
   ```
2. Add to `RUN_ALL_SQL.md`:
   ```
   013_pro_subscription.sql — adds is_pro, ls_subscription_id, ls_order_id to profiles
   Run in Supabase SQL Editor (Run without RLS if prompted)
   Required before Lemon Squeezy webhook goes live
   ```
3. Do NOT run this in Supabase yet — note is for the operator (YOU-DO.md step).
4. Add to `YOU-DO.md` under Supabase SQL section: "Run 013_pro_subscription.sql before enabling LS payments."
5. `npm test && npm run build`

---

### F-05 · E2E — checkout graceful handling
**Files:** `e2e/checkout.spec.ts`

**Steps:**
1. Create `e2e/checkout.spec.ts`:
   ```ts
   test('pricing page shows subscribe button when LS configured', async ({ page }) => {
     await page.goto('/pricing');
     // When env vars absent, should show waitlist or "coming soon" — not crash
     await expect(page).not.toHaveURL(/error/);
     const body = await page.textContent('body');
     expect(body).toBeTruthy();
   });

   test('checkout API returns 503 when LS not configured', async ({ request }) => {
     const res = await request.post('/api/checkout', {
       data: { type: 'pro' },
     });
     // In test env (no LS keys), expect graceful failure not 500
     expect([200, 503]).toContain(res.status());
   });
   ```
2. `npm run test:e2e`

---

## TASK GROUP G — Lift Battles™ Full Live Flow

> **Context:** Epic B scaffolding is done — `/battle/[code]`, lobby, questions, leaderboard exist per PR-SCOPE.md. The gap is the real-time push layer: question broadcast, answer collection, and live leaderboard updates via Supabase Realtime.

### G-01 · Supabase Realtime — battle channel architecture
**Files:** `src/app/battle/[code]/page.tsx`, `src/lib/battle-realtime.ts` (create)

**Steps:**
1. Create `src/lib/battle-realtime.ts` with three channel helpers:
   ```ts
   import { createClient } from '@/lib/supabase/client';

   // Teacher broadcasts question
   export function broadcastQuestion(battleCode: string, question: BattleQuestion) {
     const supabase = createClient();
     return supabase.channel(`battle:${battleCode}`)
       .send({ type: 'broadcast', event: 'question', payload: question });
   }

   // Student subscribes to questions
   export function subscribeToQuestions(
     battleCode: string,
     onQuestion: (q: BattleQuestion) => void
   ) {
     const supabase = createClient();
     return supabase.channel(`battle:${battleCode}`)
       .on('broadcast', { event: 'question' }, ({ payload }) => onQuestion(payload))
       .subscribe();
   }

   // Student submits answer
   export function submitAnswer(battleCode: string, userId: string, answerId: string, ms: number) {
     const supabase = createClient();
     return supabase.channel(`battle:${battleCode}`)
       .send({ type: 'broadcast', event: 'answer', payload: { userId, answerId, ms } });
   }
   ```
2. In `battle/[code]/page.tsx`, replace any polling or stub with these Realtime helpers. On unmount, call `channel.unsubscribe()`.
3. `npm test && npm run build`

---

### G-02 · Teacher host — question broadcast UI
**Files:** `src/app/battle/[code]/page.tsx` or `src/components/BattleHost.tsx`

**Steps:**
1. Teacher view (detected by `role === 'teacher'` or `isHost` flag on the battle row) shows:
   - Question list with a **"Launch"** button per question
   - A **countdown timer** (default 20s, configurable) that starts when question launches
   - After timer: auto-advance to next question or show "Review answers"
2. On "Launch": call `broadcastQuestion(code, question)` from G-01.
3. Timer: `useEffect` with `setInterval`, decrements `timeLeft` state each second. When `timeLeft === 0`: `broadcastQuestion(code, { type: 'time_up' })` and advance.
4. Show a live **response count** badge that increments as student answers come in (subscribe to `answer` events on the same channel).
5. `npm test && npm run build`

---

### G-03 · Student view — answer submission + live feedback
**Files:** `src/app/battle/[code]/page.tsx` or `src/components/BattleStudent.tsx`

**Steps:**
1. Student view subscribes to question events via `subscribeToQuestions`.
2. On receiving a question: display it full-screen with answer options A/B/C/D, a progress bar countdown matching the teacher's timer.
3. On answer tap: call `submitAnswer(code, userId, answerId, elapsedMs)`, disable all buttons immediately (prevent double-submit).
4. On `time_up` event: grey out buttons, show "Waiting for results…"
5. On receiving a `result` broadcast (teacher sends after collecting answers): highlight correct answer in green, wrong in red, show points earned.
6. `npm test && npm run build`

---

### G-04 · Live leaderboard
**Files:** `src/components/BattleLeaderboard.tsx`

**Steps:**
1. Leaderboard updates in real time using a Supabase DB subscription on the `battle_scores` table (migration 010 created this via Epic B):
   ```ts
   supabase
     .channel('leaderboard')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'battle_scores',
       filter: `battle_code=eq.${code}`,
     }, payload => updateLeaderboard(payload))
     .subscribe();
   ```
2. Sort by `score DESC`, then `answered_at ASC` (faster answer wins ties).
3. Animate rank changes — when a student moves up, slide their row upward (CSS `transition: transform 300ms ease`).
4. Show top 5 during battle; full list on battle end.
5. Teacher can end the battle early with an "End battle" button that broadcasts `{ type: 'battle_end' }` and navigates all students to the final leaderboard.
6. `npm test && npm run build`

---

### G-05 · Battle score persistence
**Files:** `src/app/api/battle/[code]/score/route.ts` (create if missing)

**Steps:**
1. Create `POST /api/battle/[code]/score`:
   ```ts
   // Body: { userId, questionId, answerId, correct: boolean, points: number, ms: number }
   // Insert into battle_scores (table from migration 010)
   ```
2. Call this from the teacher host after each question closes (teacher collects all `answer` broadcasts and POSTs scores server-side). This makes scores durable — not lost if a student refreshes.
3. On battle end, `GET /api/battle/[code]/score` returns the final leaderboard for the summary screen.
4. `npm test && npm run build`

---

### G-06 · Lobby — join flow
**Files:** `src/app/battle/[code]/page.tsx`, lobby UI

**Steps:**
1. Students arrive at `/battle/[code]` before the teacher starts. Show a lobby screen: "Waiting for [Teacher Name] to start the battle…" with a live roster of who has joined (subscribe to `presence` on the battle channel):
   ```ts
   channel.on('presence', { event: 'sync' }, () => {
     const state = channel.presenceState();
     setJoinedStudents(Object.values(state).flat());
   }).subscribe(async (status) => {
     if (status === 'SUBSCRIBED') {
       await channel.track({ userId, name: displayName });
     }
   });
   ```
2. Teacher lobby view shows the joined list and a **"Start Battle"** button (disabled until ≥1 student).
3. On "Start Battle": set `battles.started_at = now()` in DB, then broadcast the first question.
4. `npm test && npm run build`

**Acceptance:** Teacher starts battle → students see question → answer → leaderboard updates live → teacher ends → final leaderboard shown.

---

### G-07 · /exclusive marketing — link to live battle
**Files:** `src/app/exclusive/page.tsx`

**Steps:**
1. On `/exclusive`, the Lift Battles™ section currently has marketing copy. Add a real CTA:
   - For teachers: "Create a battle" → `/teacher` → class hub → Live battle tab
   - For students: "Join a battle" → input for battle code → `/battle/[code]`
2. If the user is not logged in, CTA goes to `/login?redirect=/exclusive`.
3. `npm test && npm run build`

---

## TASK GROUP H — LMS OAuth (Google Classroom first)

> **Context:** PR-SCOPE.md Epic A shows LMS integrations ✅ with stubs + CSV import. The Integrations tab exists at `/teacher/[id]` → Integrations. Google Classroom OAuth is the highest-value target (most schools use it).

### H-01 · Google Classroom OAuth — app registration docs
**Files:** `YOU-DO.md`, `src/app/api/integrations/google/callback/route.ts`

**Steps:**
1. Add to `YOU-DO.md` under a new "LMS OAuth" section:
   ```
   ## Google Classroom OAuth (operator setup)
   1. console.cloud.google.com → New project "sch00l"
   2. APIs & Services → Enable: Google Classroom API, Google People API
   3. OAuth consent screen: External, scopes:
      - .../auth/classroom.courses.readonly
      - .../auth/classroom.rosters.readonly
      - .../auth/classroom.coursework.students.readonly
   4. Credentials → OAuth 2.0 Client ID → Web application
      Redirect URI: https://sch00l.ai/api/integrations/google/callback
   5. Vercel env vars:
      GOOGLE_CLIENT_ID=...
      GOOGLE_CLIENT_SECRET=...
   ```
2. Confirm `src/app/api/integrations/google/callback/route.ts` exists (stub from Epic A). If not, create it (see H-02).
3. `npm run build`

---

### H-02 · Google OAuth flow — authorize + callback
**Files:** `src/app/api/integrations/google/authorize/route.ts`, `src/app/api/integrations/google/callback/route.ts`

**Steps:**
1. **Authorize route** (`GET`): Build the Google OAuth URL and redirect:
   ```ts
   const params = new URLSearchParams({
     client_id: process.env.GOOGLE_CLIENT_ID!,
     redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/google/callback`,
     response_type: 'code',
     scope: [
       'https://www.googleapis.com/auth/classroom.courses.readonly',
       'https://www.googleapis.com/auth/classroom.rosters.readonly',
     ].join(' '),
     access_type: 'offline',
     prompt: 'consent',
     state: teacherId, // so callback knows which teacher
   });
   return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
   ```
2. **Callback route** (`GET`): Exchange `code` for tokens:
   ```ts
   const { code, state: teacherId } = searchParams;
   const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
     method: 'POST',
     body: new URLSearchParams({
       code,
       client_id: process.env.GOOGLE_CLIENT_ID!,
       client_secret: process.env.GOOGLE_CLIENT_SECRET!,
       redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/google/callback`,
       grant_type: 'authorization_code',
     }),
   });
   const tokens = await tokenRes.json();
   // Store encrypted tokens in integrations table (migration 010 has this)
   await supabase.from('integrations').upsert({
     teacher_id: teacherId,
     provider: 'google_classroom',
     access_token: encrypt(tokens.access_token),   // use existing AES-256-GCM util
     refresh_token: encrypt(tokens.refresh_token),
     expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
   });
   return Response.redirect(`/teacher/${teacherId}?tab=integrations&connected=google`);
   ```
3. Never store tokens in plaintext — use the existing AES-256-GCM encryption util from the codebase.
4. `npm test && npm run build`

---

### H-03 · Google Classroom sync — import courses + roster
**Files:** `src/app/api/integrations/google/sync/route.ts` (create)

**Steps:**
1. `POST /api/integrations/google/sync` — body: `{ teacherId }`:
   ```ts
   // 1. Fetch stored tokens (decrypt)
   // 2. GET https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE
   // 3. For each course, GET .../students
   // 4. Upsert into classrooms + classroom_members tables
   // 5. Return { coursesImported: N, studentsImported: M }
   ```
2. Token refresh: if `expires_at` is past, use `refresh_token` to get a new `access_token` before calling the API. Update the DB with the new token.
3. Handle `401` from Google (token revoked) by marking the integration as `status: 'disconnected'` and returning a clear error to the UI.
4. `npm test && npm run build`

---

### H-04 · Integrations tab UI — connect + sync buttons
**Files:** `src/app/teacher/[id]/page.tsx` or `src/components/ClassroomHub.tsx` (Integrations tab)

**Steps:**
1. In the Integrations tab, show a **Google Classroom** card:
   - Not connected: "Connect Google Classroom" button → `GET /api/integrations/google/authorize?teacherId={id}`
   - Connected: green "✓ Connected" badge + "Sync now" button + "Disconnect" button + last-synced timestamp
2. On `?tab=integrations&connected=google` (redirect from callback): show a success toast "Google Classroom connected!"
3. "Sync now" button calls `POST /api/integrations/google/sync`, shows a loading spinner, then displays `"Imported X courses, Y students"`.
4. "Disconnect" button: deletes the integration row from DB and resets card to "not connected" state.
5. Below Google Classroom, show the other LMS cards (Canvas, Schoology, etc.) as "Coming soon" — consistent with what's already there from Epic A stubs.
6. `npm test && npm run build`

**Acceptance:** Teacher clicks "Connect Google Classroom" → completes OAuth → lands back on Integrations tab with green badge → clicks "Sync now" → sees imported courses in their classroom list.

---

### H-05 · Canvas OAuth (stub → working)
**Files:** `src/app/api/integrations/canvas/`, `YOU-DO.md`

**Steps:**
1. Canvas uses per-institution OAuth (each school has their own Canvas domain). Add a UI input: "Canvas domain (e.g. myschool.instructure.com)".
2. Authorize route: redirect to `https://{canvasDomain}/login/oauth2/auth?client_id=...&redirect_uri=...&response_type=code`
3. Callback route: same pattern as H-02 but against Canvas token endpoint.
4. Add Canvas env vars to `YOU-DO.md`:
   ```
   CANVAS_CLIENT_ID=...
   CANVAS_CLIENT_SECRET=...
   (Canvas apps registered per-institution at your school's Canvas admin)
   ```
5. Sync route: `GET /api/v1/courses` + `/api/v1/courses/:id/enrollments` from Canvas REST API.
6. `npm test && npm run build`

> **Note:** Canvas requires institutional approval. The stub gives teachers a "Request Canvas integration" form that emails `hello@sch00l.ai` until you have an approved Canvas developer key.

---

### H-06 · E2E — integrations tab renders
**Files:** `e2e/integrations.spec.ts`

**Steps:**
1. Create `e2e/integrations.spec.ts`:
   ```ts
   test('integrations tab renders without crash', async ({ page }) => {
     // Navigate as teacher (use test session or bypass auth for this check)
     await page.goto('/teacher/test-id?tab=integrations');
     await expect(page).not.toHaveURL(/error/);
     await expect(page.locator('text=Google Classroom')).toBeVisible();
   });

   test('authorize redirects to Google when env vars set', async ({ request }) => {
     const res = await request.get(
       '/api/integrations/google/authorize?teacherId=test',
       { maxRedirects: 0 }
     );
     // In test env without keys: 503 or redirect — either is fine, not a crash
     expect([302, 503]).toContain(res.status());
   });
   ```
2. `npm run test:e2e`

---

## Execution order

| Priority | Task | Est. effort |
|----------|------|-------------|
| 🔴 P0 | F-04 Migration 013 (create file + YOU-DO note) | 15 min |
| 🔴 P0 | F-01 LS webhook handler | 45 min |
| 🔴 P0 | F-02 Checkout session route | 30 min |
| 🔴 P0 | F-03 Pro gate + /pricing CTA | 45 min |
| 🟡 P1 | G-01 Realtime channel helpers | 30 min |
| 🟡 P1 | G-06 Lobby presence | 45 min |
| 🟡 P1 | G-02 Teacher host broadcast UI | 1 hr |
| 🟡 P1 | G-03 Student answer UI | 1 hr |
| 🟡 P1 | G-04 Live leaderboard | 45 min |
| 🟡 P1 | G-05 Score persistence API | 30 min |
| 🟢 P2 | H-01 Google OAuth operator docs | 15 min |
| 🟢 P2 | H-02 Google authorize + callback routes | 1 hr |
| 🟢 P2 | H-03 Google sync route | 1 hr |
| 🟢 P2 | H-04 Integrations tab UI | 45 min |
| ⚪ P3 | G-07 /exclusive CTA update | 15 min |
| ⚪ P3 | H-05 Canvas OAuth stub | 45 min |
| ⚪ P3 | F-05 Checkout E2E | 20 min |
| ⚪ P3 | H-06 Integrations E2E | 20 min |

---

## Hard constraints (same as always)

- **Migrations 001–012:** Already applied. Only create NEW files (013+). Never re-run existing.
- **Sign-out:** `POST /api/auth/signout` + local `supabase.auth.signOut()` + 3s timeout + `window.location.replace('/')`. No bare `signOut({ scope: 'global' })`.
- **Secrets:** LS API key, Google client secret, Canvas client secret — server-side only via `process.env`. Never in client bundles.
- **Encryption:** OAuth tokens stored encrypted (AES-256-GCM, same util used elsewhere in the codebase).
- **Discussion is not missing:** exists at `/my-classes` → `/class/{id}?tab=forum` and teacher Forum tab. Do not touch.
- **Test gate:** `npm test && npm run build && npm run test:e2e` before every push.
- **Pilot teacher:** `hello@sch00l.ai` / `9FW69A` — manual QA only, never hardcoded.
