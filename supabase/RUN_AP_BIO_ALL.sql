-- =============================================================================
-- AP BIOLOGY — ALL-IN-ONE (run in Supabase SQL Editor, top to bottom)
-- You already ran 015 + 016 — skip those unless tables are missing.
-- =============================================================================

-- PART A — 017 course tables (safe if already run)
create table if not exists public.course_units (
  id uuid primary key default gen_random_uuid(),
  track_id text not null,
  ord int not null default 1,
  title text not null,
  description text,
  unique (track_id, ord)
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.course_units (id) on delete cascade,
  ord int not null default 1,
  title text not null,
  objectives jsonb not null default '[]'::jsonb,
  body_markdown text not null default '',
  video_url text,
  source_pdf_name text,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'review', 'published')),
  unique (unit_id, ord)
);

create index if not exists idx_course_units_track on public.course_units (track_id);
create index if not exists idx_course_lessons_unit on public.course_lessons (unit_id);

alter table public.course_units enable row level security;
alter table public.course_lessons enable row level security;

drop policy if exists "course_units_public_read" on public.course_units;
create policy "course_units_public_read" on public.course_units
  for select using (true);

drop policy if exists "course_lessons_public_read" on public.course_lessons;
create policy "course_lessons_public_read" on public.course_lessons
  for select using (review_status = 'published');

-- PART B — 018: paste full contents of supabase/migrations/018_seed_ap_bio_course.sql below this line
-- (15 published lessons — re-running is safe)

-- PART C — Clear old publisher drafts before re-insert
delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-bio')
  and ord >= 100;

-- PART D — PASTE ENTIRE FILE HERE (too large for one chat message):
--   content/ingest/ap-bio/out/drafts.sql
-- (~96 INSERTs from your PDF/EPUB/MOBI)

-- PART E — Publish ALL publisher drafts at once
update public.course_lessons
set review_status = 'published'
where unit_id in (select id from public.course_units where track_id = 'ap-bio')
  and review_status = 'draft'
  and ord >= 100;

-- Verify counts
select review_status, count(*) from public.course_lessons cl
join public.course_units cu on cu.id = cl.unit_id
where cu.track_id = 'ap-bio'
group by review_status;
