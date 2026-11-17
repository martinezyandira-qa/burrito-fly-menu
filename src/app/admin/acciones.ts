"use server";
// Acciones del panel (se ejecutan en el servidor). Cada una comprueba que seas admin,
// escribe con tu sesión (RLS decide) y borra la caché "menu" para que el menú público
// muestre el cambio de inmediato.

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ETIQUETA_MENU } from "@/data/menu";
import { ESTADOS_PEDIDO, clienteAdmin, crearSlug, type EstadoPedido } from "@/lib/admin";
import { BUCKET_FOTOS, rutaEnBucket } from "@/lib/supabase-config";
import { crearClienteServidor } from "@/lib/supabase-servidor";

export type Resultado = { error?: string; ok?: boolean } | undefined;

type Cliente = Awaited<ReturnType<typeof clienteAdmin>>;

const texto = (form: FormData, campo: string) => String(form.get(campo) ?? "").trim();

function mensaje(error: unknown) {
  return error instanceof Error ? error.message : "Algo salió mal. Intenta de nuevo.";
}

function menuCambio() {
  updateTag(ETIQUETA_MENU); // el menú público vuelve a leer de Supabase
}

/** Slug único en la tabla: "tacos", "tacos-2", "tacos-3"… */
async function slugLibre(supabase: Cliente, tabla: "categories" | "menu_items", base: string) {
  const { data } = await supabase.from(tabla).select("slug").like("slug", `${base}%`);
  const usados = new Set((data ?? []).map((f) => f.slug));
  if (!usados.has(base)) return base;
  let n = 2;
  while (usados.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

async function borrarFotoDelBucket(supabase: Cliente, imagen: string | null | undefined) {
  const ruta = rutaEnBucket(imagen);
  if (ruta) await supabase.storage.from(BUCKET_FOTOS).remove([ruta]);
}

// ---------- Sesión ----------

export async function iniciarSesion(_previo: Resultado, form: FormData): Promise<Resultado> {
  const correo = texto(form, "correo");
  const contrasena = String(form.get("contrasena") ?? "");
  if (!correo || !contrasena) return { error: "Escribe tu correo y tu contraseña." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect("/admin");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Platillos ----------

export async function guardarPlatillo(_previo: Resultado, form: FormData): Promise<Resultado> {
  let supabase: Cliente;
  try {
    supabase = await clienteAdmin();
  } catch (e) {
    return { error: mensaje(e) };
  }

  const id = Number(form.get("id")) || null;
  const nombre = texto(form, "name");
  const descripcion = texto(form, "description");
  const categoria = Number(form.get("category_id"));
  const precio = Number(texto(form, "price").replace(",", "."));
  const imagen = texto(form, "image_url") || null;
  const imagenAnterior = texto(form, "image_url_anterior") || null;

  if (!nombre) return { error: "Escribe el nombre del platillo." };
  if (!categoria) return { error: "Elige una categoría." };
  if (!Number.isFinite(precio) || precio < 0) return { error: "Escribe un precio válido, por ejemplo 8.99." };

  const datos = {
    name: nombre,
    // Si el inglés queda vacío, se usa el español para que el menú en inglés no quede en blanco.
    name_en: texto(form, "name_en") || nombre,
    description: descripcion || null,
    description_en: texto(form, "description_en") || descripcion || null,
    price: Math.round(precio * 100) / 100,
    category_id: categoria,
    image_url: imagen,
    available: form.get("available") === "on",
  };

  // Al final de su categoría (al crear, o si cambió de categoría).
  async function ultimoOrden() {
    const { data } = await supabase
      .from("menu_items")
      .select("sort_order")
      .eq("category_id", categoria)
      .order("sort_order", { ascending: false })
      .limit(1);
    return (data?.[0]?.sort_order ?? 0) + 1;
  }

  if (id) {
    const { data: actual } = await supabase.from("menu_items").select("category_id").eq("id", id).maybeSingle();
    if (!actual) return { error: "Ese platillo ya no existe." };
    const cambios = actual.category_id !== categoria ? { ...datos, sort_order: await ultimoOrden() } : datos;
    const { error } = await supabase.from("menu_items").update(cambios).eq("id", id);
    if (error) return { error: `No se pudo guardar: ${error.message}` };
  } else {
    const slug = await slugLibre(supabase, "menu_items", crearSlug(nombre));
    const { error } = await supabase.from("menu_items").insert({ ...datos, slug, sort_order: await ultimoOrden() });
    if (error) return { error: `No se pudo guardar: ${error.message}` };
  }

  // Si se cambió la foto, se borra la anterior del bucket (las fotos originales no se tocan).
  if (imagenAnterior && imagenAnterior !== imagen) await borrarFotoDelBucket(supabase, imagenAnterior);

  menuCambio();
  redirect("/admin");
}

export async function cambiarDisponible(id: number, disponible: boolean): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("menu_items").update({ available: disponible }).eq("id", id);
    if (error) return { error: `No se pudo cambiar: ${error.message}` };
    menuCambio();
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function borrarPlatillo(id: number): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const { data: platillo } = await supabase.from("menu_items").select("image_url").eq("id", id).maybeSingle();
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return { error: `No se pudo borrar: ${error.message}` };
    await borrarFotoDelBucket(supabase, platillo?.image_url);
    menuCambio();
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

// ---------- Pedidos ----------

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Resultado> {
  try {
    if (!ESTADOS_PEDIDO.includes(estado)) return { error: "Estado inválido." };
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("orders").update({ status: estado }).eq("id", id);
    if (error) return { error: `No se pudo cambiar: ${error.message}` };
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function borrarPedido(id: number): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return { error: `No se pudo borrar: ${error.message}` };
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

// ---------- Categorías ----------

export async function guardarCategoria(_previo: Resultado, form: FormData): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const id = Number(form.get("id")) || null;
    const nombre = texto(form, "name");
    if (!nombre) return { error: "Escribe el nombre de la categoría." };
    const datos = { name: nombre, name_en: texto(form, "name_en") || nombre };

    if (id) {
      const { error } = await supabase.from("categories").update(datos).eq("id", id);
      if (error) return { error: `No se pudo guardar: ${error.message}` };
    } else {
      const slug = await slugLibre(supabase, "categories", crearSlug(nombre));
      const { data: ultima } = await supabase
        .from("categories")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);
      const { error } = await supabase
        .from("categories")
        .insert({ ...datos, slug, sort_order: (ultima?.[0]?.sort_order ?? 0) + 1 });
      if (error) return { error: `No se pudo guardar: ${error.message}` };
    }
    menuCambio();
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

export async function borrarCategoria(id: number): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const { count } = await supabase
      .from("menu_items")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    if (count && count > 0) {
      return { error: `Esta categoría tiene ${count} platillo(s). Muévelos a otra categoría o bórralos primero.` };
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: `No se pudo borrar: ${error.message}` };
    menuCambio();
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}

/** Sube (-1) o baja (+1) una categoría un lugar y renumera el orden 1, 2, 3… */
export async function moverCategoria(id: number, direccion: -1 | 1): Promise<Resultado> {
  try {
    const supabase = await clienteAdmin();
    const { data, error } = await supabase.from("categories").select("id, sort_order").order("sort_order").order("id");
    if (error) return { error: `No se pudo mover: ${error.message}` };
    const lista = data ?? [];
    const i = lista.findIndex((c) => c.id === id);
    const j = i + direccion;
    if (i < 0 || j < 0 || j >= lista.length) return { ok: true };
    [lista[i], lista[j]] = [lista[j], lista[i]];

    const cambios = lista
      .map((c, indice) => ({ id: c.id, antes: c.sort_order, despues: indice + 1 }))
      .filter((c) => c.antes !== c.despues);
    for (const c of cambios) {
      const { error: e } = await supabase.from("categories").update({ sort_order: c.despues }).eq("id", c.id);
      if (e) return { error: `No se pudo mover: ${e.message}` };
    }
    menuCambio();
    refresh();
    return { ok: true };
  } catch (e) {
    return { error: mensaje(e) };
  }
}
