-- FixMyCampus schema, functions, indexes, RLS, storage.
-- Run in the Supabase SQL editor (or `supabase db push`) after creating a project.

create extension if not exists pgcrypto;
-- Optional geospatial. Uncomment if you want PostGIS nearest-neighbour:
-- create extension if not exists postgis;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('student', 'admin', 'super_admin', 'worker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.complaint_category as enum (
    'wifi','water','electricity','furniture','food_hygiene','washroom',
    'classroom','security','infrastructure','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.complaint_priority as enum ('low','medium','high','emergency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.complaint_status as enum (
    'submitted','under_review','assigned','in_progress',
    'resolved_pending_verification','closed_verified','rejected',
    'reopened','auto_closed','merged'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.media_kind as enum ('before','after','reopen');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.visibility as enum ('public','internal');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text not null,
  department text,
  year text,
  hostel text,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  categories public.complaint_category[] not null default '{}'
);

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  phone text,
  specialties public.complaint_category[] not null default '{}',
  is_active boolean not null default true,
  user_id uuid references auth.users(id)
);

create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  campus_name text not null default 'Campus',
  campus_center_lat double precision not null default 28.545,
  campus_center_lng double precision not null default 77.193,
  sla_hours_by_priority jsonb not null default '{"emergency":4,"high":24,"medium":72,"low":168}',
  auto_close_days int not null default 3
);

create sequence if not exists public.complaint_public_seq start 1;

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  student_id uuid not null references public.profiles(id),
  title text not null check (char_length(title) >= 8),
  description text not null check (char_length(description) >= 20),
  category public.complaint_category not null,
  priority public.complaint_priority not null default 'medium',
  status public.complaint_status not null default 'submitted',
  latitude double precision not null,
  longitude double precision not null,
  place_name text,
  building text,
  floor text,
  room text,
  department_id uuid references public.departments(id),
  assigned_worker_id uuid references public.workers(id),
  parent_complaint_id uuid references public.complaints(id),
  reopen_count int not null default 0,
  is_overdue boolean not null default false,
  sla_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  closed_at timestamptz,
  ai_category public.complaint_category,
  ai_priority public.complaint_priority,
  ai_summary text,
  ai_hash text
);

create table if not exists public.complaint_media (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  storage_path text not null,
  kind public.media_kind not null default 'before',
  media_type text not null check (media_type in ('image','video')),
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  actor_id uuid,
  from_status public.complaint_status,
  to_status public.complaint_status,
  note text,
  visibility public.visibility not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.complaint_supports (
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (complaint_id, student_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  visibility public.visibility not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.verifications (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  outcome text not null check (outcome in ('fixed','not_fixed')),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  inspector_id uuid references public.profiles(id),
  findings text,
  action_taken text,
  follow_up_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  complaint_id uuid references public.complaints(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists complaints_student_idx on public.complaints (student_id);
create index if not exists complaints_status_idx on public.complaints (status);
create index if not exists complaints_category_idx on public.complaints (category);
create index if not exists complaints_dept_idx on public.complaints (department_id);
create index if not exists complaints_created_idx on public.complaints (created_at desc);
create index if not exists complaints_geo_idx on public.complaints (latitude, longitude);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists events_complaint_idx on public.complaint_events (complaint_id, created_at);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.haversine_meters(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
) returns double precision language sql immutable as $$
  select 2 * 6371000 * asin(least(1, sqrt(
    sin(radians(lat2-lat1)/2)^2 +
    cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lng2-lng1)/2)^2
  )));
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

create or replace function public.generate_public_id()
returns text language plpgsql as $$
begin
  return 'FMC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.complaint_public_seq')::text, 6, '0');
end;
$$;

create or replace function public.complaints_before_insert()
returns trigger language plpgsql as $$
declare
  sla jsonb;
  hours int;
  today_count int;
begin
  if new.public_id is null or new.public_id = '' then
    new.public_id := public.generate_public_id();
  end if;
  select sla_hours_by_priority into sla from public.app_settings where id = 1;
  hours := coalesce((sla ->> new.priority::text)::int, 72);
  new.sla_due_at := now() + make_interval(hours => hours);
  if new.category = 'food_hygiene' and new.priority in ('low','medium') then
    new.priority := 'high';
  end if;
  select count(*) into today_count
  from public.complaints
  where student_id = new.student_id
    and created_at >= date_trunc('day', now());
  if today_count >= 10 then
    raise exception 'Daily complaint limit reached';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_complaints_bi on public.complaints;
create trigger trg_complaints_bi before insert on public.complaints
for each row execute function public.complaints_before_insert();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_complaints_bu on public.complaints;
create trigger trg_complaints_bu before update on public.complaints
for each row execute function public.touch_updated_at();

-- Status machine (server-side)
create or replace function public.transition_complaint(
  p_complaint_id uuid,
  p_to public.complaint_status,
  p_note text,
  p_visibility public.visibility default 'public'
) returns public.complaints
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.complaints;
  allowed public.complaint_status[];
  next_status public.complaint_status;
begin
  select * into c from public.complaints where id = p_complaint_id for update;
  if not found then raise exception 'not found'; end if;

  allowed := case c.status
    when 'submitted' then array['under_review','rejected','merged']::public.complaint_status[]
    when 'under_review' then array['assigned','rejected','merged','in_progress']::public.complaint_status[]
    when 'assigned' then array['in_progress','under_review','rejected']::public.complaint_status[]
    when 'in_progress' then array['resolved_pending_verification','assigned','under_review']::public.complaint_status[]
    when 'resolved_pending_verification' then array['closed_verified','reopened','auto_closed']::public.complaint_status[]
    when 'reopened' then array['under_review']::public.complaint_status[]
    when 'auto_closed' then array['under_review']::public.complaint_status[]
    else array[]::public.complaint_status[]
  end;

  if not (p_to = any(allowed)) then
    raise exception 'illegal transition % -> %', c.status, p_to;
  end if;

  next_status := p_to;
  if p_to = 'reopened' then
    next_status := 'under_review';
    c.reopen_count := c.reopen_count + 1;
  end if;

  insert into public.complaint_events (complaint_id, actor_id, from_status, to_status, note, visibility)
  values (c.id, auth.uid(), c.status, p_to, p_note, p_visibility);

  update public.complaints set
    status = next_status,
    reopen_count = c.reopen_count,
    resolved_at = case when next_status = 'resolved_pending_verification' then now() else resolved_at end,
    closed_at = case when next_status in ('closed_verified','auto_closed') then now() else closed_at end,
    is_overdue = case when next_status in ('closed_verified','auto_closed','rejected','merged') then false else is_overdue end
  where id = c.id
  returning * into c;

  return c;
end;
$$;

-- Escalation / auto-close. Call from pg_cron or /api/escalate.
create or replace function public.run_escalation()
returns void language plpgsql security definer as $$
begin
  update public.complaints
     set is_overdue = true
   where is_overdue = false
     and sla_due_at < now()
     and status in ('submitted','under_review','assigned','in_progress','reopened');

  insert into public.notifications (user_id, type, complaint_id, title, body)
  select p.id, 'escalation', c.id, c.public_id || ' is overdue', c.title
  from public.complaints c
  join public.profiles p on p.role = 'super_admin'
  where c.is_overdue = true
    and c.status in ('submitted','under_review','assigned','in_progress','reopened')
    and not exists (
      select 1 from public.notifications n
      where n.complaint_id = c.id and n.type = 'escalation' and n.created_at > now() - interval '1 day'
    );

  update public.complaints c
     set status = 'auto_closed', closed_at = now()
   from public.app_settings s
   where c.status = 'resolved_pending_verification'
     and coalesce(c.resolved_at, c.updated_at) < now() - (s.auto_close_days || ' days')::interval;
end;
$$;

-- New profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.workers enable row level security;
alter table public.app_settings enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_media enable row level security;
alter table public.complaint_events enable row level security;
alter table public.complaint_supports enable row level security;
alter table public.comments enable row level security;
alter table public.verifications enable row level security;
alter table public.inspections enable row level security;
alter table public.notifications enable row level security;

-- profiles
drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "update own" on public.profiles;
create policy "update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- departments / workers / settings readable by authed, writable by admin
drop policy if exists "read depts" on public.departments;
create policy "read depts" on public.departments for select using (auth.role() = 'authenticated');
drop policy if exists "admin depts" on public.departments;
create policy "admin depts" on public.departments for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read workers" on public.workers;
create policy "read workers" on public.workers for select using (auth.role() = 'authenticated');
drop policy if exists "admin workers" on public.workers;
create policy "admin workers" on public.workers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read settings" on public.app_settings;
create policy "read settings" on public.app_settings for select using (true);
drop policy if exists "admin settings" on public.app_settings;
create policy "admin settings" on public.app_settings for update using (public.is_admin());

-- complaints
drop policy if exists "student insert own" on public.complaints;
create policy "student insert own" on public.complaints
  for insert with check (student_id = auth.uid());

drop policy if exists "student read own or public map" on public.complaints;
create policy "student read own or public map" on public.complaints
  for select using (
    student_id = auth.uid()
    or public.is_admin()
    or status in ('submitted','under_review','assigned','in_progress','resolved_pending_verification','reopened')
  );

drop policy if exists "admin update" on public.complaints;
create policy "admin update" on public.complaints
  for update using (public.is_admin()) with check (public.is_admin());

-- students cannot patch except via RPC; verification is a dedicated table + RPC.

-- media
drop policy if exists "media read" on public.complaint_media;
create policy "media read" on public.complaint_media
  for select using (
    exists (select 1 from public.complaints c where c.id = complaint_id and (c.student_id = auth.uid() or public.is_admin()))
  );
drop policy if exists "media insert" on public.complaint_media;
create policy "media insert" on public.complaint_media
  for insert with check (
    exists (select 1 from public.complaints c where c.id = complaint_id and (c.student_id = auth.uid() or public.is_admin()))
  );

-- events: students see public only
drop policy if exists "events read" on public.complaint_events;
create policy "events read" on public.complaint_events
  for select using (
    visibility = 'public'
    and exists (select 1 from public.complaints c where c.id = complaint_id)
    or public.is_admin()
  );
drop policy if exists "events insert admin" on public.complaint_events;
create policy "events insert admin" on public.complaint_events
  for insert with check (public.is_admin() or actor_id = auth.uid());

-- supports
drop policy if exists "supports read" on public.complaint_supports;
create policy "supports read" on public.complaint_supports for select using (auth.role() = 'authenticated');
drop policy if exists "supports insert" on public.complaint_supports;
create policy "supports insert" on public.complaint_supports for insert with check (student_id = auth.uid());

-- comments
drop policy if exists "comments read" on public.comments;
create policy "comments read" on public.comments
  for select using (visibility = 'public' or public.is_admin() or author_id = auth.uid());
drop policy if exists "comments insert" on public.comments;
create policy "comments insert" on public.comments
  for insert with check (author_id = auth.uid() and (visibility = 'public' or public.is_admin()));

-- verifications
drop policy if exists "ver read" on public.verifications;
create policy "ver read" on public.verifications
  for select using (student_id = auth.uid() or public.is_admin());
drop policy if exists "ver insert" on public.verifications;
create policy "ver insert" on public.verifications
  for insert with check (student_id = auth.uid());

-- inspections admin only
drop policy if exists "ins read admin" on public.inspections;
create policy "ins read admin" on public.inspections for select using (public.is_admin());
drop policy if exists "ins write admin" on public.inspections;
create policy "ins write admin" on public.inspections for all using (public.is_admin()) with check (public.is_admin());

-- notifications
drop policy if exists "ntf read" on public.notifications;
create policy "ntf read" on public.notifications for select using (user_id = auth.uid());
drop policy if exists "ntf update" on public.notifications;
create policy "ntf update" on public.notifications for update using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('complaint-media', 'complaint-media', false)
on conflict (id) do nothing;

drop policy if exists "media upload own" on storage.objects;
create policy "media upload own" on storage.objects
  for insert with check (
    bucket_id = 'complaint-media' and auth.role() = 'authenticated'
  );

drop policy if exists "media read signed" on storage.objects;
create policy "media read signed" on storage.objects
  for select using (
    bucket_id = 'complaint-media' and auth.role() = 'authenticated'
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.complaints;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.comments;

insert into public.app_settings (id) values (1) on conflict (id) do nothing;
