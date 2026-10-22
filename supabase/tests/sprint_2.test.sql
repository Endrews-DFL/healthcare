begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sprint2-a@example.test', crypt('local-test-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sprint Two A"}', now(), now()),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sprint2-b@example.test', crypt('local-test-password', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sprint Two B"}', now(), now())
on conflict (id) do nothing;

insert into public.exams (user_id, name, performed_at)
values
  ('10000000-0000-4000-8000-000000000001', 'Exame privado A', current_date),
  ('20000000-0000-4000-8000-000000000002', 'Exame privado B', current_date);

insert into public.notifications (user_id, title, message)
values
  ('10000000-0000-4000-8000-000000000001', 'Aviso privado A', 'Teste local'),
  ('20000000-0000-4000-8000-000000000002', 'Aviso privado B', 'Teste local');

select is((select public from storage.buckets where id = 'medical-reports'), false, 'medical report bucket is private');
select ok(
  exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'),
  'notifications are published for realtime changes'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is((select count(*)::int from public.doctors), 10, 'doctor directory is publicly readable');
select is((select count(*)::int from public.profiles), 1, 'signup trigger creates and scopes the patient profile');
select is((select full_name from public.profiles), 'Sprint Two A', 'profile contains signup metadata');

insert into public.appointments (user_id, doctor_id, scheduled_at, type)
values ('10000000-0000-4000-8000-000000000001', 'doc_001', now() + interval '2 days', 'telemedicine');
select is((select count(*)::int from public.appointments), 1, 'patient can create and read their own appointment');

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select is((select count(*)::int from public.appointments), 0, 'patient cannot read another patient appointments');
select is((select count(*)::int from public.exams), 1, 'patient sees only their own exams');
select is((select count(*)::int from public.notifications), 1, 'patient sees only their own notifications');
select throws_ok(
  $$insert into public.appointments (user_id, doctor_id, scheduled_at, type) values ('10000000-0000-4000-8000-000000000001', 'doc_001', now() + interval '3 days', 'in_person')$$,
  '42501', null, 'patient cannot create an appointment for another patient'
);

select * from finish();
rollback;
