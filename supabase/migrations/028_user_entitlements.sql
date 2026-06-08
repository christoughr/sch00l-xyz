-- Per-user entitlements: membership, curriculum libraries, individual tracks, bundle

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('membership', 'curriculum', 'track', 'bundle')),
  curriculum_id text,
  track_id text,
  billing_interval text check (billing_interval in ('monthly', 'annual')),
  ls_subscription_id text,
  ls_variant_id text,
  active boolean not null default true,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_entitlements_active_scope
  on public.user_entitlements (
    user_id,
    kind,
    coalesce(curriculum_id, ''),
    coalesce(track_id, '')
  )
  where active = true;

create index if not exists user_entitlements_user_active_idx
  on public.user_entitlements (user_id)
  where active = true;

create index if not exists user_entitlements_ls_sub_idx
  on public.user_entitlements (ls_subscription_id)
  where ls_subscription_id is not null;

alter table public.profiles
  add column if not exists has_membership boolean not null default false;

comment on table public.user_entitlements is
  'Paid access: membership seat, per-curriculum library, per-track, or all-in-one bundle';
