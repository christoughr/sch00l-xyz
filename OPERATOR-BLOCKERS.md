# What only you can do (credentials & Google)

Everything else has been automated in the repo and production DB.

## Lemon Squeezy — payments not live yet

Production Vercel has **no** `LEMONSQUEEZY_*` env vars. Code is ready; checkout returns 503 until you add:

```bash
vercel env add LEMONSQUEEZY_API_KEY production
vercel env add LEMONSQUEEZY_STORE_ID production
vercel env add LEMONSQUEEZY_VARIANT_PRO production
vercel env add LEMONSQUEEZY_WEBHOOK_SECRET production
# optional tutor hour:
vercel env add LEMONSQUEEZY_VARIANT_TUTOR production
```

Then redeploy. Webhook URL: `https://sch00l.ai/api/lemonsqueezy/webhook`

Run `013_pro_subscription.sql` in Supabase if not already.

## Google Classroom — public launch

Google OAuth **is** on Vercel (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Teachers in **Testing** mode work.

To allow any teacher: record the demo (script in [GOOGLE_CLASSROOM_LAUNCH.md](./GOOGLE_CLASSROOM_LAUNCH.md)) and submit Google Verification Center — only you can click Submit in Google Cloud Console.

## More publisher PDFs (e.g. AP Calc AB ingest)

No `ap-calc-ab` PDF found in `content/ingest/` or Downloads. After you drop licensed PDFs:

```bash
node scripts/ingest-licensed-pdf.mjs --track ap-calc-ab
# Paste drafts.sql in Supabase → Paste 3 publish → 
npx tsx scripts/polish-ap-calc-ab-lessons.ts
```

## Done for you (no action)

- Editorial audit: **0** lessons flagged (59 seeds expanded, 3 extract lessons cleaned)
- Competitor names removed from marketing UI (Piazza, Kahoot, etc.)
- AP Calc AB seed live (15 lessons)
