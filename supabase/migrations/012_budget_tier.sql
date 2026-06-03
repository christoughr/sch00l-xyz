-- Optional: store tutor budget preference on requests (run after 001–011)
alter table public.tutor_requests
  add column if not exists budget_tier text
    check (budget_tier in ('budget', 'standard', 'premium', 'urgent'));

alter table public.tutor_requests
  add column if not exists rate_min integer;

alter table public.tutor_requests
  add column if not exists rate_max integer;
