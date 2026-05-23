create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null unique,
  label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists special_dates_set_updated_at on public.special_dates;
create trigger special_dates_set_updated_at
before update on public.special_dates
for each row
execute function public.set_updated_at();

alter table public.special_dates enable row level security;

drop policy if exists "Authenticated users can read special dates" on public.special_dates;
create policy "Authenticated users can read special dates"
on public.special_dates
for select
to authenticated
using (true);

update public.duty_slot_definitions
set is_active = false,
    updated_at = timezone('utc', now())
where slug in ('inslapp', 'utslapp', 'inslapp-kvall', 'kvallskoll');

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
  ('2026-01-01', 'Nyårsdagen'),
  ('2026-01-05', 'Trettondagsafton'),
  ('2026-01-06', 'Trettondagen'),
  ('2026-04-03', 'Långfredagen'),
  ('2026-04-04', 'Påskafton'),
  ('2026-04-05', 'Påskdagen'),
  ('2026-04-06', 'Annandag påsk'),
  ('2026-04-30', 'Valborgsmässoafton'),
  ('2026-05-01', 'Första maj'),
  ('2026-05-14', 'Kristi himmelsfärdsdag'),
  ('2026-05-24', 'Pingstdagen'),
  ('2026-06-06', 'Sveriges nationaldag'),
  ('2026-06-19', 'Midsommarafton'),
  ('2026-06-20', 'Midsommardagen'),
  ('2026-10-30', 'Alla helgons afton'),
  ('2026-10-31', 'Alla helgons dag'),
  ('2026-12-24', 'Julafton'),
  ('2026-12-25', 'Juldagen'),
  ('2026-12-26', 'Annandag jul'),
  ('2026-12-31', 'Nyårsafton')
on conflict (calendar_date) do update
set label = excluded.label,
    updated_at = timezone('utc', now());