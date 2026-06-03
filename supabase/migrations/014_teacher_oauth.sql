-- Teacher-level OAuth tokens (Google Classroom, Canvas)
create table if not exists public.teacher_integrations (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null check (provider in ('google_classroom', 'canvas')),
  access_token_enc text,
  refresh_token_enc text,
  expires_at timestamptz,
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'error')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_id, provider)
);

alter table public.teacher_integrations enable row level security;

create policy "teacher_integrations_own" on public.teacher_integrations
  for all using (teacher_id = auth.uid());
