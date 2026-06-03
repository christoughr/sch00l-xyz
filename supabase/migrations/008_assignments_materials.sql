-- Assignments, materials, per-student targets (run after 002_classrooms.sql)

create table if not exists public.classroom_assignments (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  study_track_id text,
  topic text,
  due_at timestamptz,
  assign_to_all boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_targets (
  assignment_id uuid not null references public.classroom_assignments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  primary key (assignment_id, user_id)
);

create table if not exists public.classroom_materials (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  byte_size int,
  created_at timestamptz not null default now()
);

create index if not exists idx_assignments_classroom on public.classroom_assignments (classroom_id);
create index if not exists idx_materials_classroom on public.classroom_materials (classroom_id);

alter table public.classroom_assignments enable row level security;
alter table public.assignment_targets enable row level security;
alter table public.classroom_materials enable row level security;

create policy "assignments_teacher_all" on public.classroom_assignments
  for all using (
    exists (
      select 1 from public.classrooms c
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );

create policy "assignment_targets_teacher" on public.assignment_targets
  for all using (
    exists (
      select 1 from public.classroom_assignments a
      join public.classrooms c on c.id = a.classroom_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
  );

create policy "assignments_student_select" on public.classroom_assignments
  for select using (
    assign_to_all and exists (
      select 1 from public.classroom_members cm
      where cm.classroom_id = classroom_assignments.classroom_id
        and cm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.assignment_targets t
      where t.assignment_id = classroom_assignments.id and t.user_id = auth.uid()
    )
  );

create policy "assignment_targets_student_select" on public.assignment_targets
  for select using (auth.uid() = user_id);

create policy "materials_teacher_all" on public.classroom_materials
  for all using (
    exists (
      select 1 from public.classrooms c
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );

create policy "materials_student_select" on public.classroom_materials
  for select using (
    exists (
      select 1 from public.classroom_members cm
      where cm.classroom_id = classroom_materials.classroom_id
        and cm.user_id = auth.uid()
    )
  );
