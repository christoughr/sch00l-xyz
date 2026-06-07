-- AP Physics 1 course outline (original sch00l content)
-- Run after 017. track_id = ap-physics-1

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-physics-1');

delete from public.course_units where track_id = 'ap-physics-1';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-physics-1', 1, 'Kinematics & forces', 'Motion, Newton''s laws, free-body diagrams'),
  ('ap-physics-1', 2, 'Energy & momentum', 'Work, power, collisions, conservation'),
  ('ap-physics-1', 3, 'Rotation & oscillations', 'Torque, SHM, mechanical waves'),
  ('ap-physics-1', 4, 'Electricity & circuits', 'Charge, fields, DC circuits'),
  ('ap-physics-1', 5, 'AP exam prep', 'Lab skills, FRQ, MCQ review');

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Position, velocity, and acceleration',
  '["Interpret motion graphs","Relate displacement, velocity, and acceleration"]'::jsonb,
  E'# Kinematics\n\n**Scalars vs vectors:** displacement and velocity are vectors; speed and distance are scalars. Slope on a position–time graph gives velocity; slope on a velocity–time graph gives acceleration.\n\n**AP tip:** Always define a positive direction on FRQs.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Newton''s laws and free-body diagrams',
  '["Draw FBDs with correct forces","Apply ΣF = ma in components"]'::jsonb,
  E'# Forces\n\nIdentify **weight**, **normal**, **tension**, and **friction** only when a surface or rope is present. Net force causes acceleration — not velocity.\n\nStatic friction adjusts up to μ_s N; kinetic friction is μ_k N.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Circular motion and gravitation',
  '["Use centripetal acceleration a = v²/r","Explain universal gravitation qualitatively"]'::jsonb,
  E'# Circular motion\n\nCentripetal acceleration points toward the center. A free-body diagram must show which real force (or component) provides F_c = mv²/r.\n\nGravitational force weakens with distance squared between centers of mass.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Work and kinetic energy',
  '["Compute work from force and displacement","Use work–energy theorem"]'::jsonb,
  E'# Work & energy\n\nWork W = Fd cos θ. Net work changes kinetic energy: W_net = ΔK.\n\nOnly forces with displacement parallel to motion do work (watch angles).',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Potential energy and conservation',
  '["Track mechanical energy in closed systems","Solve problems with friction losses"]'::jsonb,
  E'# Conservation of energy\n\nE = K + U. In an isolated system with only conservative forces, total mechanical energy is constant.\n\nWith friction, thermal energy appears — energy is still conserved globally.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Momentum and collisions',
  '["Apply impulse–momentum theorem","Analyze elastic and inelastic collisions"]'::jsonb,
  E'# Momentum\n\np = mv. Impulse J = FΔt = Δp. In closed systems, total momentum is conserved.\n\nInelastic: objects stick or lose kinetic energy; elastic: K and p both conserved.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Torque and rotational kinematics',
  '["Relate angular and linear quantities","Solve torque equilibrium"]'::jsonb,
  E'# Rotation\n\nτ = rF sin θ. Rolling without slipping links v = ωr and a = αr.\n\nRotational inertia depends on mass distribution — farther mass counts more.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Simple harmonic motion',
  '["Describe SHM with sine/cosine graphs","Connect period to spring and pendulum"]'::jsonb,
  E'# SHM\n\nRestoring force proportional to displacement: F = −kx. Period T = 2π√(m/k) for a spring; pendulum T = 2π√(L/g) for small angles.\n\nEnergy oscillates between K and U.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Mechanical waves and sound',
  '["Compare transverse and longitudinal waves","Use v = fλ"]'::jsonb,
  E'# Waves\n\nWave speed depends on medium. Superposition explains interference and standing waves.\n\nSound is a longitudinal pressure wave; pitch relates to frequency.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Electric charge and Coulomb''s law',
  '["Explain charging by contact and induction","Use Coulomb''s law qualitatively"]'::jsonb,
  E'# Electrostatics\n\nLike charges repel; opposite attract. Coulomb force F ∝ q₁q₂/r².\n\nConductors redistribute charge; insulators trap it locally.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'DC circuits',
  '["Apply Ohm''s law V = IR","Analyze series and parallel resistors"]'::jsonb,
  E'# Circuits\n\nCurrent is the same in series; voltage splits across series resistors. Parallel branches share voltage.\n\nPower P = IV = I²R.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Electric fields and potential (intro)',
  '["Sketch field lines","Relate field and potential difference"]'::jsonb,
  E'# Fields\n\nElectric field E points from + to −. Equipotential lines are perpendicular to field lines.\n\nΔV tells you energy per charge moved in a field.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Experimental design and uncertainty',
  '["Propagate uncertainty in measurements","Linearize data for slope meaning"]'::jsonb,
  E'# Lab skills\n\nIdentify independent/dependent variables. Linearize (e.g., T² vs L for pendulum) to extract physical meaning from slope.\n\nPercent uncertainty adds in quadrature for products.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'FRQ strategies',
  '["Write paragraph-length responses with claims","Draw and label diagrams on every FRQ"]'::jsonb,
  E'# FRQs\n\nStart with a diagram and coordinate system. Cite physics principle before algebra.\n\nPartial credit rewards correct setup even with arithmetic slips.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Mixed review and pacing',
  '["Budget time per MCQ cluster","Build an error log by topic"]'::jsonb,
  E'# Exam prep\n\nMark and return to long calculations. Keep a one-page equation sheet you actually understand — not memorized without units.\n\nReview missed lab-style questions first.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-physics-1' and u.ord = 5;
