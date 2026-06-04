-- Server-side free-tier AI session counter (run after 015)

create table if not exists public.daily_ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  usage_date date not null default (timezone('utc', now()))::date,
  session_count int not null default 0 check (session_count >= 0),
  primary key (user_id, usage_date)
);

create index if not exists idx_daily_ai_usage_date on public.daily_ai_usage (usage_date);

alter table public.daily_ai_usage enable row level security;

create policy "daily_ai_usage_own" on public.daily_ai_usage
  for all using (auth.uid() = user_id);
