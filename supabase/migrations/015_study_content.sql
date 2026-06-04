-- Assignment completions + curated practice question banks (run after 010)

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

create policy "assignment_completions_student_own" on public.assignment_completions
  for all using (auth.uid() = user_id);

create policy "assignment_completions_teacher_read" on public.assignment_completions
  for select using (
    exists (
      select 1 from public.classroom_assignments a
      join public.classrooms c on c.id = a.classroom_id
      where a.id = assignment_id and c.teacher_id = auth.uid()
    )
  );

-- Seed AP Biology MCQ bank (representative subset — full bank also in src/lib/practice-catalog.ts)
insert into public.practice_items (test_id, section_ord, prompt, choices, correct_index, skill_tag, difficulty) values
  ('ap-bio-mcq', 1, 'Which organelle is primarily responsible for ATP synthesis via oxidative phosphorylation?', '["Ribosome","Mitochondrion","Golgi apparatus","Lysosome"]', 1, 'cells', 'standard'),
  ('ap-bio-mcq', 1, 'A cell placed in a hypertonic solution will most likely:', '["Lyse","Swell","Shrink","Divide immediately"]', 2, 'cells', 'standard'),
  ('ap-bio-mcq', 2, 'During DNA replication, which enzyme joins Okazaki fragments?', '["Helicase","Primase","DNA ligase","Topoisomerase"]', 2, 'genetics', 'standard'),
  ('ap-bio-mcq', 2, 'A heterozygous tall pea plant (Tt) crossed with homozygous short (tt). Expected phenotypic ratio?', '["All tall","3 tall : 1 short","1 tall : 1 short","All short"]', 2, 'genetics', 'standard'),
  ('ap-bio-mcq', 3, 'Natural selection acts directly on:', '["Genotype frequency only","Phenotype variation","Mutation rate","Species number"]', 1, 'evolution', 'standard'),
  ('ap-bio-mcq', 4, 'In a food web, ~10% of energy passes to the next trophic level because:', '["Energy is created at each level","Most energy is lost as heat during metabolism","Producers store all energy","Consumers eat 90% of biomass"]', 1, 'ecology', 'standard'),
  ('ap-bio-mcq', 1, 'The central dogma of molecular biology is:', '["Protein → RNA → DNA","DNA → RNA → Protein","RNA → DNA → Lipid","DNA → Protein → RNA"]', 1, 'genetics', 'standard'),
  ('ap-bio-mcq', 3, 'Hardy-Weinberg equilibrium assumes NO:', '["Large population","Random mating","Natural selection","Equal allele frequencies"]', 2, 'evolution', 'standard'),
  ('sat-digital', 1, 'If 3x + 7 = 22, what is x?', '["3","5","7","15"]', 1, 'algebra', 'standard'),
  ('sat-digital', 1, 'A line has slope 2 and passes through (0, -3). Which is its equation?', '["y = 2x - 3","y = -3x + 2","y = x/2 - 3","y = 2x + 3"]', 0, 'algebra', 'standard'),
  ('sat-digital', 2, 'Which sentence uses correct subject-verb agreement?', '["The team are winning.","The team is winning.","The team were winning.","The team have winning."]', 1, 'grammar', 'standard'),
  ('act', 1, 'If a car travels 60 miles in 1.5 hours, its average speed is:', '["30 mph","40 mph","45 mph","90 mph"]', 1, 'rates', 'standard'),
  ('act', 2, 'A research study controls variables to:', '["Increase bias","Isolate cause and effect","Eliminate the hypothesis","Guarantee correlation implies causation"]', 1, 'science-reasoning', 'standard'),
  ('neet', 1, 'Functional unit of kidney is:', '["Neuron","Nephron","Alveolus","Villus"]', 1, 'biology', 'standard'),
  ('mcat-sample', 1, 'Amino acids at physiological pH (~7.4) primarily exist as:', '["Neutral molecules","Zwitterions","Only cations","Only anions"]', 1, 'biochemistry', 'standard');
