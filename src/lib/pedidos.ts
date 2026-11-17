"use server";
// Envío de pedidos (se ejecuta en el servidor). Revisa el anti-spam y llama a la función
// create_order de Supabase, que calcula precios y total leyendo menu_items y guarda todo
// en una sola operación. Se usa la llave pública: el público no puede tocar las tablas.

import type { CodigoError } from "@/i18n";
import { esEstadoPedido, type EstadoPedido } from "@/lib/estados-pedido";
import { supabase } from "@/lib/supabase";

export type DatosPedido = {
  nombre: string;
  telefono: string;
  tipo: "recoger" | "domicilio";
  direccion: string;
  notas: string;
  lineas: { menu_item_id: number; quantity: number; note: string }[];
  /** Total que vio el cliente; si no coincide con el real, se avisa. */
  totalVisto: number;
  /** Campo oculto: una persona nunca lo llena, un robot sí. */
  sitioWeb: string;
  /** Cuándo se abrió el formulario (ms) */
  abiertoEn: number;
};

export type LineaConfirmada = {
  menu_item_id: number;
  item_name: string;
  unit_price: number;
  quantity: number;
  note: string | null;
};

export type RespuestaPedido =
  | {
      ok: true;
      numero: number;
      /** Clave secreta para consultar el estado de este pedido */
      token: string;
      total: number;
      tipo: "recoger" | "domicilio";
      lineas: LineaConfirmada[];
    }
  | {
      ok: false;
      error: CodigoError;
      /** PLATILLO_AGOTADO: id y nombre del platillo */
      agotado?: { id: number; nombre: string };
      /** PRECIOS_CAMBIARON: precios actuales por id */
      precios?: Record<string, number>;
    };

const CODIGOS: CodigoError[] = [
  "NOMBRE_INVALIDO",
  "TELEFONO_INVALIDO",
  "TIPO_INVALIDO",
  "DIRECCION_REQUERIDA",
  "TEXTO_MUY_LARGO",
  "PEDIDO_VACIO",
  "DEMASIADAS_LINEAS",
  "LINEA_INVALIDA",
  "CANTIDAD_INVALIDA",
  "PLATILLO_NO_EXISTE",
  "PLATILLO_AGOTADO",
  "PRECIOS_CAMBIARON",
  "DEMASIADOS_PEDIDOS",
];

const TIEMPO_MINIMO_MS = 3000;

export async function enviarPedido(datos: DatosPedido): Promise<RespuestaPedido> {
  // Anti-spam 1: el campo oculto debe venir vacío. Al robot se le responde un error genérico.
  if (datos.sitioWeb) return { ok: false, error: "GENERAL" };
  // Anti-spam 2: nadie llena el formulario en menos de 3 segundos.
  if (!Number.isFinite(datos.abiertoEn) || Date.now() - datos.abiertoEn < TIEMPO_MINIMO_MS) {
    return { ok: false, error: "MUY_RAPIDO" };
  }

  // Validación rápida (Supabase vuelve a validar todo; esto solo ahorra un viaje).
  const telefono = String(datos.telefono ?? "").replace(/\D/g, "");
  if (!/^\d{10}$/.test(telefono)) return { ok: false, error: "TELEFONO_INVALIDO" };
  if (!Array.isArray(datos.lineas) || datos.lineas.length === 0) return { ok: false, error: "PEDIDO_VACIO" };

  // Solo se envían id, cantidad y nota de cada línea: NUNCA precios.
  const lineas = datos.lineas.map((l) => ({
    menu_item_id: Number(l.menu_item_id),
    quantity: Number(l.quantity),
    note: String(l.note ?? "").slice(0, 200),
  }));

  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: String(datos.nombre ?? ""),
    p_phone: telefono,
    p_order_type: datos.tipo,
    p_address: datos.tipo === "domicilio" ? String(datos.direccion ?? "") : "",
    p_notes: String(datos.notas ?? ""),
    p_items: lineas,
    p_expected_total: Number.isFinite(datos.totalVisto) ? Math.round(datos.totalVisto * 100) / 100 : null,
  });

  if (error) {
    const codigo = CODIGOS.find((c) => error.message?.includes(c));
    if (!codigo) {
      console.error("create_order falló:", error.message);
      return { ok: false, error: "GENERAL" };
    }
    if (codigo === "PLATILLO_AGOTADO" && error.details) {
      const [id, ...nombre] = error.details.split("|");
      return { ok: false, error: codigo, agotado: { id: Number(id), nombre: nombre.join("|") } };
    }
    if (codigo === "PRECIOS_CAMBIARON" && error.details) {
      try {
        return { ok: false, error: codigo, precios: JSON.parse(error.details) };
      } catch {
        return { ok: false, error: codigo };
      }
    }
    return { ok: false, error: codigo };
  }

  const r = data as {
    order_number: number;
    tracking_token: string;
    total: number;
    order_type: "recoger" | "domicilio";
    items: LineaConfirmada[];
  };
  return {
    ok: true,
    numero: Number(r.order_number),
    token: String(r.tracking_token),
    total: Number(r.total),
    tipo: r.order_type,
    lineas: (r.items ?? []).map((l) => ({ ...l, unit_price: Number(l.unit_price) })),
  };
}

// ---------- Seguimiento ----------

export type EstadoCliente = {
  token: string;
  numero: number;
  estado: EstadoPedido;
  motivo: string | null;
  tipo: "recoger" | "domicilio";
  total: number;
  cambio: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Estado de los pedidos de este cliente, con las claves secretas que guardó su navegador.
 * Devuelve null si no se pudo consultar (sin conexión), para no confundirlo con "no existe".
 */
export async function consultarEstados(tokens: string[]): Promise<EstadoCliente[] | null> {
  const validos = (Array.isArray(tokens) ? tokens : []).filter((t) => typeof t === "string" && UUID.test(t)).slice(0, 5);
  if (validos.length === 0) return [];

  const { data, error } = await supabase.rpc("order_status", { p_tokens: validos });
  if (error) {
    console.error("order_status falló:", error.message);
    return null;
  }
  return ((data ?? []) as Record<string, unknown>[])
    .filter((p) => esEstadoPedido(p.status))
    .map((p) => ({
      token: String(p.tracking_token),
      numero: Number(p.order_number),
      estado: p.status as EstadoPedido,
      motivo: (p.status_reason as string | null) ?? null,
      tipo: p.order_type === "domicilio" ? "domicilio" : "recoger",
      total: Number(p.total),
      cambio: String(p.status_changed_at),
    }));
}
