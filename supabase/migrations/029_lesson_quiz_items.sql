-- Lesson-linked prep quiz bank (MCQs tied to course_lessons)

create table if not exists public.lesson_quiz_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons (id) on delete cascade,
  ord int not null default 1,
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation text,
  unique (lesson_id, ord)
);

create index if not exists idx_lesson_quiz_items_lesson on public.lesson_quiz_items (lesson_id);

alter table public.lesson_quiz_items enable row level security;

create policy "lesson_quiz_public_read" on public.lesson_quiz_items
  for select using (
    exists (
      select 1
      from public.course_lessons cl
      where cl.id = lesson_quiz_items.lesson_id
        and cl.review_status = 'published'
    )
  );
