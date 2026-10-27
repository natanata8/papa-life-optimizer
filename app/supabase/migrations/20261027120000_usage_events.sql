-- 件数だけを残す。自由文も名前も入れない。ライブにはまだ適用しない。
create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null check (name in ('consult_started', 'forecast_viewed', 'umbrella_tapped', 'review_done'))
);
create index usage_events_user_created_idx on public.usage_events (user_id, created_at);
alter table public.usage_events enable row level security;
create policy usage_events_select_self on public.usage_events for select to authenticated using (user_id = (select auth.uid()));
create policy usage_events_insert_self on public.usage_events for insert to authenticated with check (user_id = (select auth.uid()));
grant select, insert on public.usage_events to authenticated;
