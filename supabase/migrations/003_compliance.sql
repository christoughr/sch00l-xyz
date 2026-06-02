-- Compliance: age gate, consent, onboarding (run after 002)

alter table public.profiles
  add column if not exists birth_year int,
  add column if not exists is_under_13 boolean not null default false,
  add column if not exists parental_consent_at timestamptz,
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists onboarding_complete boolean not null default false;

alter table public.waitlist
  add column if not exists is_edu boolean not null default false;

-- Teachers can see limited student profile fields in their classes (already via profiles policy)
