-- Burrito Fly · Tablas del menú digital
-- Pégalo completo en Supabase → SQL Editor → New query → Run.
-- Se puede volver a correr sin problema: no borra datos.

-- 1. Categorías ---------------------------------------------------------------
create table if not exists public.categories (
  id          bigint generated always as identity primary key,
  slug        text        not null unique,          -- ancla en la carta, ej. "entradas"
  name        text        not null,                 -- español
  name_en     text        not null,                 -- inglés
  image_url   text,                                 -- foto del bloque de la categoría
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. Platillos ----------------------------------------------------------------
create table if not exists public.menu_items (
  id              bigint generated always as identity primary key,
  category_id     bigint        not null references public.categories (id) on delete restrict,
  slug            text          not null unique,    -- dirección de su página, ej. "burrito"
  name            text          not null,           -- español
  name_en         text          not null,           -- inglés
  description     text,                             -- español
  description_en  text,                             -- inglés
  price           numeric(8, 2) not null check (price >= 0),
  image_url       text,
  available       boolean       not null default true,
  sort_order      integer       not null default 0,
  created_at      timestamptz   not null default now()
);

-- Para leer rápido los platillos de una categoría en orden.
create index if not exists menu_items_category_sort_idx
  on public.menu_items (category_id, sort_order);

-- 3. Row Level Security ---------------------------------------------------------
-- Con RLS activo, nadie puede hacer nada salvo lo que permitan las políticas.
-- Solo damos permiso de LEER. Como no hay políticas de insert/update/delete,
-- la llave pública (anon) no puede escribir. El panel de admin lo agregará después.
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "Cualquiera puede leer las categorías" on public.categories;
create policy "Cualquiera puede leer las categorías"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Cualquiera puede leer los platillos disponibles" on public.menu_items;
create policy "Cualquiera puede leer los platillos disponibles"
  on public.menu_items
  for select
  to anon, authenticated
  using (available = true);
