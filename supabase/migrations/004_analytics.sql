-- Anonymous product analytics (server writes via service role)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  event_name text not null,
  props jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_name_created
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_session
  on public.analytics_events (session_id);

alter table public.analytics_events enable row level security;

-- No public read/write; API uses service role only
