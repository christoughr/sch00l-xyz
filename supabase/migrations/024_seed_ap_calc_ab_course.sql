-- AP Calculus AB course outline (original sch00l content)
-- Run after 017. track_id = ap-calc-ab

delete from public.course_lessons
where unit_id in (select id from public.course_units where track_id = 'ap-calc-ab');

delete from public.course_units where track_id = 'ap-calc-ab';

insert into public.course_units (track_id, ord, title, description) values
  ('ap-calc-ab', 1, 'Limits & continuity', 'One-sided limits, continuity, and asymptotic behavior'),
  ('ap-calc-ab', 2, 'Differentiation', 'Definition of derivative, rules, and implicit differentiation'),
  ('ap-calc-ab', 3, 'Applications of derivatives', 'Optimization, related rates, and curve analysis'),
  ('ap-calc-ab', 4, 'Integration', 'Riemann sums, FTC, and u-substitution'),
  ('ap-calc-ab', 5, 'AP exam prep', 'FRQ strategies, calculator skills, and review');

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Limits from graphs and tables',
  '["Estimate limits numerically and graphically","Identify discontinuities"]'::jsonb,
  E'# Limits\n\nA **limit** describes y-values as x approaches a number (not necessarily at that x). One-sided limits matter when the function behaves differently from left vs right.\n\n**AP tip:** On FRQs, cite the definition or graph behavior — don''t just write “DNE” without reason.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Continuity and asymptotes',
  '["Apply the three-part continuity definition","Classify vertical and horizontal asymptotes"]'::jsonb,
  E'# Continuity\n\nf is continuous at a if f(a) exists, the limit as x→a exists, and they are equal. **Removable** holes can be “filled”; **infinite** discontinuities often mean vertical asymptotes.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Squeeze theorem and algebraic limits',
  '["Use squeeze when bounded by simpler functions","Rationalize or factor to resolve 0/0 forms"]'::jsonb,
  E'# Algebraic limits\n\nFactor, conjugate, or compare to bound tricky expressions. Squeeze: if g(x) ≤ f(x) ≤ h(x) near a and g, h share limit L, then f→L.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 1;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Definition and basic rules',
  '["Interpret derivative as instantaneous rate of change","Apply power, product, and quotient rules"]'::jsonb,
  E'# Derivative\n\nf''(x) is the slope of the tangent line. Power rule: d/dx[x^n] = nx^(n−1). Show setup on AP work — notation matters.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Chain rule and implicit differentiation',
  '["Differentiate composite functions","Find dy/dx for implicit relations"]'::jsonb,
  E'# Chain & implicit\n\nChain: (f(g(x)))'' = f''(g(x))·g''(x). Implicit: differentiate both sides with respect to x, then solve for dy/dx.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Motion: position, velocity, acceleration',
  '["Relate s, v, a via derivatives","Interpret sign of v and a"]'::jsonb,
  E'# Motion\n\nIf s(t) is position, v(t) = s''(t), a(t) = v''(t). Particle changes direction when v changes sign (and v=0 with crossing).',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 2;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Extrema and the first derivative test',
  '["Find critical points","Classify local max/min"]'::jsonb,
  E'# Extrema\n\nCritical points: f''=0 or undefined. First derivative test: sign change of f'' across the point tells max vs min.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Concavity and optimization',
  '["Use second derivative for concavity","Set up and solve optimization word problems"]'::jsonb,
  E'# Optimization\n\nDefine variables, constraint equation, objective function, domain. Check endpoints and critical points — AP readers want a closed interval justification.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Related rates',
  '["Differentiate with respect to time","Link multiple changing quantities"]'::jsonb,
  E'# Related rates\n\nDraw a diagram, label changing quantities, write an equation relating them, differentiate with respect to t, substitute known rates at an instant.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 3;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Riemann sums and definite integrals',
  '["Approximate area with left/right/midpoint/trapezoid","Interpret ∫ as net area"]'::jsonb,
  E'# Riemann sums\n\nMore rectangles → better area estimate. Definite integral is the limit of Riemann sums when the function is integrable.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'Fundamental Theorem of Calculus',
  '["Connect antiderivatives to definite integrals","Evaluate using FTC"]'::jsonb,
  E'# FTC\n\nIf F'' = f, then ∫_a^b f(x) dx = F(b) − F(a). Part 1: derivative of accumulation function rebuilds the integrand.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'u-substitution',
  '["Choose u and du for integrals","Adjust bounds when integrating definite"]'::jsonb,
  E'# u-sub\n\nMatch an inner function and its derivative (up to a constant). For definite integrals, change limits to u-bounds or resubstitute at the end.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 4;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 1, 'Calculator-active vs non-calculator skills',
  '["Know when graphing calculator helps","Practice without CAS on Section II Part A"]'::jsonb,
  E'# Calculator policy\n\nAB exam mixes calculator and non-calculator sections. Practice both — store common programs only if rules allow for your year.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 2, 'FRQ scoring rubric habits',
  '["Show reasoning and units","Earn points on setup even with arithmetic slips"]'::jsonb,
  E'# FRQs\n\nJustify theorems (MVT, IVT, FTC). Label graphs. One sentence can earn a “reasoning” point.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 5;

insert into public.course_lessons (unit_id, ord, title, objectives, body_markdown, review_status, source_pdf_name)
select u.id, 3, 'Mixed review and error log',
  '["Tag misses by skill (limits, deriv, integral)","Build a 10-problem custom set"]'::jsonb,
  E'# Review\n\nKeep an error log: problem type, mistake, fix rule. Re-drill weakest skill before full-length practice.',
  'published', 'sch00l-original-oer-aligned'
from public.course_units u where u.track_id = 'ap-calc-ab' and u.ord = 5;
