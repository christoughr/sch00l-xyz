# Lemon Squeezy SKUs — sch00l.ai

Store is **activated**. Create products in the [Lemon Squeezy dashboard](https://app.lemonsqueezy.com), then paste variant IDs into Vercel env (or `.env.local`).

## Already wired (minimum to go live)

| Env var | Product |
|---------|---------|
| `LEMONSQUEEZY_API_KEY` | API key |
| `LEMONSQUEEZY_STORE_ID` | Store ID |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Webhook signing secret → `https://sch00l.ai/api/lemonsqueezy/webhook` |
| `LEMONSQUEEZY_VARIANT_PRO` | **All-in-one bundle (monthly)** — legacy alias, maps to bundle |
| `LEMONSQUEEZY_VARIANT_TUTOR` | Human tutor — 1 hour |

## ⭐ Create later (full catalog)

Match prices in `src/lib/pricing.ts`. Suggested product names in Lemon Squeezy:

### Membership (required seat)

| Env var | Price |
|---------|-------|
| `LEMONSQUEEZY_VARIANT_MEMBERSHIP_MONTHLY` | $149/mo |
| `LEMONSQUEEZY_VARIANT_MEMBERSHIP_ANNUAL` | $1,490/yr |

### All-in-one bundle

| Env var | Price |
|---------|-------|
| `LEMONSQUEEZY_VARIANT_BUNDLE_MONTHLY` | $2,499/mo |
| `LEMONSQUEEZY_VARIANT_BUNDLE_ANNUAL` | $24,990/yr |

### Per curriculum (each library priced separately)

| Curriculum | Monthly env | Annual env | Monthly | Annual |
|------------|-------------|------------|---------|--------|
| AP | `LEMONSQUEEZY_VARIANT_CURRICULUM_AP_MONTHLY` | `..._ANNUAL` | $349 | $3,490 |
| SAT / ACT | `..._SAT_ACT_...` | | $299 | $2,990 |
| Exam prep | `..._EXAM_PREP_...` | | $399 | $3,990 |
| College | `..._COLLEGE_...` | | $379 | $3,790 |
| K-12 | `..._K12_...` | | $249 | $2,490 |
| Languages | `..._LANGUAGES_...` | | $229 | $2,290 |
| International | `..._INTERNATIONAL_...` | | $279 | $2,790 |
| Professional | `..._PROFESSIONAL_...` | | $359 | $3,590 |

### Single course (any track)

| Env var | Price |
|---------|-------|
| `LEMONSQUEEZY_VARIANT_TRACK_MONTHLY` | $129/mo |
| `LEMONSQUEEZY_VARIANT_TRACK_ANNUAL` | $1,290/yr |

Pass `track_id` in checkout custom data when track-specific SKUs are added.

## Webhook entitlements

On `subscription_created` / `subscription_payment_success`, the webhook grants rows in `user_entitlements` from the variant ID:

- **membership** → `kind=membership`
- **curriculum** → `kind=curriculum` + `curriculum_id`
- **bundle** / `pro` → `kind=bundle` (+ `is_pro` on profile)
- **track** → `kind=track` + `track_id` from custom data

On `subscription_cancelled` / `subscription_expired`, entitlements for that `ls_subscription_id` are revoked.

## Checkout API body

```json
{
  "kind": "bundle",
  "interval": "annual"
}
```

Legacy: `{ "plan": "pro" }` still works (bundle monthly via `LEMONSQUEEZY_VARIANT_PRO`).
