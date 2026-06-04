-- Paste 3 — SAT Math / Digital SAT (run AFTER 022 seed + drafts.sql)

update public.course_lessons
set review_status = 'published'
where unit_id in (select id from public.course_units where track_id = 'sat-math')
  and review_status = 'draft'
  and ord >= 100;

select cu.title as unit, cl.review_status, count(*)
from public.course_lessons cl
join public.course_units cu on cu.id = cl.unit_id
where cu.track_id = 'sat-math'
group by cu.title, cu.ord, cl.review_status
order by cu.ord, cl.review_status;
