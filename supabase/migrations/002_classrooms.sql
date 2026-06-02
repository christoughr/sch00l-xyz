-- Classrooms + teacher dashboard (run after 001_initial.sql)

alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'teacher'));

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  join_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.classroom_members (
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (classroom_id, user_id)
);

create index if not exists idx_classrooms_teacher on public.classrooms (teacher_id);
create index if not exists idx_members_user on public.classroom_members (user_id);

alter table public.classrooms enable row level security;
alter table public.classroom_members enable row level security;

-- Classrooms: teachers manage own
create policy "classrooms_teacher_select" on public.classrooms
  for select using (auth.uid() = teacher_id);
create policy "classrooms_teacher_insert" on public.classrooms
  for insert with check (auth.uid() = teacher_id);
create policy "classrooms_teacher_update" on public.classrooms
  for update using (auth.uid() = teacher_id);
create policy "classrooms_teacher_delete" on public.classrooms
  for delete using (auth.uid() = teacher_id);

-- Join by code uses server API (service role) — no public classroom listing

-- Members
create policy "members_select" on public.classroom_members
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.classrooms c
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );
create policy "members_insert_self" on public.classroom_members
  for insert with check (auth.uid() = user_id);

-- Teachers read student stats in their classes
create policy "stats_teacher_classroom" on public.student_stats
  for select using (
    exists (
      select 1 from public.classroom_members cm
      join public.classrooms c on c.id = cm.classroom_id
      where cm.user_id = student_stats.user_id and c.teacher_id = auth.uid()
    )
  );

create policy "sessions_teacher_classroom" on public.study_sessions
  for select using (
    exists (
      select 1 from public.classroom_members cm
      join public.classrooms c on c.id = cm.classroom_id
      where cm.user_id = study_sessions.user_id and c.teacher_id = auth.uid()
    )
  );

create policy "quiz_teacher_classroom" on public.quiz_results
  for select using (
    exists (
      select 1 from public.classroom_members cm
      join public.classrooms c on c.id = cm.classroom_id
      where cm.user_id = quiz_results.user_id and c.teacher_id = auth.uid()
    )
  );

-- Teachers read member emails (profiles)
create policy "profiles_teacher_students" on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.classroom_members cm
      join public.classrooms c on c.id = cm.classroom_id
      where cm.user_id = profiles.id and c.teacher_id = auth.uid()
    )
  );

-- Waitlist: teachers/admins with service role only; add read for teachers via env-gated API
