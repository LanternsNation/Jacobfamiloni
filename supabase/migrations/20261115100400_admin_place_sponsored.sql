-- Admin: give funded sponsored seats to waitlisted applicants, oldest application first.
-- Never places more students than there are paid sponsored seats.
create or replace function public.admin_place_sponsored(p_cohort uuid, p_limit int)
returns int language plpgsql security definer set search_path = '' as $$
declare
  available int;
  placed int;
begin
  if not public.is_admin() then
    raise exception 'not authorised';
  end if;
  select coalesce((select sum(seats) from public.sponsorships where paid_at is not null), 0)
       - (select count(*) from public.applicants where seat_source = 'sponsored')
    into available;
  if available <= 0 then
    return 0;
  end if;
  with picked as (
    select id from public.applicants
     where cohort_id = p_cohort and status = 'waitlisted'
     order by created_at
     limit least(greatest(p_limit, 0), available)
     for update skip locked
  )
  update public.applicants a set status = 'sponsored', seat_source = 'sponsored'
    from picked where a.id = picked.id;
  get diagnostics placed = row_count;
  return placed;
end $$;
revoke execute on function public.admin_place_sponsored(uuid, int) from public, anon;
grant execute on function public.admin_place_sponsored(uuid, int) to authenticated;

insert into public.site_settings (key, value) values ('community', '{"whatsapp_link":""}'::jsonb)
on conflict (key) do nothing;
