-- Digital SAT course outline (original sch00l content)
-- Run after 017. track_id = sat-math (Study picker: SAT Math)

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'sat-math');

delete from public.course_units where track_id = 'sat-math';

insert into public.course_units (track_id, ord, title, description) values
  ('sat-math', 1, 'Algebra & problem solving', 'Linear equations, systems, inequalities, word problems'),
  ('sat-math', 2, 'Advanced math', 'Quadratics, polynomials, radicals, rational expressions'),
  ('sat-math', 3, 'Reading & writing', 'Evidence, rhetoric, grammar, concision'),
  ('sat-math', 4, 'Data & strategy', 'Statistics, graphs, pacing, elimination'),
  ('sat-math', 5, 'Full exam prep', 'Timed blocks, error log, test-day plan');

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Linear equations and inequalities',
  '["Solve one- and two-variable linear problems","Translate word problems into equations"]'::jsonb,
  E'# Linear equations\n\nIsolate the variable; do the same operation to both sides. For inequalities, flip the sign when multiplying/dividing by a negative.\n\n**SAT tip:** plug answer choices back in when stuck — often faster than symbolic solve.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Systems and rates',
  '["Solve 2x2 systems by substitution or elimination","Set up rate/ratio tables"]'::jsonb,
  E'# Systems & rates\n\nSubstitution when one variable is already isolated; elimination when coefficients line up. Rate problems: align units before solving.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Percent and proportional reasoning',
  '["Compute percent change","Use proportions in context"]'::jsonb,
  E'# Percent\n\nPercent change = (new − old) / old × 100%. Watch for “of” vs “more than” wording traps on the Digital SAT.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Quadratics and polynomials',
  '["Factor and use the quadratic formula","Connect roots to graphs"]'::jsonb,
  E'# Quadratics\n\nForms: standard, factored, vertex. Sum/product of roots ties to coefficients. Graph opens up if a > 0.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Functions and graphs',
  '["Interpret slope and intercept","Evaluate composite notation"]'::jsonb,
  E'# Functions\n\nf(x) notation is substitution. Slope = rate of change; parallel lines share slope, perpendicular slopes are negative reciprocals.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Radicals and rational expressions',
  '["Simplify radicals and rationalize denominators","Find domain restrictions"]'::jsonb,
  E'# Radicals & rationals\n\nEven roots need non-negative radicands (real numbers). Factor before canceling rational expressions.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Command of evidence',
  '["Pick quotes that directly support a claim","Eliminate half-right distractors"]'::jsonb,
  E'# Evidence\n\nThe correct answer must be **provable from the passage** — not general knowledge. Read the question stem before the passage when timing is tight.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Words in context and transitions',
  '["Use context for vocabulary","Choose logical transitions"]'::jsonb,
  E'# Vocabulary in context\n\nPlug each choice into the sentence. Transition words signal contrast, cause, or addition — match the paragraph logic.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Standard English conventions',
  '["Fix agreement, tense, and punctuation","Prefer concise correct phrasing"]'::jsonb,
  E'# Grammar\n\nRead aloud mentally. Comma splices and pronoun agreement are high-frequency Digital SAT items.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Statistics and data displays',
  '["Interpret mean, median, and scatter trends","Read two-way tables"]'::jsonb,
  E'# Data\n\nMedian resists outliers; mean does not. Line of best fit slope describes association, not causation.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Geometry and trigonometry basics',
  '["Use special right triangles and circle equations","Apply SOHCAHTOA"]'::jsonb,
  E'# Geometry & trig\n\nMemorize 30-60-90 and 45-45-90 ratios. Circle: (x−h)² + (y−k)² = r².',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Pacing and calculator strategy',
  '["Budget time per module","Know when to skip and return"]'::jsonb,
  E'# Strategy\n\nMark and move after 90 seconds on a stuck item. Desmos on allowed items — graph systems and quadratics quickly.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Mixed timed module',
  '["Simulate adaptive pacing","Review every miss same day"]'::jsonb,
  E'# Timed practice\n\nDebrief: content gap vs careless error. Re-do missed items 24 hours later without notes.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Error log and weak-skill drill',
  '["Tag misses by skill","Build a 20-item custom drill"]'::jsonb,
  E'# Error log\n\nColumns: date, section, skill tag, why you missed it, fix rule. Drill weakest tag first.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Test day plan',
  '["Prepare materials and mindset","Use post-test review window"]'::jsonb,
  E'# Test day\n\nSleep > cram. Know admission ticket, device charge, and approved calculator policy. After: analyze score report skill bands.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'sat-math' and u.ord = 5;
