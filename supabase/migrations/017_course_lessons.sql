-- Khan-style structured lessons per study track (run after 016)
-- Content is ingested from licensed PDFs / OER; not scraped.

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

create policy "course_units_public_read" on public.course_units
  for select using (true);

create policy "course_lessons_public_read" on public.course_lessons
  for select using (review_status = 'published');
