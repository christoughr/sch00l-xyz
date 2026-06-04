-- AP Chemistry course outline (original sch00l content)
-- Run after 017. Safe to re-run: clears prior ap-chem seed.

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-chem');

delete from public.course_units where track_id = 'ap-chem';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-chem', 1, 'Atomic structure', 'Electron configuration, periodic trends, photoelectron spectroscopy'),
  ('ap-chem', 2, 'Bonding & IMF', 'Lewis structures, VSEPR, polarity, intermolecular forces'),
  ('ap-chem', 3, 'Reactions & stoichiometry', 'Types of reactions, equilibrium, kinetics'),
  ('ap-chem', 4, 'Thermodynamics', 'Enthalpy, entropy, Gibbs free energy, electrochemistry intro'),
  ('ap-chem', 5, 'AP exam prep', 'Lab skills, FRQ strategies, and review');

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Electron configuration and periodic trends',
  '["Write electron configurations and orbital diagrams","Explain periodic trends using effective nuclear charge"]'::jsonb,
  E'# Atomic structure\n\nElectrons occupy orbitals grouped by **principal energy level** (n) and subshell (s, p, d, f). Aufbau, Pauli, and Hund''s rules predict ground-state configurations.\n\n**Periodic trends:** atomic radius decreases across a period; ionization energy generally increases. Use *effective nuclear charge* in explanations, not memorized arrows alone.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Photoelectron spectroscopy (PES)',
  '["Relate PES peaks to subshell occupancy","Connect PES to electron configuration"]'::jsonb,
  E'# PES\n\nEach peak corresponds to electrons removed from a subshell. Peak height reflects relative electron count. Compare relative binding energies to justify configuration and periodic trends on FRQs.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Moles and stoichiometry review',
  '["Convert among moles, particles, and mass","Balance equations and use mole ratios"]'::jsonb,
  E'# Stoichiometry\n\nUse **mole ratios** from balanced equations. Limiting reactant problems: convert both reactants to product moles; smaller amount limits yield.\n\nShow work with units every step — AP readers award partial credit for setup.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Lewis structures and VSEPR',
  '["Draw Lewis structures with formal charge reasoning","Predict molecular geometry from electron domains"]'::jsonb,
  E'# Lewis & VSEPR\n\nCount valence electrons, satisfy octets (with exceptions), minimize formal charges. **VSEPR:** electron-domain geometry vs molecular shape when lone pairs present.\n\nExample: H₂O — tetrahedral electron domains, bent molecular shape.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Polarity and intermolecular forces',
  '["Rank IMF strength for given species","Relate IMF to boiling point and solubility"]'::jsonb,
  E'# IMF\n\n**London dispersion** (all molecules), **dipole–dipole**, **hydrogen bonding** (N–H, O–H, F–H). Stronger IMF → higher boiling point.\n\nLike dissolves like: polar solvents favor polar solutes.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Intramolecular vs intermolecular bonds',
  '["Distinguish bond breaking from phase changes","Explain energy changes in heating curves"]'::jsonb,
  E'# Bonds vs IMF\n\nBreaking covalent bonds costs large energy; overcoming IMF during vaporization costs less. Use heating-curve plateaus to identify phase changes.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Reaction types and net ionic equations',
  '["Classify precipitation, acid–base, redox","Write net ionic equations"]'::jsonb,
  E'# Reactions\n\nFocus on **spectator ions** removed in net ionic form. Redox: assign oxidation numbers; electrons transfer from reducing agent to oxidizing agent.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Equilibrium and Le Châtelier',
  '["Write K expressions","Predict shift when stress is applied"]'::jsonb,
  E'# Equilibrium\n\nK = products/reactants (activities simplified to concentrations). Increasing temperature favors endothermic direction. Catalyst speeds attainment but does not change K.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Kinetics and rate laws',
  '["Determine order from experimental data","Interpret activation energy on a graph"]'::jsonb,
  E'# Kinetics\n\nRate laws come from experiments, not coefficients. Elementary steps suggest mechanisms; rate-determining step is slowest.\n\nArrhenius: higher T → more collisions with sufficient energy.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Enthalpy and Hess''s law',
  '["Apply Hess''s law to combine reactions","Relate sign of ΔH to endothermic/exothermic"]'::jsonb,
  E'# Enthalpy\n\nHess''s law: enthalpy change is path-independent. Flip a reaction → change sign of ΔH. Multiply coefficients → scale ΔH.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Entropy and Gibbs free energy',
  '["Predict sign of ΔS for phase changes","Use ΔG = ΔH − TΔS"]'::jsonb,
  E'# Gibbs\n\nSpontaneous when ΔG < 0. Temperature can flip favorability when ΔH and ΔS have opposite signs. Connect to equilibrium: ΔG° = −RT ln K.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Electrochemistry basics',
  '["Label anode/cathode in galvanic cells","Relate cell potential to spontaneity"]'::jsonb,
  E'# Electrochemistry\n\nAnode = oxidation; cathode = reduction. In galvanic cells, E°cell > 0. Practice half-reaction combination and stoichiometry with Faraday when needed.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Lab skills and data analysis',
  '["Identify controlled/independent variables","Quantify uncertainty in simple experiments"]'::jsonb,
  E'# Lab skills\n\nState hypothesis, controls, and how data support or refute claim. Linearize data when rate order or equilibrium analysis requires it.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'MCQ strategies',
  '["Eliminate distractors using units and orders of magnitude","Estimate without a calculator when allowed"]'::jsonb,
  E'# MCQ\n\nCheck units first. For equilibrium problems, compare Q vs K. Do not over-calculate — estimation often eliminates three choices.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'FRQ strategies',
  '["Earn partial credit with clear setup","Explain reasoning in complete sentences"]'::jsonb,
  E'# FRQ\n\nRestate given values with symbols. Show stoichiometry setup, K expression, or rate law before numbers. One-sentence model explanation at the end locks reasoning points.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-chem' and u.ord = 5;
