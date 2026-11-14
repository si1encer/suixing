-- 随行 · Supabase Free 方案数据库初始化
-- 在 Supabase Dashboard > SQL Editor 中完整运行一次。
-- 运行前请先在 Authentication > Providers > Anonymous 开启匿名登录。

create extension if not exists pgcrypto;

create table if not exists public.couple_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default '我们的旅行',
  invite_code text not null unique
    check (invite_code ~ '^[A-Z0-9-]{8,24}$'),
  created_by uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_members (
  user_id uuid primary key
    references auth.users(id) on delete cascade,
  couple_id uuid not null
    references public.couple_spaces(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'member')),
  joined_at timestamptz not null default now()
);

create table if not exists public.trips (
  id text primary key,
  couple_id uuid not null
    references public.couple_spaces(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
    references auth.users(id) on delete set null,
  unique (couple_id, id)
);

create table if not exists public.activities (
  id text primary key,
  couple_id uuid not null
    references public.couple_spaces(id) on delete cascade,
  trip_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid()
    references auth.users(id) on delete set null,
  foreign key (couple_id, trip_id)
    references public.trips(couple_id, id) on delete cascade
);

create index if not exists trips_couple_id_idx
  on public.trips(couple_id);
create index if not exists activities_couple_id_idx
  on public.activities(couple_id);
create index if not exists activities_trip_id_idx
  on public.activities(trip_id);
create index if not exists couple_spaces_invite_code_idx
  on public.couple_spaces(invite_code);

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = target_couple_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_couple_member(uuid) from public;
grant execute on function public.is_couple_member(uuid) to authenticated;

alter table public.couple_spaces enable row level security;
alter table public.couple_members enable row level security;
alter table public.trips enable row level security;
alter table public.activities enable row level security;

drop policy if exists "members can read their couple" on public.couple_spaces;
create policy "members can read their couple"
on public.couple_spaces for select
to authenticated
using (public.is_couple_member(id));

drop policy if exists "members can update their couple" on public.couple_spaces;
create policy "members can update their couple"
on public.couple_spaces for update
to authenticated
using (public.is_couple_member(id))
with check (public.is_couple_member(id));

drop policy if exists "members can read membership" on public.couple_members;
create policy "members can read membership"
on public.couple_members for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_couple_member(couple_id)
);

drop policy if exists "members can read trips" on public.trips;
create policy "members can read trips"
on public.trips for select
to authenticated
using (public.is_couple_member(couple_id));

drop policy if exists "members can insert trips" on public.trips;
create policy "members can insert trips"
on public.trips for insert
to authenticated
with check (
  public.is_couple_member(couple_id)
  and updated_by = auth.uid()
);

drop policy if exists "members can update trips" on public.trips;
create policy "members can update trips"
on public.trips for update
to authenticated
using (public.is_couple_member(couple_id))
with check (
  public.is_couple_member(couple_id)
  and updated_by = auth.uid()
);

drop policy if exists "members can delete trips" on public.trips;
create policy "members can delete trips"
on public.trips for delete
to authenticated
using (public.is_couple_member(couple_id));

drop policy if exists "members can read activities" on public.activities;
create policy "members can read activities"
on public.activities for select
to authenticated
using (public.is_couple_member(couple_id));

drop policy if exists "members can insert activities" on public.activities;
create policy "members can insert activities"
on public.activities for insert
to authenticated
with check (
  public.is_couple_member(couple_id)
  and updated_by = auth.uid()
);

drop policy if exists "members can update activities" on public.activities;
create policy "members can update activities"
on public.activities for update
to authenticated
using (public.is_couple_member(couple_id))
with check (
  public.is_couple_member(couple_id)
  and updated_by = auth.uid()
);

drop policy if exists "members can delete activities" on public.activities;
create policy "members can delete activities"
on public.activities for delete
to authenticated
using (public.is_couple_member(couple_id));

grant select, insert, update, delete on public.couple_spaces to authenticated;
grant select on public.couple_members to authenticated;
grant select, insert, update, delete on public.trips to authenticated;
grant select, insert, update, delete on public.activities to authenticated;

create or replace function public.create_couple_space(
  p_name text,
  p_invite_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  new_couple_id uuid;
  normalized_code text := upper(trim(p_invite_code));
  safe_name text := coalesce(nullif(trim(p_name), ''), '我们的旅行');
begin
  if current_user_id is null then
    raise exception '请先登录后再创建旅行空间';
  end if;

  if exists (
    select 1 from public.couple_members
    where user_id = current_user_id
  ) then
    raise exception '这台设备已经加入了一个旅行空间';
  end if;

  insert into public.couple_spaces (name, invite_code, created_by)
  values (left(safe_name, 48), normalized_code, current_user_id)
  returning id into new_couple_id;

  insert into public.couple_members (user_id, couple_id, role)
  values (current_user_id, new_couple_id, 'owner');

  return new_couple_id;
end;
$$;

create or replace function public.join_couple_space(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  found_couple_id uuid;
  current_member_count integer;
  normalized_code text := upper(trim(p_invite_code));
begin
  if current_user_id is null then
    raise exception '请先登录后再加入旅行空间';
  end if;

  select id
  into found_couple_id
  from public.couple_spaces
  where invite_code = normalized_code
  for update;

  if found_couple_id is null then
    raise exception '邀请码不存在';
  end if;

  if exists (
    select 1 from public.couple_members
    where user_id = current_user_id
      and couple_id = found_couple_id
  ) then
    return found_couple_id;
  end if;

  if exists (
    select 1 from public.couple_members
    where user_id = current_user_id
  ) then
    raise exception '这台设备已经加入了另一个旅行空间';
  end if;

  select count(*)
  into current_member_count
  from public.couple_members
  where couple_id = found_couple_id;

  if current_member_count >= 6 then
    raise exception '这个共享空间已经达到 6 台设备上限';
  end if;

  insert into public.couple_members (user_id, couple_id, role)
  values (current_user_id, found_couple_id, 'member');

  return found_couple_id;
end;
$$;

revoke all on function public.create_couple_space(text, text) from public;
revoke all on function public.join_couple_space(text) from public;
grant execute on function public.create_couple_space(text, text) to authenticated;
grant execute on function public.join_couple_space(text) to authenticated;

create or replace function public.touch_couple_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trips_touch_couple_record on public.trips;
create trigger trips_touch_couple_record
before insert or update on public.trips
for each row execute function public.touch_couple_record();

drop trigger if exists activities_touch_couple_record on public.activities;
create trigger activities_touch_couple_record
before insert or update on public.activities
for each row execute function public.touch_couple_record();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'trips'
  ) then
    alter publication supabase_realtime add table public.trips;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'activities'
  ) then
    alter publication supabase_realtime add table public.activities;
  end if;
end
$$;

insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "couple members can read photos" on storage.objects;
create policy "couple members can read photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'trip-photos'
  and public.is_couple_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "couple members can upload photos" on storage.objects;
create policy "couple members can upload photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'trip-photos'
  and public.is_couple_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "couple members can update photos" on storage.objects;
create policy "couple members can update photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'trip-photos'
  and public.is_couple_member(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'trip-photos'
  and public.is_couple_member(((storage.foldername(name))[1])::uuid)
);

drop policy if exists "couple members can delete photos" on storage.objects;
create policy "couple members can delete photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'trip-photos'
  and public.is_couple_member(((storage.foldername(name))[1])::uuid)
);

-- 初始化完成。匿名登录、项目 URL 和 anon public key 在 App 的
-- “数据与设置 > 情侣云端同步”里填写。
