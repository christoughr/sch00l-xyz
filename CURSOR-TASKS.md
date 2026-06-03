# CURSOR-TASKS.md — sch00l.ai

See [HANDOFF.md](./HANDOFF.md) for context. Tasks A–E from Claude audit; execution tracked in git.

**Gate:** `npm test && npm run build && npm run test:e2e` (port 3099)

**Never:** re-run migrations 001–011 | bare `signOut({ scope: 'global' })` without timeout

---

## Status (2026-06-03)

| ID | Task | Status |
|----|------|--------|
| A-01 | Mobile nav completeness | ✅ |
| A-02 | Auth error states | ✅ |
| A-03 | Subject/track picker mobile | ✅ |
| A-04 | Age gate / onboarding | ✅ |
| B-01 | Student discussion path | ✅ |
| B-02 | Teacher forum tab + badge | ✅ |
| B-03 | ClassDiscussionBanner | ✅ |
| C-01 | Tutor pricing ranges | ✅ (already) |
| C-02 | Budget tier + migration 012 | ✅ |
| C-03 | Pricing page accordion | ✅ |
| D-01 | Teacher roster exclusion | ✅ (already) |
| D-02 | Dashboard stat tooltip | ✅ |
| D-03 | Sign-out safety + E2E | ✅ |
| E-01 | Checkout graceful 503 | ✅ (already) |
| E-02 | YOU-DO.md | ✅ |
| E-03 | E2E forum/pricing/signout | ✅ |

Full task specs preserved in git history; see Claude-generated download for original snippets.
