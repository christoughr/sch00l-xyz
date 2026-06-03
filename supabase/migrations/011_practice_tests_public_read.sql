-- Allow anyone to read practice test catalog (labels only)
alter table public.practice_tests enable row level security;

drop policy if exists "practice_tests_public_read" on public.practice_tests;
create policy "practice_tests_public_read" on public.practice_tests
  for select using (true);

drop policy if exists "practice_items_public_read" on public.practice_items;
alter table public.practice_items enable row level security;
create policy "practice_items_public_read" on public.practice_items
  for select using (true);
