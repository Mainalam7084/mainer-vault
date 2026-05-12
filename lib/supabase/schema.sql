create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('card', 'coin', 'banknote')),
  image_url text,
  price numeric(12,2) not null default 0,
  purchase_date date,
  purchase_place text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.card_details (
  item_id uuid primary key references public.items(id) on delete cascade,
  player text,
  team text,
  collection text,
  serial_number text,
  type text check (type in ('auto', 'patch', 'base', 'case_hit')),
  condition text
);

create table if not exists public.coin_details (
  item_id uuid primary key references public.items(id) on delete cascade,
  country text,
  year int,
  material text,
  condition text
);

create table if not exists public.banknote_details (
  item_id uuid primary key references public.items(id) on delete cascade,
  country text,
  currency text,
  year int,
  condition text
);

alter table public.items enable row level security;
alter table public.card_details enable row level security;
alter table public.coin_details enable row level security;
alter table public.banknote_details enable row level security;

-- Items: each user only sees and manages their own items
drop policy if exists "open_access_items" on public.items;
drop policy if exists "users_manage_own_items" on public.items;
create policy "users_manage_own_items"
  on public.items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Detail tables: access is scoped through parent item ownership
drop policy if exists "open_access_card_details" on public.card_details;
drop policy if exists "users_manage_own_card_details" on public.card_details;
create policy "users_manage_own_card_details"
  on public.card_details for all
  using (item_id in (select id from public.items where user_id = auth.uid()))
  with check (item_id in (select id from public.items where user_id = auth.uid()));

drop policy if exists "open_access_coin_details" on public.coin_details;
drop policy if exists "users_manage_own_coin_details" on public.coin_details;
create policy "users_manage_own_coin_details"
  on public.coin_details for all
  using (item_id in (select id from public.items where user_id = auth.uid()))
  with check (item_id in (select id from public.items where user_id = auth.uid()));

drop policy if exists "open_access_banknote_details" on public.banknote_details;
drop policy if exists "users_manage_own_banknote_details" on public.banknote_details;
create policy "users_manage_own_banknote_details"
  on public.banknote_details for all
  using (item_id in (select id from public.items where user_id = auth.uid()))
  with check (item_id in (select id from public.items where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('items', 'items', true)
on conflict (id) do nothing;

drop policy if exists "public_items_read" on storage.objects;
create policy "public_items_read"
on storage.objects for select
using (bucket_id = 'items');

drop policy if exists "public_items_write" on storage.objects;
create policy "public_items_write"
on storage.objects for all
using (bucket_id = 'items')
with check (bucket_id = 'items');

-- ============================================================
-- MIGRATION: run this block in Supabase SQL Editor if your
-- items table already exists without the user_id column.
-- ============================================================
-- alter table public.items
--   add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ============================================================
-- MIGRATION: add image_url_2 column (second/back image).
-- Run in Supabase SQL Editor if your items table already exists.
-- ============================================================
-- alter table public.items
--   add column if not exists image_url_2 text;
