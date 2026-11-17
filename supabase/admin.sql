-- Burrito Fly · Panel de administrador
-- Pégalo completo en Supabase → SQL Editor → New query → Run (después de schema.sql y seed.sql).
-- Se puede volver a correr sin problema.

-- 1. Tabla de administradores --------------------------------------------------
-- Solo los usuarios que estén aquí pueden crear, editar y borrar.
create table if not exists public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- RLS activo y SIN políticas: nadie puede leer ni editar esta tabla desde la app.
-- Se administra solo desde el SQL Editor.
alter table public.admins enable row level security;

-- 2. ¿El usuario con sesión es admin? -------------------------------------------
-- "security definer" = la función corre con permisos del dueño, así puede mirar la
-- tabla admins aunque el usuario no pueda. Solo responde true/false.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Reglas de categories --------------------------------------------------------
-- (La de lectura pública "Cualquiera puede leer las categorías" ya existe en schema.sql.)
drop policy if exists "Admins crean categorías" on public.categories;
create policy "Admins crean categorías"
  on public.categories for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins editan categorías" on public.categories;
create policy "Admins editan categorías"
  on public.categories for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins borran categorías" on public.categories;
create policy "Admins borran categorías"
  on public.categories for delete to authenticated
  using ((select public.is_admin()));

-- 4. Reglas de menu_items --------------------------------------------------------
-- El público sigue viendo solo los disponibles (política de schema.sql).
-- Los admins además ven los agotados, para poder editarlos.
drop policy if exists "Admins ven todos los platillos" on public.menu_items;
create policy "Admins ven todos los platillos"
  on public.menu_items for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins crean platillos" on public.menu_items;
create policy "Admins crean platillos"
  on public.menu_items for insert to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins editan platillos" on public.menu_items;
create policy "Admins editan platillos"
  on public.menu_items for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins borran platillos" on public.menu_items;
create policy "Admins borran platillos"
  on public.menu_items for delete to authenticated
  using ((select public.is_admin()));

-- 5. Bucket de imágenes ---------------------------------------------------------
-- Público para VER (cualquiera puede abrir la foto por su enlace).
-- Solo imágenes JPG, PNG o WebP de hasta 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Solo los admins pueden subir, reemplazar y borrar archivos del bucket.
drop policy if exists "Admins suben imágenes del menú" on storage.objects;
create policy "Admins suben imágenes del menú"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-images' and (select public.is_admin()));

drop policy if exists "Admins editan imágenes del menú" on storage.objects;
create policy "Admins editan imágenes del menú"
  on storage.objects for update to authenticated
  using (bucket_id = 'menu-images' and (select public.is_admin()))
  with check (bucket_id = 'menu-images' and (select public.is_admin()));

drop policy if exists "Admins borran imágenes del menú" on storage.objects;
create policy "Admins borran imágenes del menú"
  on storage.objects for delete to authenticated
  using (bucket_id = 'menu-images' and (select public.is_admin()));

-- Para borrar, Storage primero tiene que poder "ver" el archivo: los admins pueden listarlos.
drop policy if exists "Admins ven imágenes del menú" on storage.objects;
create policy "Admins ven imágenes del menú"
  on storage.objects for select to authenticated
  using (bucket_id = 'menu-images' and (select public.is_admin()));

-- 6. Agrégate como admin ----------------------------------------------------------
-- Cambia el correo por el de tu usuario de Supabase Auth y corre esta parte.
insert into public.admins (user_id)
select id from auth.users where email = 'TU-CORREO@ejemplo.com'
on conflict (user_id) do nothing;

-- Revisión: debe mostrar tu correo.
select u.email, a.created_at
from public.admins a
join auth.users u on u.id = a.user_id;
