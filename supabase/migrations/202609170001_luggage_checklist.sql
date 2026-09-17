-- 行李清单：公开链接协作版
-- 设计目标：每件物品独立一行，避免两个人同时操作时整份清单互相覆盖。

create extension if not exists pgcrypto;

create table if not exists public.luggage_settings (
  id text primary key,
  owner_name text not null check (char_length(btrim(owner_name)) between 1 and 20),
  friend_name text not null check (char_length(btrim(friend_name)) between 1 and 20),
  updated_at timestamptz not null default now()
);

create table if not exists public.luggage_items (
  id uuid primary key default gen_random_uuid(),
  list_type text not null check (list_type in ('owner', 'friend', 'shared')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  quantity smallint not null default 1 check (quantity between 1 and 99),
  packed boolean not null default false,
  last_minute boolean not null default false,
  carrier text check (carrier in ('owner', 'friend')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint luggage_items_carrier_scope check (
    (list_type = 'shared') or carrier is null
  )
);

create index if not exists luggage_items_list_sort_idx
  on public.luggage_items (list_type, sort_order, created_at);

create table if not exists public.luggage_suggestion_choices (
  suggestion_key text primary key,
  decision text not null check (decision in ('added', 'skipped')),
  updated_at timestamptz not null default now()
);

create or replace function public.set_luggage_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_luggage_settings_updated_at on public.luggage_settings;
create trigger set_luggage_settings_updated_at
before update on public.luggage_settings
for each row execute function public.set_luggage_updated_at();

drop trigger if exists set_luggage_items_updated_at on public.luggage_items;
create trigger set_luggage_items_updated_at
before update on public.luggage_items
for each row execute function public.set_luggage_updated_at();

drop trigger if exists set_luggage_suggestions_updated_at on public.luggage_suggestion_choices;
create trigger set_luggage_suggestions_updated_at
before update on public.luggage_suggestion_choices
for each row execute function public.set_luggage_updated_at();

insert into public.luggage_settings (id, owner_name, friend_name)
values ('main', '王渝斐', '朋友')
on conflict (id) do nothing;

insert into public.luggage_items (id, list_type, name, quantity, sort_order)
values
  ('00000000-0000-4000-8000-000000000001', 'owner', '手机卡', 1, 10),
  ('00000000-0000-4000-8000-000000000002', 'owner', '现金 4k泰铢', 1, 20),
  ('00000000-0000-4000-8000-000000000003', 'owner', '护照', 1, 30),
  ('00000000-0000-4000-8000-000000000004', 'owner', '牙刷牙膏旅行装', 1, 40),
  ('00000000-0000-4000-8000-000000000005', 'owner', '充电宝', 1, 50),
  ('00000000-0000-4000-8000-000000000006', 'owner', '钥匙', 1, 60),
  ('00000000-0000-4000-8000-000000000007', 'owner', '颈枕', 1, 70),
  ('00000000-0000-4000-8000-000000000008', 'owner', '化妆品（眼影腮红口红眉笔睫毛膏睫毛夹假睫毛眼线笔修容粉饼定妆粉底液遮瑕高光）', 1, 80),
  ('00000000-0000-4000-8000-000000000009', 'owner', '充电器', 1, 90),
  ('00000000-0000-4000-8000-000000000010', 'owner', '一次性内裤', 1, 100),
  ('00000000-0000-4000-8000-000000000011', 'owner', '速干浴巾', 1, 110),
  ('00000000-0000-4000-8000-000000000012', 'owner', '衣服（工装裤短袖；牛仔裤吊带；旗袍；裙子，睡衣，防晒衣）', 1, 120),
  ('00000000-0000-4000-8000-000000000013', 'owner', '纸巾（干纸巾、湿纸巾）', 1, 130),
  ('00000000-0000-4000-8000-000000000014', 'owner', '卷发棒', 1, 140),
  ('00000000-0000-4000-8000-000000000015', 'owner', '便携卸妆膏', 4, 150),
  ('00000000-0000-4000-8000-000000000016', 'owner', '伞', 1, 160),
  ('00000000-0000-4000-8000-000000000017', 'owner', '胸贴', 1, 170),
  ('00000000-0000-4000-8000-000000000018', 'owner', '牙线', 1, 180),
  ('00000000-0000-4000-8000-000000000019', 'owner', '梳子', 1, 190)
on conflict (id) do nothing;

alter table public.luggage_settings enable row level security;
alter table public.luggage_items enable row level security;
alter table public.luggage_suggestion_choices enable row level security;

revoke all on table public.luggage_settings from anon, authenticated;
revoke all on table public.luggage_items from anon, authenticated;
revoke all on table public.luggage_suggestion_choices from anon, authenticated;
grant select, insert, update, delete on table public.luggage_settings to anon, authenticated;
grant select, insert, update, delete on table public.luggage_items to anon, authenticated;
grant select, insert, update, delete on table public.luggage_suggestion_choices to anon, authenticated;

drop policy if exists luggage_settings_public_link on public.luggage_settings;
create policy luggage_settings_public_link on public.luggage_settings
for all to anon, authenticated using (true) with check (true);

drop policy if exists luggage_items_public_link on public.luggage_items;
create policy luggage_items_public_link on public.luggage_items
for all to anon, authenticated using (true) with check (true);

drop policy if exists luggage_suggestions_public_link on public.luggage_suggestion_choices;
create policy luggage_suggestions_public_link on public.luggage_suggestion_choices
for all to anon, authenticated using (true) with check (true);

comment on table public.luggage_items is
  'Intentional public-link collaboration table. Anyone with the website can edit checklist rows.';
