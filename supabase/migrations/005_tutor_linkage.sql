-- Human tutor linkage: student requests + tutor applications

create table if not exists public.tutor_applications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  display_name text not null,
  subjects text[] not null default '{}',
  bio text,
  credentials text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists tutor_applications_status
  on public.tutor_applications (status, created_at desc);

create table if not exists public.tutor_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  student_email text,
  subject text not null,
  topic text,
  session_summary text,
  pre_score int,
  post_score int,
  urgency text not null default 'normal'
    check (urgency in ('normal', 'before_test')),
  status text not null default 'open'
    check (status in ('open', 'matched', 'closed')),
  classroom_id uuid references public.classrooms (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists tutor_requests_status
  on public.tutor_requests (status, created_at desc);

alter table public.tutor_applications enable row level security;
alter table public.tutor_requests enable row level security;

-- Service role API only (no direct client access)
