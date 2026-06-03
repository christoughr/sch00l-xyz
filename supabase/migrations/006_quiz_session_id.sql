-- Pair pre/post quizzes per study session
alter table public.quiz_results
  add column if not exists session_id text;

create index if not exists quiz_results_session_id
  on public.quiz_results (session_id, phase);
