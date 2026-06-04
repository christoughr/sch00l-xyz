-- Run AFTER pasting content/ingest/ap-bio/out/drafts.sql in SQL Editor
-- Publishes every publisher draft for AP Bio in one shot

update public.course_lessons
set review_status = 'published'
where unit_id in (select id from public.course_units where track_id = 'ap-bio')
  and review_status = 'draft'
  and ord >= 100;

-- Optional: see totals
select cu.title as unit, cl.review_status, count(*) 
from public.course_lessons cl
join public.course_units cu on cu.id = cl.unit_id
where cu.track_id = 'ap-bio'
group by cu.title, cl.review_status
order by cu.ord, cl.review_status;
