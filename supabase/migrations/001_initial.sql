-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  grade_level text,
  created_at timestamptz not null default now()
);

-- Waitlist (landing page)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'landing',
  referral text,
  created_at timestamptz not null default now()
);

-- Aggregated stats per student
create table if not exists public.student_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  streak_days int not null default 0,
  last_study_date date,
  total_minutes int not null default 0,
  total_sessions int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  message_count int not null default 0,
  minutes_studied int not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mastery_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  topic text not null,
  confidence int not null default 20 check (confidence between 0 and 100),
  last_practiced timestamptz not null default now(),
  unique (user_id, subject, topic)
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  front text not null,
  back text not null,
  ease_factor float not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  subject text not null,
  topic text,
  phase text not null check (phase in ('pre', 'post')),
  score int not null,
  total int not null,
  answers jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  insert into public.student_stats (user_id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.waitlist enable row level security;
alter table public.student_stats enable row level security;
alter table public.study_sessions enable row level security;
alter table public.mastery_topics enable row level security;
alter table public.flashcards enable row level security;
alter table public.quiz_results enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "waitlist_insert_public" on public.waitlist for insert with check (true);

create policy "stats_select_own" on public.student_stats for select using (auth.uid() = user_id);
create policy "stats_update_own" on public.student_stats for update using (auth.uid() = user_id);
create policy "stats_insert_own" on public.student_stats for insert with check (auth.uid() = user_id);

create policy "sessions_all_own" on public.study_sessions for all using (auth.uid() = user_id);
create policy "mastery_all_own" on public.mastery_topics for all using (auth.uid() = user_id);
create policy "flashcards_all_own" on public.flashcards for all using (auth.uid() = user_id);
create policy "quiz_all_own" on public.quiz_results for all using (auth.uid() = user_id);

create index if not exists idx_flashcards_review on public.flashcards (user_id, next_review_at);
create index if not exists idx_sessions_user on public.study_sessions (user_id, created_at desc);
