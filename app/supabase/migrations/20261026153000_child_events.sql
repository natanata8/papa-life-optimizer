-- 子どもの予定。画像そのものは保存しない。読み取り回数は consult_usage の status = extract:ok で数える。

alter table public.children add column birthday date;
alter table public.children add column school_name text not null default '';

create table public.child_events (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  child_id uuid references public.children (id) on delete set null,
  title text not null,
  event_date date not null,
  start_time text not null default '',
  end_time text not null default '',
  all_day boolean not null default false,
  category text not null check (category in ('行事', '持ち物', '提出物', '通院・健診', '習い事', 'お休み', 'その他')),
  items jsonb not null default '[]'::jsonb,
  deadline boolean not null default false,
  notes text not null default '',
  source text not null default 'manual' check (source in ('manual', 'image')),
  created_at timestamptz not null default now()
);

create index child_events_family_idx on public.child_events (family_id);
create index child_events_child_idx on public.child_events (child_id);

alter table public.child_events enable row level security;

create policy child_events_member on public.child_events
  for all to authenticated
  using (
    family_id in (
      select fm.family_id
      from public.family_members fm
      where fm.user_id = (select auth.uid())
    )
  )
  with check (
    family_id in (
      select fm.family_id
      from public.family_members fm
      where fm.user_id = (select auth.uid())
    )
  );

grant select, insert, update, delete on public.child_events to authenticated;
