-- 今日の画面で登録する、気づいておきたい日（誕生日・記念日・美容院・ネイルなど）。

create table public.nice_events (
  id uuid primary key,
  family_id uuid not null references public.families (id) on delete cascade,
  kind text not null check (kind in ('誕生日', '記念日', '美容院', 'ネイル', 'その他')),
  title text not null,
  event_date date not null,
  recurrence text check (recurrence is null or recurrence in ('yearly', 'monthly', 'weekly')),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index nice_events_family_idx on public.nice_events (family_id);

alter table public.nice_events enable row level security;

create policy nice_events_member on public.nice_events
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

grant select, insert, update, delete on public.nice_events to authenticated;
