create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.duty_slot_definitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  starts_at time not null,
  ends_at time not null,
  description text,
  color_token text not null default 'amber',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null unique,
  label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.duty_assignments (
  id uuid primary key default gen_random_uuid(),
  duty_date date not null,
  slot_definition_id uuid not null references public.duty_slot_definitions (id) on delete cascade,
  assigned_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint duty_assignments_unique_slot_per_day unique (duty_date, slot_definition_id)
);

create index if not exists duty_assignments_date_idx
  on public.duty_assignments (duty_date);

create index if not exists duty_assignments_user_idx
  on public.duty_assignments (assigned_user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists duty_slot_definitions_set_updated_at on public.duty_slot_definitions;
create trigger duty_slot_definitions_set_updated_at
before update on public.duty_slot_definitions
for each row
execute function public.set_updated_at();

drop trigger if exists special_dates_set_updated_at on public.special_dates;
create trigger special_dates_set_updated_at
before update on public.special_dates
for each row
execute function public.set_updated_at();

drop trigger if exists duty_assignments_set_updated_at on public.duty_assignments;
create trigger duty_assignments_set_updated_at
before update on public.duty_assignments
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.duty_slot_definitions enable row level security;
alter table public.special_dates enable row level security;
alter table public.duty_assignments enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can read slot definitions" on public.duty_slot_definitions;
create policy "Authenticated users can read slot definitions"
on public.duty_slot_definitions
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read special dates" on public.special_dates;
create policy "Authenticated users can read special dates"
on public.special_dates
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read duty assignments" on public.duty_assignments;
create policy "Authenticated users can read duty assignments"
on public.duty_assignments
for select
to authenticated
using (true);

drop policy if exists "Users can claim duties for themselves" on public.duty_assignments;
create policy "Users can claim duties for themselves"
on public.duty_assignments
for insert
to authenticated
with check (auth.uid() = assigned_user_id);

drop policy if exists "Users can delete their own duty assignments" on public.duty_assignments;
create policy "Users can delete their own duty assignments"
on public.duty_assignments
for delete
to authenticated
using (auth.uid() = assigned_user_id);

insert into public.duty_slot_definitions (
  slug,
  label,
  starts_at,
  ends_at,
  description,
  color_token,
  sort_order,
  is_active
)
values
  (
    'morgon',
    'Morgonpass',
    '06:30',
    '08:30',
    'Morgonrundan med utsläpp, foder och första koll i stallet.',
    'amber',
    1,
    true
  ),
  (
    'kvall',
    'Kvällspass',
    '17:00',
    '20:00',
    'Kvällsrundan med insläpp, vatten, foder och sista avstämningen.',
    'clay',
    2,
    true
  )
on conflict (slug) do update
set label = excluded.label,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    description = excluded.description,
    color_token = excluded.color_token,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = timezone('utc', now());

insert into public.special_dates (
  calendar_date,
  label
)
values
  (
    '2026-06-19',
    'Midsommarafton'
  ),
  (
    '2026-06-20',
    'Midsommardagen'
  )
on conflict (calendar_date) do update
set label = excluded.label,
    updated_at = timezone('utc', now());