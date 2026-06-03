-- Pro subscriptions (Stripe webhook updates this)
alter table public.profiles
  add column if not exists is_pro boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists pro_since timestamptz;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  email text,
  user_id uuid references public.profiles (id) on delete set null,
  plan text not null,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
