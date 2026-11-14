-- 随行：支持同一共享空间多端登录
-- 已经运行过 schema.sql 的项目，只需在 Supabase SQL Editor 运行本文件一次。
-- 更新后最多允许 6 台设备加入同一个共享空间。

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

revoke all on function public.join_couple_space(text) from public;
grant execute on function public.join_couple_space(text) to authenticated;

-- 完成。手机和电脑现在可以分别使用同一个邀请码加入共享空间。
