-- Burrito Fly · Pedidos
-- Pégalo completo en Supabase → SQL Editor → New query → Run (después de schema.sql y admin.sql).
-- Se puede volver a correr sin problema: no borra pedidos (también sirve para actualizar
-- una instalación anterior: agrega las columnas y estados nuevos).

-- 1. Número de pedido corto y legible: #1001, #1002, …
create sequence if not exists public.orders_number_seq start with 1001;

-- 2. Pedidos ------------------------------------------------------------------
create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  order_number   bigint        not null unique default nextval('public.orders_number_seq'),
  customer_name  text          not null check (char_length(customer_name) between 2 and 80),
  phone          text          not null check (phone ~ '^[0-9]{10}$'),
  order_type     text          not null check (order_type in ('recoger', 'domicilio')),
  address        text          check (address is null or char_length(address) <= 300),
  notes          text          check (notes is null or char_length(notes) <= 500),
  total          numeric(10, 2) not null check (total >= 0),
  status         text          not null default 'nuevo'
                 check (status in ('nuevo', 'aceptado', 'preparando', 'listo', 'entregado', 'rechazado', 'cancelado')),
  status_reason  text          check (status_reason is null or char_length(status_reason) <= 200),
  status_changed_at timestamptz not null default now(),
  -- Clave secreta y aleatoria para que SOLO quien hizo el pedido pueda ver su estado.
  tracking_token uuid          not null default gen_random_uuid(),
  created_at     timestamptz   not null default now(),
  -- A domicilio necesita dirección; para recoger no lleva.
  constraint orders_direccion_segun_tipo check (
    (order_type = 'domicilio' and address is not null and char_length(address) >= 5)
    or (order_type = 'recoger' and address is null)
  )
);

alter sequence public.orders_number_seq owned by public.orders.order_number;

-- Actualización para instalaciones anteriores (si las columnas ya existen, no hace nada).
alter table public.orders add column if not exists status_reason text
  check (status_reason is null or char_length(status_reason) <= 200);
alter table public.orders add column if not exists status_changed_at timestamptz not null default now();
alter table public.orders add column if not exists tracking_token uuid not null default gen_random_uuid();
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('nuevo', 'aceptado', 'preparando', 'listo', 'entregado', 'rechazado', 'cancelado'));
create unique index if not exists orders_tracking_token_idx on public.orders (tracking_token);

-- Guarda la hora de cada cambio de estado.
create or replace function public.orders_marcar_cambio_estado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_cambio_estado on public.orders;
create trigger orders_cambio_estado
  before update on public.orders
  for each row execute function public.orders_marcar_cambio_estado();

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_created_idx on public.orders (phone, created_at desc);

-- 3. Líneas del pedido ----------------------------------------------------------
-- Guardan nombre y precio AL MOMENTO del pedido: si después cambias el menú, el historial no cambia.
create table if not exists public.order_items (
  id            bigint generated always as identity primary key,
  order_id      bigint        not null references public.orders (id) on delete cascade,
  menu_item_id  bigint        references public.menu_items (id) on delete set null,
  item_name     text          not null,
  unit_price    numeric(8, 2) not null check (unit_price >= 0),
  quantity      integer       not null check (quantity between 1 and 20),
  note          text          check (note is null or char_length(note) <= 200)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- 4. Seguridad (RLS) ------------------------------------------------------------
-- El público NO puede leer, crear directo, editar ni borrar pedidos.
-- Solo crea pedidos a través de la función create_order (más abajo).
-- Los admins pueden leerlos, cambiarlos (estado) y borrarlos.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins leen pedidos" on public.orders;
create policy "Admins leen pedidos" on public.orders
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins cambian pedidos" on public.orders;
create policy "Admins cambian pedidos" on public.orders
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins borran pedidos" on public.orders;
create policy "Admins borran pedidos" on public.orders
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admins leen líneas de pedidos" on public.order_items;
create policy "Admins leen líneas de pedidos" on public.order_items
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins borran líneas de pedidos" on public.order_items;
create policy "Admins borran líneas de pedidos" on public.order_items
  for delete to authenticated using ((select public.is_admin()));

-- 5. Crear un pedido ------------------------------------------------------------
-- Recibe datos del cliente y, por cada línea, SOLO { menu_item_id, quantity, note }.
-- Los precios y el total se calculan aquí, leyendo menu_items. Todo pasa en una sola
-- operación: si algo falla, no se guarda nada.
-- Errores (en "message"): NOMBRE_INVALIDO, TELEFONO_INVALIDO, TIPO_INVALIDO, DIRECCION_REQUERIDA,
-- TEXTO_MUY_LARGO, PEDIDO_VACIO, DEMASIADAS_LINEAS, LINEA_INVALIDA, CANTIDAD_INVALIDA,
-- PLATILLO_NO_EXISTE, PLATILLO_AGOTADO (detail = id|nombre), PRECIOS_CAMBIARON
-- (detail = precios actuales en JSON), DEMASIADOS_PEDIDOS.
create or replace function public.create_order(
  p_customer_name  text,
  p_phone          text,
  p_order_type     text,
  p_address        text,
  p_notes          text,
  p_items          jsonb,
  p_expected_total numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name     text := btrim(coalesce(p_customer_name, ''));
  v_phone    text := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  v_type     text := btrim(coalesce(p_order_type, ''));
  v_address  text := nullif(btrim(coalesce(p_address, '')), '');
  v_notes    text := nullif(btrim(coalesce(p_notes, '')), '');
  v_line     jsonb;
  v_item     record;
  v_qty      integer;
  v_note     text;
  v_total    numeric(10, 2) := 0;
  v_lines    jsonb := '[]'::jsonb;
  v_prices   jsonb := '{}'::jsonb;
  v_recent   integer;
  v_order_id bigint;
  v_number   bigint;
  v_token    uuid;
begin
  -- Datos del cliente
  if char_length(v_name) not between 2 and 80 then
    raise exception 'NOMBRE_INVALIDO';
  end if;
  if v_phone !~ '^[0-9]{10}$' then
    raise exception 'TELEFONO_INVALIDO';
  end if;
  if v_type not in ('recoger', 'domicilio') then
    raise exception 'TIPO_INVALIDO';
  end if;
  if v_type = 'domicilio' and (v_address is null or char_length(v_address) < 5) then
    raise exception 'DIRECCION_REQUERIDA';
  end if;
  if v_type = 'recoger' then
    v_address := null;
  end if;
  if char_length(coalesce(v_address, '')) > 300 or char_length(coalesce(v_notes, '')) > 500 then
    raise exception 'TEXTO_MUY_LARGO';
  end if;

  -- Contra spam: máximo 3 pedidos por teléfono cada 10 minutos.
  select count(*) into v_recent
  from public.orders
  where phone = v_phone and created_at > now() - interval '10 minutes';
  if v_recent >= 3 then
    raise exception 'DEMASIADOS_PEDIDOS';
  end if;

  -- Líneas
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'PEDIDO_VACIO';
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'DEMASIADAS_LINEAS';
  end if;

  for v_line in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_line) <> 'object'
       or coalesce(v_line ->> 'menu_item_id', '') !~ '^[0-9]{1,15}$' then
      raise exception 'LINEA_INVALIDA';
    end if;
    if coalesce(v_line ->> 'quantity', '') !~ '^[0-9]{1,2}$' then
      raise exception 'CANTIDAD_INVALIDA';
    end if;
    v_qty := (v_line ->> 'quantity')::integer;
    if v_qty < 1 or v_qty > 20 then
      raise exception 'CANTIDAD_INVALIDA';
    end if;
    v_note := nullif(btrim(coalesce(v_line ->> 'note', '')), '');
    if char_length(coalesce(v_note, '')) > 200 then
      raise exception 'TEXTO_MUY_LARGO';
    end if;

    -- El precio SIEMPRE sale de la base de datos.
    select id, name, price, available into v_item
    from public.menu_items
    where id = (v_line ->> 'menu_item_id')::bigint;
    if not found then
      raise exception 'PLATILLO_NO_EXISTE' using detail = (v_line ->> 'menu_item_id');
    end if;
    if not v_item.available then
      raise exception 'PLATILLO_AGOTADO' using detail = v_item.id || '|' || v_item.name;
    end if;

    v_total := v_total + v_item.price * v_qty;
    v_prices := v_prices || jsonb_build_object(v_item.id::text, v_item.price);
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'menu_item_id', v_item.id,
      'item_name', v_item.name,
      'unit_price', v_item.price,
      'quantity', v_qty,
      'note', v_note
    ));
  end loop;

  -- Si el cliente vio otro total (cambió un precio), no se crea: se le avisa con los precios nuevos.
  if p_expected_total is not null and round(p_expected_total, 2) <> v_total then
    raise exception 'PRECIOS_CAMBIARON' using detail = v_prices::text;
  end if;

  insert into public.orders (customer_name, phone, order_type, address, notes, total)
  values (v_name, v_phone, v_type, v_address, v_notes, v_total)
  returning id, order_number, tracking_token into v_order_id, v_number, v_token;

  insert into public.order_items (order_id, menu_item_id, item_name, unit_price, quantity, note)
  select v_order_id,
         (l ->> 'menu_item_id')::bigint,
         l ->> 'item_name',
         (l ->> 'unit_price')::numeric,
         (l ->> 'quantity')::integer,
         l ->> 'note'
  from jsonb_array_elements(v_lines) as l;

  return jsonb_build_object(
    'order_number', v_number,
    'tracking_token', v_token,
    'total', v_total,
    'order_type', v_type,
    'items', v_lines
  );
end;
$$;

-- Solo esta función es pública; las tablas siguen cerradas.
revoke all on function public.create_order(text, text, text, text, text, jsonb, numeric) from public;
grant execute on function public.create_order(text, text, text, text, text, jsonb, numeric) to anon, authenticated;

-- 6. Estado del pedido para el cliente ----------------------------------------------
-- El cliente guarda en su navegador la clave secreta (tracking_token) de su pedido y con
-- ella pregunta el estado. Solo responde lo que la tarjeta muestra: número, estado, motivo y
-- tipo (para decir "pasa a recogerlo" o "va en camino"). Nunca nombre, teléfono, dirección,
-- notas, platillos ni total. El número de pedido NO sirve para consultar: solo la clave
-- (UUID aleatorio de 122 bits, imposible de adivinar). Máximo 5 claves por consulta y
-- pedidos de los últimos 2 días.
create or replace function public.order_status(p_tokens uuid[])
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'tracking_token', o.tracking_token,
           'order_number', o.order_number,
           'status', o.status,
           'status_reason', o.status_reason,
           'order_type', o.order_type
         ) order by o.created_at desc), '[]'::jsonb)
  from public.orders o
  where o.tracking_token = any (p_tokens[1:5])
    and o.created_at > now() - interval '2 days';
$$;

revoke all on function public.order_status(uuid[]) from public;
grant execute on function public.order_status(uuid[]) to anon, authenticated;
