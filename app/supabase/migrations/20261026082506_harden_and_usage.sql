-- Hardening after get_advisors + server-side usage log for the daily cap.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;
alter function public.is_family_member(uuid) set schema private;
revoke all on function private.is_family_member(uuid) from public, anon;
grant execute on function private.is_family_member(uuid) to authenticated;
alter function public.handle_new_user() set schema private;
revoke all on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
alter function public.set_updated_at() set search_path = '';
drop policy family_members_self on public.family_members;
create policy family_members_self on public.family_members for select to authenticated using (user_id = (select auth.uid()));
drop policy consultations_member on public.consultations;
create policy consultations_member on public.consultations for all to authenticated using (private.is_family_member(family_id)) with check (private.is_family_member(family_id) and (user_id is null or user_id = (select auth.uid())));
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
create index if not exists children_family_idx on public.children (family_id);
create index if not exists consultations_family_idx on public.consultations (family_id);
create index if not exists family_members_user_idx on public.family_members (user_id);
create index if not exists memories_family_idx on public.memories (family_id);
create index if not exists reviews_step_idx on public.reviews (step_id);
create table public.consult_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  safety boolean not null default false,
  status text not null default 'ok',
  model text,
  prompt_tokens integer,
  cached_tokens integer,
  completion_tokens integer
);
create index consult_usage_user_created_idx on public.consult_usage (user_id, created_at);
alter table public.consult_usage enable row level security;
create policy consult_usage_self_read on public.consult_usage for select to authenticated using (user_id = (select auth.uid()));
grant select on public.consult_usage to authenticated;
grant select, insert on public.consult_usage to service_role;
create or replace function public.consult_openai_key()
returns text language sql stable security definer set search_path = ''
as $$ select decrypted_secret from vault.decrypted_secrets where name = 'openai_api_key' limit 1; $$;
revoke all on function public.consult_openai_key() from public, anon, authenticated;
grant execute on function public.consult_openai_key() to service_role;
