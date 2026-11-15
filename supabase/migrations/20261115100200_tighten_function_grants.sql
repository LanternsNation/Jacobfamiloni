-- Admin-only helpers are not callable by anonymous visitors.
-- public_impact() and public_sponsors() stay public by design (counts / opted-in names only).
-- is_admin() stays executable because public read policies evaluate it (it returns false for visitors).
revoke execute on function public.admin_referral_counts() from public, anon;
grant execute on function public.admin_referral_counts() to authenticated;
revoke execute on function public.gen_referral_code() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
