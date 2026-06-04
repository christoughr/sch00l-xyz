-- Paste 3 for AP Chemistry — run AFTER drafts.sql (ord 100+)
-- Requires 021_seed_ap_chem_course.sql first

update public.course_lessons
set review_status = 'published'
where unit_id in (select id from public.course_units where track_id = 'ap-chem')
  and review_status = 'draft'
  and ord >= 100;

select cu.title as unit, cl.review_status, count(*)
from public.course_lessons cl
join public.course_units cu on cu.id = cl.unit_id
where cu.track_id = 'ap-chem'
group by cu.title, cu.ord, cl.review_status
order by cu.ord, cl.review_status;
