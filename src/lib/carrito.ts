"use client";
// Carrito del cliente. Vive en localStorage (no se pierde al recargar) y es el mismo en español
// e inglés. Los precios de aquí son SOLO para mostrar: el precio real lo calcula Supabase.

import { useSyncExternalStore } from "react";

export type LineaCarrito = {
  /** Identificador de la línea (el mismo platillo con otra nota es otra línea) */
  linea: string;
  id: number;
  slug: string;
  nombre: string;
  nombreEn: string;
  precio: number;
  imagen: string;
  cantidad: number;
  nota: string;
  /** Marcado cuando el servidor avisa que ya no está disponible */
  agotado?: boolean;
};

export type ProductoParaCarrito = Pick<LineaCarrito, "id" | "slug" | "nombre" | "nombreEn" | "precio" | "imagen">;

export const CANTIDAD_MAXIMA = 20;
export const NOTA_MAXIMA = 200;
const CLAVE = "burrito-fly:carrito";
const VACIO: LineaCarrito[] = [];

let cacheTexto: string | null = null;
let cacheLineas: LineaCarrito[] = VACIO;
const oyentes = new Set<() => void>();

function leer(): LineaCarrito[] {
  let texto: string | null = null;
  try {
    texto = localStorage.getItem(CLAVE);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el carrito vive solo en memoria.
    return cacheLineas;
  }
  if (texto === cacheTexto) return cacheLineas;
  cacheTexto = texto;
  try {
    const datos = texto ? JSON.parse(texto) : [];
    cacheLineas = Array.isArray(datos) ? datos.filter(esLineaValida) : VACIO;
  } catch {
    cacheLineas = VACIO;
  }
  return cacheLineas;
}

function esLineaValida(l: unknown): l is LineaCarrito {
  if (!l || typeof l !== "object") return false;
  const x = l as Record<string, unknown>;
  return (
    typeof x.linea === "string" &&
    typeof x.id === "number" &&
    typeof x.nombre === "string" &&
    typeof x.precio === "number" &&
    typeof x.cantidad === "number"
  );
}

function guardar(lineas: LineaCarrito[]) {
  cacheLineas = lineas;
  cacheTexto = JSON.stringify(lineas);
  try {
    localStorage.setItem(CLAVE, cacheTexto);
  } catch {
    // Sin almacenamiento: se queda en memoria hasta recargar.
  }
  oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  // Si el carrito cambia en otra pestaña, también se actualiza aquí.
  const otraPestana = (e: StorageEvent) => e.key === CLAVE && avisar();
  window.addEventListener("storage", otraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", otraPestana);
  };
}

/** Lee el carrito y se actualiza solo cuando cambia. En el servidor siempre está vacío. */
export function useCarrito() {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

export const totalCarrito = (lineas: LineaCarrito[]) =>
  Math.round(lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0) * 100) / 100;

export const cantidadCarrito = (lineas: LineaCarrito[]) => lineas.reduce((suma, l) => suma + l.cantidad, 0);

const limitar = (n: number) => Math.min(CANTIDAD_MAXIMA, Math.max(1, Math.round(n) || 1));

export function agregarAlCarrito(producto: ProductoParaCarrito, cantidad = 1, nota = "") {
  const notaLimpia = nota.trim().slice(0, NOTA_MAXIMA);
  const lineas = leer();
  const igual = lineas.find((l) => l.id === producto.id && l.nota === notaLimpia);
  if (igual) {
    guardar(lineas.map((l) => (l === igual ? { ...l, ...producto, cantidad: limitar(l.cantidad + cantidad), agotado: false } : l)));
  } else {
    const linea = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    guardar([...lineas, { ...producto, linea, cantidad: limitar(cantidad), nota: notaLimpia }]);
  }
}

export function cambiarCantidad(linea: string, cantidad: number) {
  guardar(leer().map((l) => (l.linea === linea ? { ...l, cantidad: limitar(cantidad) } : l)));
}

export function cambiarNota(linea: string, nota: string) {
  guardar(leer().map((l) => (l.linea === linea ? { ...l, nota: nota.slice(0, NOTA_MAXIMA) } : l)));
}

export function quitarDelCarrito(linea: string) {
  guardar(leer().filter((l) => l.linea !== linea));
}

export function vaciarCarrito() {
  guardar([]);
}

/** El servidor avisó que un platillo se agotó: se marca para que el cliente lo quite. */
export function marcarAgotado(id: number) {
  guardar(leer().map((l) => (l.id === id ? { ...l, agotado: true } : l)));
}

/** El servidor mandó precios nuevos: se actualizan en el carrito. */
export function actualizarPrecios(precios: Record<string, number>) {
  guardar(leer().map((l) => (precios[l.id] !== undefined ? { ...l, precio: Number(precios[l.id]) } : l)));
}
