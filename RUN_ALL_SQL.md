# Run all SQL in Supabase (in order)

SQL Editor → paste each file → **Run** → then next.

1. `001_initial.sql` through `007_stripe_pro.sql` (if not already)
2. `008_assignments_materials.sql`
3. `009_lms_extensions.sql`
4. `010_epics_b_through_h.sql`
5. `011_practice_tests_public_read.sql` (optional if practice list empty errors)
6. `012_budget_tier.sql` (optional — tutor request budget tier columns)
7. `013_pro_subscription.sql` — Lemon Squeezy columns on `profiles` (run before LS webhook live)
8. `014_teacher_oauth.sql` — `teacher_integrations` for Google/Canvas OAuth tokens
9. `015_study_content.sql` — assignment completions + practice question seeds
10. `016_daily_ai_usage.sql` — server-side free-tier AI session counter (logged-in users)
11. `017_course_lessons.sql` — structured units/lessons per track (Khan-style; fill via PDF ingestion)
12. `018_seed_ap_bio_course.sql` — 15 published AP Biology lessons (original content; run after 017)

After step 4 you get: assignments, uploads, battles, forums, practice tests, integrations, gradebook, parent links, marketplace, announcements.
