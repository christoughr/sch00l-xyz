-- Assignment completions + curated practice question banks (run after 010)
-- Safe for Supabase SQL Editor: one row per INSERT, jsonb casts, no special Unicode.

create table if not exists public.assignment_completions (
  assignment_id uuid not null references public.classroom_assignments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  completed_at timestamptz not null default now(),
  pre_score int,
  post_score int,
  primary key (assignment_id, user_id)
);

create index if not exists idx_assignment_completions_user
  on public.assignment_completions (user_id);

alter table public.assignment_completions enable row level security;

drop policy if exists "assignment_completions_student_own" on public.assignment_completions;
create policy "assignment_completions_student_own" on public.assignment_completions
  for all using (auth.uid() = user_id);

drop policy if exists "assignment_completions_teacher_read" on public.assignment_completions;
create policy "assignment_completions_teacher_read" on public.assignment_completions
  for select using (
    exists (
      select 1 from public.classroom_assignments a
      join public.classrooms c on c.id = a.classroom_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
  );

-- Optional: clear partial seed from a failed run
-- delete from public.practice_items where test_id in ('ap-bio-mcq','sat-digital','act','neet','mcat-sample');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 1, 'Which organelle is primarily responsible for ATP synthesis via oxidative phosphorylation?', '["Ribosome","Mitochondrion","Golgi apparatus","Lysosome"]'::jsonb, 1, 'cells', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 1, 'A cell placed in a hypertonic solution will most likely:', '["Lyse","Swell","Shrink","Divide immediately"]'::jsonb, 2, 'cells', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 2, 'During DNA replication, which enzyme joins Okazaki fragments?', '["Helicase","Primase","DNA ligase","Topoisomerase"]'::jsonb, 2, 'genetics', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 2, 'A heterozygous tall pea plant (Tt) crossed with homozygous short (tt). Expected phenotypic ratio?', '["All tall","3 tall : 1 short","1 tall : 1 short","All short"]'::jsonb, 2, 'genetics', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 3, 'Natural selection acts directly on:', '["Genotype frequency only","Phenotype variation","Mutation rate","Species number"]'::jsonb, 1, 'evolution', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 4, 'In a food web, about 10 percent of energy passes to the next trophic level because:', '["Energy is created at each level","Most energy is lost as heat during metabolism","Producers store all energy","Consumers eat 90 percent of biomass"]'::jsonb, 1, 'ecology', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 1, 'The central dogma of molecular biology is:', '["Protein to RNA to DNA","DNA to RNA to Protein","RNA to DNA to Lipid","DNA to Protein to RNA"]'::jsonb, 1, 'genetics', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('ap-bio-mcq', 3, 'Hardy-Weinberg equilibrium assumes NO:', '["Large population","Random mating","Natural selection","Equal allele frequencies"]'::jsonb, 2, 'evolution', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('sat-digital', 1, 'If 3x + 7 = 22, what is x?', '["3","5","7","15"]'::jsonb, 1, 'algebra', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('sat-digital', 1, 'A line has slope 2 and passes through (0, -3). Which is its equation?', '["y = 2x - 3","y = -3x + 2","y = x/2 - 3","y = 2x + 3"]'::jsonb, 0, 'algebra', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('sat-digital', 2, 'Which sentence uses correct subject-verb agreement?', '["The team are winning.","The team is winning.","The team were winning.","The team have winning."]'::jsonb, 1, 'grammar', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('act', 1, 'If a car travels 60 miles in 1.5 hours, its average speed is:', '["30 mph","40 mph","45 mph","90 mph"]'::jsonb, 1, 'rates', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('act', 2, 'A research study controls variables to:', '["Increase bias","Isolate cause and effect","Eliminate the hypothesis","Guarantee correlation implies causation"]'::jsonb, 1, 'science-reasoning', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('neet', 1, 'Functional unit of kidney is:', '["Neuron","Nephron","Alveolus","Villus"]'::jsonb, 1, 'biology', 'standard');

insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty)
values ('mcat-sample', 1, 'Amino acids at physiological pH (about 7.4) primarily exist as:', '["Neutral molecules","Zwitterions","Only cations","Only anions"]'::jsonb, 1, 'biochemistry', 'standard');
