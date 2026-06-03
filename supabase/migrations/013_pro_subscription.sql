-- Pro subscription columns (run after 001–012)
alter table public.profiles
  add column if not exists ls_subscription_id text,
  add column if not exists ls_order_id text;

create index if not exists idx_profiles_is_pro on public.profiles (is_pro) where is_pro = true;
