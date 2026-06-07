-- AP Physics 2 course outline (original sch00l content)
-- Run after 017. track_id = ap-physics-2
-- Prefer: node scripts/seed-ap-physics-2.mjs

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-physics-2');

delete from public.course_units where track_id = 'ap-physics-2';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-physics-2', 1, 'Fluids & thermodynamics', 'Pressure, buoyancy, ideal gas, entropy'),
  ('ap-physics-2', 2, 'Electrostatics', 'Charge, fields, potential, capacitance'),
  ('ap-physics-2', 3, 'Circuits & magnetism', 'RC circuits, magnetism, induction'),
  ('ap-physics-2', 4, 'Optics & modern physics', 'Lenses, interference, quantum, nuclear'),
  ('ap-physics-2', 5, 'AP exam prep', 'Lab skills, FRQ, MCQ review');
