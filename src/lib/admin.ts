// Acceso a datos del panel (solo servidor). Toda lectura y escritura usa la sesión del
// admin, y Supabase (RLS) decide qué se permite. Aquí se centraliza la comprobación.
import { crearClienteServidor } from "@/lib/supabase-servidor";

export type CategoriaAdmin = {
  id: number;
  slug: string;
  name: string;
  name_en: string;
  image_url: string | null;
  sort_order: number;
};

export type PlatilloAdmin = {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  sort_order: number;
};

export type Sesion =
  | { estado: "sin-sesion" }
  | { estado: "sin-permiso"; correo: string }
  | { estado: "admin"; correo: string };

/** ¿Quién está usando el panel? Verifica la sesión y que el usuario esté en la tabla admins. */
export async function obtenerSesion(): Promise<Sesion> {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return { estado: "sin-sesion" };
  const correo = typeof claims.email === "string" ? claims.email : "";
  const { data: esAdmin } = await supabase.rpc("is_admin");
  return esAdmin === true ? { estado: "admin", correo } : { estado: "sin-permiso", correo };
}

/**
 * Para las acciones (guardar, borrar…): devuelve el cliente solo si eres admin.
 * Las acciones se pueden llamar con un POST directo, por eso cada una lo comprueba.
 */
export async function clienteAdmin() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Tu sesión terminó. Vuelve a iniciar sesión.");
  const { data: esAdmin } = await supabase.rpc("is_admin");
  if (esAdmin !== true) throw new Error("Tu cuenta no tiene permiso de administrador.");
  return supabase;
}

export async function obtenerCategoriasAdmin(): Promise<CategoriaAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, name_en, image_url, sort_order")
    .order("sort_order")
    .order("id");
  if (error) throw new Error(`No se pudieron leer las categorías: ${error.message}`);
  return data ?? [];
}

/** Todos los platillos, también los agotados (la regla RLS de admins lo permite). */
export async function obtenerPlatillosAdmin(): Promise<PlatilloAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, category_id, slug, name, name_en, description, description_en, price, image_url, available, sort_order")
    .order("sort_order")
    .order("id");
  if (error) throw new Error(`No se pudieron leer los platillos: ${error.message}`);
  return (data ?? []).map((p) => ({ ...p, price: Number(p.price) }));
}

export async function obtenerPlatilloAdmin(id: number): Promise<PlatilloAdmin | null> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, category_id, slug, name, name_en, description, description_en, price, image_url, available, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer el platillo: ${error.message}`);
  return data ? { ...data, price: Number(data.price) } : null;
}

export const ESTADOS_PEDIDO = ["nuevo", "preparando", "listo", "entregado", "cancelado"] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

export type PedidoAdmin = {
  id: number;
  order_number: number;
  customer_name: string;
  phone: string;
  order_type: "recoger" | "domicilio";
  address: string | null;
  notes: string | null;
  total: number;
  status: EstadoPedido;
  created_at: string;
  order_items: { id: number; item_name: string; unit_price: number; quantity: number; note: string | null }[];
};

/** Pedidos más recientes primero (solo admins pueden leerlos, por RLS). */
export async function obtenerPedidosAdmin(limite = 60): Promise<PedidoAdmin[]> {
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, phone, order_type, address, notes, total, status, created_at, order_items (id, item_name, unit_price, quantity, note)",
    )
    .order("created_at", { ascending: false })
    .order("id", { referencedTable: "order_items" })
    .limit(limite);
  if (error) throw new Error(`No se pudieron leer los pedidos: ${error.message}`);
  return (data ?? []).map((p) => ({
    ...p,
    total: Number(p.total),
    order_items: (p.order_items ?? []).map((l) => ({ ...l, unit_price: Number(l.unit_price) })),
  })) as PedidoAdmin[];
}

/** "Tacos al Pastor (3)" → "tacos-al-pastor-3" */
export function crearSlug(texto: string) {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}
