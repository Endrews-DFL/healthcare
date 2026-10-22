create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id text primary key,
  full_name text not null,
  specialty text not null,
  crm text not null unique,
  avatar_url text,
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews_count integer not null default 0 check (reviews_count >= 0),
  experience_years integer not null default 0 check (experience_years >= 0),
  price_per_session numeric(10,2) not null default 0 check (price_per_session >= 0),
  bio text not null default '',
  available_online boolean not null default false,
  available_in_person boolean not null default true,
  available_slots jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_id text not null references public.doctors(id),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30 check (duration_minutes between 10 and 240),
  status text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled','no_show')),
  type text not null check (type in ('in_person','telemedicine')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_user_schedule_idx on public.appointments(user_id, scheduled_at desc);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  lab_name text not null default '',
  performed_at date not null,
  result_value text,
  unit text not null default '',
  reference_range text not null default '',
  range_status text not null default 'in_range' check (range_status in ('in_range','below_range','above_range')),
  status text not null default 'available' check (status in ('pending','available','viewed')),
  report_path text,
  created_at timestamptz not null default now()
);

create index if not exists exams_user_performed_idx on public.exams(user_id, performed_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'general' check (type in ('appointment','exam','prescription','general')),
  read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.exams enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.doctors to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, full_name, phone) on public.profiles to authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;
grant select, insert, update, delete on public.appointments to authenticated;
grant select on public.exams to authenticated;
grant update (report_path) on public.exams to authenticated;
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "doctors_read_public" on public.doctors for select to anon, authenticated using (true);

create policy "appointments_select_own" on public.appointments for select to authenticated using (user_id = (select auth.uid()));
create policy "appointments_insert_own" on public.appointments for insert to authenticated with check (user_id = (select auth.uid()));
create policy "appointments_update_own" on public.appointments for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "appointments_delete_own" on public.appointments for delete to authenticated using (user_id = (select auth.uid()));

create policy "exams_select_own" on public.exams for select to authenticated using (user_id = (select auth.uid()));
create policy "exams_update_own" on public.exams for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('medical-reports', 'medical-reports', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "medical_reports_read_own" on storage.objects for select to authenticated
  using (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "medical_reports_upload_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = (select auth.uid())::text and lower(storage.extension(name)) = 'pdf');
create policy "medical_reports_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = (select auth.uid())::text and lower(storage.extension(name)) = 'pdf');
create policy "medical_reports_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'medical-reports' and (storage.foldername(name))[1] = (select auth.uid())::text);

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then
  null;
end $$;
