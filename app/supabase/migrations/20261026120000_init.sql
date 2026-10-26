-- tONE（仮）初期スキーマ。
-- allergy と partner_state は機微度が高い。自由記述は置かず、画面の選択肢だけを保存する。

create extension if not exists pgcrypto;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  partner_label text not null default '妻',
  work_style text,
  off_self text,
  off_partner text,
  return_window text,
  car text,
  area text,
  allergy text,
  partner_state text,
  lesson text,
  shop_dow smallint check (shop_dow is null or shop_dow between 0 and 6),
  show_invisible boolean not null default true,
  notifications_enabled boolean,
  onboarded boolean not null default false,
  client_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.families.allergy is '高感度。選択肢ラベルのみ。自由記述は保存しない。';
comment on column public.families.partner_state is '高感度。選択肢ラベルのみ。診断や自由記述は保存しない。';

create table public.family_members (
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table public.children (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  sort_order integer not null default 0,
  label text not null,
  age_label text,
  age_years integer,
  school text
);

create table public.gomi_days (
  family_id uuid not null references public.families (id) on delete cascade,
  kind text not null check (kind in ('可燃', 'プラ', '資源')),
  dow smallint not null check (dow between 0 and 6),
  primary key (family_id, kind, dow)
);

create table public.family_multi (
  family_id uuid not null references public.families (id) on delete cascade,
  kind text not null check (kind in ('support', 'outsource')),
  value text not null,
  primary key (family_id, kind, value)
);

create table public.events (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  event_date date not null,
  event_time text not null default '',
  title text not null,
  who_label text not null default '家族',
  kind text not null default 'other' check (kind in ('pickup', 'nomikai', 'ensoku', 'kisei', 'other'))
);

create table public.steps (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  step_date date not null,
  step_time text not null default '',
  title text not null,
  why text not null default '',
  scene text not null default '',
  source text not null default '',
  status text check (status is null or status in ('good', 'meh')),
  reason text not null default '',
  suggestion_id uuid,
  task_id text,
  invisible_key text,
  breakdown jsonb not null default '[]'::jsonb,
  kind text not null default ''
);

create table public.reviews (
  family_id uuid not null references public.families (id) on delete cascade,
  step_id uuid not null references public.steps (id) on delete cascade,
  outcome text not null check (outcome in ('good', 'meh')),
  reason text not null default '',
  primary key (family_id, step_id)
);

create table public.memories (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  memo_date date not null,
  body text not null
);

create table public.task_notes (
  family_id uuid not null references public.families (id) on delete cascade,
  task_id text not null,
  note text not null,
  primary key (family_id, task_id)
);

create table public.hidden_items (
  family_id uuid not null references public.families (id) on delete cascade,
  item_key text not null,
  primary key (family_id, item_key)
);

create table public.consultations (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  scene text,
  entry text,
  safety_flag boolean not null default false,
  answer jsonb,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id text primary key,
  major text not null default '',
  category text not null default '',
  visibility text not null default '',
  group_name text not null default '',
  title text not null,
  stage text not null default '',
  frequency text not null default '',
  duration text not null default '',
  difficulty text not null default '',
  owner_hint text not null default '',
  tag text not null default '',
  invisible boolean not null default false,
  duration_min integer not null default 0,
  source text not null default ''
);

create index events_family_date_idx on public.events (family_id, event_date);
create index steps_family_date_idx on public.steps (family_id, step_date);
create index consultations_user_created_idx on public.consultations (user_id, created_at);
create index tasks_invisible_idx on public.tasks (invisible);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger families_updated_at
  before update on public.families
  for each row execute function public.set_updated_at();

create or replace function public.is_family_member(fid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = fid
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_family_member(uuid) from public;
grant execute on function public.is_family_member(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
begin
  insert into public.families default values
  returning id into fid;
  insert into public.family_members (family_id, user_id)
  values (fid, new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.children enable row level security;
alter table public.gomi_days enable row level security;
alter table public.family_multi enable row level security;
alter table public.events enable row level security;
alter table public.steps enable row level security;
alter table public.reviews enable row level security;
alter table public.memories enable row level security;
alter table public.task_notes enable row level security;
alter table public.hidden_items enable row level security;
alter table public.consultations enable row level security;
alter table public.tasks enable row level security;

create policy families_member on public.families
  for all to authenticated
  using (public.is_family_member(id))
  with check (public.is_family_member(id));

create policy family_members_self on public.family_members
  for select to authenticated
  using (user_id = auth.uid());

create policy children_member on public.children
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy gomi_member on public.gomi_days
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy multi_member on public.family_multi
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy events_member on public.events
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy steps_member on public.steps
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy reviews_member on public.reviews
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy memories_member on public.memories
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy notes_member on public.task_notes
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy hidden_member on public.hidden_items
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy consultations_member on public.consultations
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id) and (user_id is null or user_id = auth.uid()));

create policy tasks_read on public.tasks
  for select to authenticated
  using (true);

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.families,
  public.family_members,
  public.children,
  public.gomi_days,
  public.family_multi,
  public.events,
  public.steps,
  public.reviews,
  public.memories,
  public.task_notes,
  public.hidden_items,
  public.consultations
to authenticated;

grant select on public.tasks to authenticated;
revoke insert, update, delete on public.tasks from authenticated, anon;
