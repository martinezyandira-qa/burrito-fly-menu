// Datos de la carta de Burrito Fly, leídos desde Supabase (tablas categories y menu_items).
// Para agregar o cambiar un producto: edítalo en Supabase. Las fotos siguen en /public/productos.

import { cacheLife, cacheTag } from "next/cache";
import type { Idioma } from "@/i18n";
import { supabase } from "@/lib/supabase";

export type Producto = {
  slug: string;
  nombre: string;
  precio: number;
  descripcion: string;
  /** Ruta o enlace de la foto */
  imagen: string;
  /** Nombre y descripción en inglés */
  en: { nombre: string; descripcion: string };
};

export type Categoria = {
  slug: string;
  nombre: string;
  /** Nombre en inglés */
  nombreEn: string;
  /** Ruta o enlace de la foto que representa a la categoría */
  imagen: string;
  productos: Producto[];
};

// Así llegan las filas desde Supabase.
type FilaPlatillo = {
  slug: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  price: number | string;
  image_url: string | null;
  sort_order: number;
};

type FilaCategoria = {
  slug: string;
  name: string;
  name_en: string;
  image_url: string | null;
  sort_order: number;
  menu_items: FilaPlatillo[];
};

const fotoPorDefecto = (slug: string) => `/productos/${slug}.jpg`;

/**
 * La carta completa: categorías en su orden y, dentro de cada una, solo los platillos
 * con available = true, también en orden. Se guarda en caché ("minutes": se vuelve a
 * consultar a Supabase como máximo una vez por minuto), así la página carga rápido y
 * los cambios en Supabase aparecen poco después sin volver a publicar.
 * La etiqueta "menu" permite que el panel de admin borre esta caché al guardar un cambio,
 * y entonces el menú lo muestra de inmediato.
 */
export const ETIQUETA_MENU = "menu";

export async function obtenerCarta(): Promise<Categoria[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(ETIQUETA_MENU);

  const { data, error } = await supabase
    .from("categories")
    .select(
      "slug, name, name_en, image_url, sort_order, menu_items (slug, name, name_en, description, description_en, price, image_url, sort_order)",
    )
    .eq("menu_items.available", true)
    .order("sort_order", { ascending: true })
    .order("sort_order", { referencedTable: "menu_items", ascending: true })
    .overrideTypes<FilaCategoria[], { merge: false }>();

  if (error) throw new Error(`No se pudo leer el menú de Supabase: ${error.message}`);

  return (data ?? [])
    .map((c) => {
      const productos = c.menu_items.map((p) => ({
        slug: p.slug,
        nombre: p.name,
        precio: Number(p.price),
        descripcion: p.description ?? "",
        imagen: p.image_url ?? fotoPorDefecto(p.slug),
        en: { nombre: p.name_en, descripcion: p.description_en ?? "" },
      }));
      return {
        slug: c.slug,
        nombre: c.name,
        nombreEn: c.name_en,
        // Sin foto propia, la categoría usa la del primer platillo.
        imagen: c.image_url ?? productos[0]?.imagen ?? fotoPorDefecto(c.slug),
        productos,
      };
    })
    // Una categoría sin platillos disponibles no se muestra.
    .filter((c) => c.productos.length > 0);
}

export const precioTexto = (precio: number) => `$${precio.toFixed(2)}`;

export const numeroCategoria = (indice: number) => String(indice + 1).padStart(2, "0");

/** Nombre y descripción del producto en el idioma pedido */
export const textoProducto = (p: Producto, idioma: Idioma) =>
  idioma === "en" ? p.en : { nombre: p.nombre, descripcion: p.descripcion };

export const nombreCategoria = (c: Categoria, idioma: Idioma) => (idioma === "en" ? c.nombreEn : c.nombre);

export async function buscarProducto(slug: string) {
  const categorias = await obtenerCarta();
  for (let i = 0; i < categorias.length; i++) {
    const categoria = categorias[i];
    const producto = categoria.productos.find((p) => p.slug === slug);
    if (producto) return { producto, categoria, indiceCategoria: i };
  }
  return null;
}

// Colores de las tarjetas de producto, en orden: marrón, amarillo, rosa, marrón.
export const TONOS_TARJETA = [
  "bg-chocolate text-mantequilla",
  "bg-mantequilla",
  "bg-rosa text-white",
  "bg-chocolate text-mantequilla",
] as const;
