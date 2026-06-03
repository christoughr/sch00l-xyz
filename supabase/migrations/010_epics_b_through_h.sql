-- Epics B–H: battles, forums, docs, practice tests, integrations, admin, growth
-- Run after 009_lms_extensions.sql

-- A10 announcements
create table if not exists public.classroom_announcements (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- B: Live battles
create table if not exists public.live_battles (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  room_code text not null unique,
  study_track_id text,
  section_id text,
  status text not null default 'lobby' check (status in ('lobby', 'active', 'finished')),
  homework_mode boolean not null default false,
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.battle_participants (
  battle_id uuid not null references public.live_battles (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  display_name text not null,
  total_score int not null default 0,
  joined_at timestamptz not null default now(),
  primary key (battle_id, display_name)
);

create table if not exists public.battle_questions (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.live_battles (id) on delete cascade,
  ord int not null,
  prompt text not null,
  choices jsonb not null,
  correct_index int not null
);

create table if not exists public.battle_answers (
  battle_id uuid not null references public.live_battles (id) on delete cascade,
  display_name text not null,
  question_id uuid not null references public.battle_questions (id) on delete cascade,
  choice_index int not null,
  correct boolean not null,
  points int not null default 0,
  answered_at timestamptz not null default now(),
  primary key (battle_id, display_name, question_id)
);

-- C: Forums
create table if not exists public.classroom_threads (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid references public.classrooms (id) on delete cascade,
  teacher_lounge boolean not null default false,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  unit_section text,
  pinned boolean not null default false,
  locked boolean not null default false,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.classroom_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

-- D: Peer notes + plagiarism + DMCA
create table if not exists public.peer_notes (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.plagiarism_checks (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  submitter_id uuid not null references public.profiles (id) on delete cascade,
  text_sample text not null,
  similarity_score numeric(5, 2),
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.dmca_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_email text not null,
  content_url text,
  description text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

-- E: Practice tests + item bank
create table if not exists public.practice_tests (
  id text primary key,
  label text not null,
  exam_family text not null,
  region text not null default 'global',
  duration_minutes int not null,
  section_count int not null default 1
);

create table if not exists public.practice_items (
  id uuid primary key default gen_random_uuid(),
  test_id text not null references public.practice_tests (id) on delete cascade,
  section_ord int not null default 1,
  prompt text not null,
  choices jsonb not null,
  correct_index int not null,
  skill_tag text,
  difficulty text not null default 'standard'
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  test_id text not null references public.practice_tests (id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  score int,
  total int,
  weak_tags jsonb
);

-- G: Orgs, audit, parent access, compliance
create table if not exists public.school_orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  sso_provider text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.parent_access (
  id uuid primary key default gen_random_uuid(),
  student_user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.user_compliance (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  birth_year int,
  ferpa_ok boolean not null default false,
  coppa_parent_email text,
  retention_days int not null default 365
);

-- Platform integrations (Google Classroom, Canvas, etc.)
create table if not exists public.platform_connections (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in (
    'google_classroom', 'canvas', 'schoology', 'microsoft_teams',
    'blackboard', 'moodle', 'clever', 'classdojo', 'remind', 'edmodo', 'infinite_campus'
  )),
  external_course_id text,
  sync_enabled boolean not null default true,
  last_sync_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (classroom_id, platform)
);

-- H: Marketplace templates
create table if not exists public.marketplace_templates (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  study_track_id text,
  price_cents int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_battles_classroom on public.live_battles (classroom_id);
create index if not exists idx_threads_classroom on public.classroom_threads (classroom_id);
create index if not exists idx_practice_items_test on public.practice_items (test_id);
create index if not exists idx_platform_classroom on public.platform_connections (classroom_id);

-- RLS
alter table public.classroom_announcements enable row level security;
alter table public.live_battles enable row level security;
alter table public.battle_participants enable row level security;
alter table public.battle_questions enable row level security;
alter table public.battle_answers enable row level security;
alter table public.classroom_threads enable row level security;
alter table public.thread_posts enable row level security;
alter table public.peer_notes enable row level security;
alter table public.plagiarism_checks enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.platform_connections enable row level security;
alter table public.marketplace_templates enable row level security;
alter table public.parent_access enable row level security;

-- Teacher owns classroom resources
create policy "announcements_teacher" on public.classroom_announcements for all using (
  exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
);
create policy "announcements_student_read" on public.classroom_announcements for select using (
  exists (select 1 from public.classroom_members cm where cm.classroom_id = classroom_announcements.classroom_id and cm.user_id = auth.uid())
);

create policy "battles_teacher" on public.live_battles for all using (
  exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
);
create policy "battles_read_members" on public.live_battles for select using (true);

create policy "battle_parts_all" on public.battle_participants for all using (true) with check (true);
create policy "battle_q_read" on public.battle_questions for select using (true);
create policy "battle_q_teacher_write" on public.battle_questions for all using (
  exists (select 1 from public.live_battles b join public.classrooms c on c.id = b.classroom_id where b.id = battle_id and c.teacher_id = auth.uid())
);
create policy "battle_ans_all" on public.battle_answers for all using (true) with check (true);

create policy "threads_class" on public.classroom_threads for all using (
  teacher_lounge = false and (
    exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
    or exists (select 1 from public.classroom_members cm where cm.classroom_id = classroom_threads.classroom_id and cm.user_id = auth.uid())
  )
  or (teacher_lounge = true and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'))
);
create policy "posts_thread" on public.thread_posts for all using (
  exists (select 1 from public.classroom_threads t where t.id = thread_id)
);

create policy "peer_notes_class" on public.peer_notes for all using (
  exists (select 1 from public.classroom_members cm where cm.classroom_id = peer_notes.classroom_id and cm.user_id = auth.uid())
  or exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
);

create policy "plagiarism_class" on public.plagiarism_checks for all using (
  submitter_id = auth.uid()
  or exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
);

create policy "practice_attempts_own" on public.practice_attempts for all using (auth.uid() = user_id);
create policy "platform_teacher" on public.platform_connections for all using (
  exists (select 1 from public.classrooms c where c.id = classroom_id and c.teacher_id = auth.uid())
);
create policy "marketplace_read" on public.marketplace_templates for select using (published = true or teacher_id = auth.uid());
create policy "marketplace_write" on public.marketplace_templates for all using (teacher_id = auth.uid());
create policy "parent_token_read" on public.parent_access for select using (true);

-- Seed practice tests
insert into public.practice_tests (id, label, exam_family, region, duration_minutes, section_count) values
  ('sat-digital', 'SAT Digital', 'SAT', 'US', 134, 2),
  ('act', 'ACT', 'ACT', 'US', 175, 4),
  ('ap-bio-mcq', 'AP Biology MCQ', 'AP', 'US', 90, 1),
  ('ib-sl-math', 'IB Math SL', 'IB', 'global', 90, 1),
  ('igcse-math', 'IGCSE Mathematics', 'IGCSE', 'UK/international', 120, 2),
  ('a-level-math', 'A-Level Mathematics', 'A-Level', 'UK', 120, 1),
  ('jee-main', 'JEE Main', 'JEE', 'India', 180, 3),
  ('neet', 'NEET', 'NEET', 'India', 200, 1),
  ('gaokao-math', 'Gaokao Mathematics', 'Gaokao', 'China', 120, 1),
  ('mcat-sample', 'MCAT Sample', 'MCAT', 'US/global', 95, 1),
  ('lsat-sample', 'LSAT Sample', 'LSAT', 'US', 35, 1),
  ('gmat-quant', 'GMAT Quant', 'GMAT', 'global', 62, 1),
  ('gre-verbal', 'GRE Verbal', 'GRE', 'global', 30, 1),
  ('nclex-rn', 'NCLEX-RN Sample', 'NCLEX', 'US', 60, 1),
  ('hsc-nsw', 'HSC NSW', 'HSC', 'Australia', 90, 1)
on conflict (id) do nothing;
