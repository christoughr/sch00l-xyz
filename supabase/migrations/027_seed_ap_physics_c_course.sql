-- AP Physics C course outline (original sch00l content)
-- Run after 017. track_id = ap-physics-c
-- Prefer: node scripts/seed-ap-physics-c.mjs

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-physics-c');

delete from public.course_units where track_id = 'ap-physics-c';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-physics-c', 1, 'Kinematics & dynamics', 'Calculus-based motion and Newton''s laws'),
  ('ap-physics-c', 2, 'Work, energy & momentum', 'Integrals, conservation laws, collisions'),
  ('ap-physics-c', 3, 'Rotation & oscillations', 'Torque, angular momentum, SHM'),
  ('ap-physics-c', 4, 'Electricity & magnetism', 'Fields, Gauss, Ampère, induction'),
  ('ap-physics-c', 5, 'AP exam prep', 'FRQ, MCQ, calculus setups');
