-- LMS extensions: sections, material text, grades, storage (run after 008)

alter table public.classroom_assignments
  add column if not exists section_id text,
  add column if not exists material_id uuid references public.classroom_materials (id) on delete set null;

alter table public.classroom_materials
  add column if not exists extracted_text text,
  add column if not exists auto_track_id text,
  add column if not exists auto_section_id text;

create table if not exists public.assignment_grades (
  assignment_id uuid not null references public.classroom_assignments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  score numeric(5, 2),
  notes text,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, user_id)
);

create table if not exists public.classroom_imports (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  source text not null check (source in ('google_classroom', 'canvas_csv', 'canvas_cc')),
  row_count int not null default 0,
  emails jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.assignment_grades enable row level security;
alter table public.classroom_imports enable row level security;

create policy "grades_teacher_all" on public.assignment_grades
  for all using (
    exists (
      select 1 from public.classroom_assignments a
      join public.classrooms c on c.id = a.classroom_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
  );

create policy "grades_student_select" on public.assignment_grades
  for select using (auth.uid() = user_id);

create policy "imports_teacher_all" on public.classroom_imports
  for all using (
    exists (
      select 1 from public.classrooms c
      where c.id = classroom_id and c.teacher_id = auth.uid()
    )
  );

-- Supabase Storage bucket for homework / course files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'classroom-materials',
  'classroom-materials',
  false,
  10485760,
  array[
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

create policy "materials_storage_teacher_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'classroom-materials'
    and (storage.foldername (name))[1] in (
      select c.id::text from public.classrooms c where c.teacher_id = auth.uid()
    )
  );

create policy "materials_storage_teacher_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'classroom-materials'
    and (
      (storage.foldername (name))[1] in (
        select c.id::text from public.classrooms c where c.teacher_id = auth.uid()
      )
      or (storage.foldername (name))[1] in (
        select cm.classroom_id::text
        from public.classroom_members cm
        where cm.user_id = auth.uid()
      )
    )
  );

create policy "materials_storage_teacher_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'classroom-materials'
    and (storage.foldername (name))[1] in (
      select c.id::text from public.classrooms c where c.teacher_id = auth.uid()
    )
  );
