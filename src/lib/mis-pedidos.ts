"use client";
// Pedidos que hizo este cliente, guardados en su navegador (localStorage) para mostrarle
// el estado en el menú. Solo guarda el número y la clave secreta de seguimiento, nada personal.

import { useSyncExternalStore } from "react";

export type MiPedido = {
  token: string;
  numero: number;
  /** Cuándo se hizo (ms) */
  creado: number;
};

const CLAVE = "burrito-fly:mis-pedidos";
const MAXIMO = 5;
/** Después de un día se deja de mostrar. */
const VIGENCIA_MS = 24 * 60 * 60 * 1000;
const VACIO: MiPedido[] = [];

let cacheTexto: string | null = null;
let cachePedidos: MiPedido[] = VACIO;
const oyentes = new Set<() => void>();

function esValido(p: unknown): p is MiPedido {
  if (!p || typeof p !== "object") return false;
  const x = p as Record<string, unknown>;
  return typeof x.token === "string" && typeof x.numero === "number" && typeof x.creado === "number";
}

function leer(): MiPedido[] {
  let texto: string | null = null;
  try {
    texto = localStorage.getItem(CLAVE);
  } catch {
    return cachePedidos;
  }
  if (texto === cacheTexto) return cachePedidos;
  cacheTexto = texto;
  try {
    const datos = texto ? JSON.parse(texto) : [];
    const limite = Date.now() - VIGENCIA_MS;
    const vigentes = Array.isArray(datos) ? datos.filter((p) => esValido(p) && p.creado > limite) : [];
    cachePedidos = vigentes.length ? vigentes : VACIO;
  } catch {
    cachePedidos = VACIO;
  }
  return cachePedidos;
}

function guardar(pedidos: MiPedido[]) {
  cachePedidos = pedidos.length ? pedidos : VACIO;
  cacheTexto = JSON.stringify(pedidos);
  try {
    localStorage.setItem(CLAVE, cacheTexto);
  } catch {
    // Sin almacenamiento: se queda en memoria hasta recargar.
  }
  oyentes.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  const otraPestana = (e: StorageEvent) => e.key === CLAVE && avisar();
  window.addEventListener("storage", otraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", otraPestana);
  };
}

export function useMisPedidos() {
  return useSyncExternalStore(suscribir, leer, () => VACIO);
}

export function recordarPedido(pedido: Omit<MiPedido, "creado">) {
  const otros = leer().filter((p) => p.token !== pedido.token);
  guardar([{ ...pedido, creado: Date.now() }, ...otros].slice(0, MAXIMO));
}

export function olvidarPedidos(tokens: string[]) {
  const quitar = new Set(tokens);
  const actuales = leer();
  if (actuales.some((p) => quitar.has(p.token))) guardar(actuales.filter((p) => !quitar.has(p.token)));
}
