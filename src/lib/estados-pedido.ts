// Estados de un pedido y qué pasos siguen después de cada uno.
// Lo usan el panel (botones), el servidor (validar el cambio) y el cliente (seguimiento).

export const ESTADOS_PEDIDO = ["nuevo", "aceptado", "preparando", "listo", "entregado", "rechazado", "cancelado"] as const;
export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number];

/** Estados que terminan el pedido: ya no cambian. */
export const ESTADOS_FINALES: readonly EstadoPedido[] = ["entregado", "rechazado", "cancelado"];

/** Desde cada estado, a cuáles se puede pasar. */
export const SIGUIENTES_ESTADOS: Record<EstadoPedido, EstadoPedido[]> = {
  nuevo: ["aceptado", "rechazado"],
  aceptado: ["preparando", "listo", "cancelado"],
  preparando: ["listo", "cancelado"],
  listo: ["entregado", "cancelado"],
  entregado: [],
  rechazado: [],
  cancelado: [],
};

/** Estados que pueden llevar un motivo para el cliente. */
export const ESTADOS_CON_MOTIVO: readonly EstadoPedido[] = ["rechazado", "cancelado"];
export const MOTIVO_MAXIMO = 200;

export const esEstadoPedido = (e: unknown): e is EstadoPedido =>
  typeof e === "string" && (ESTADOS_PEDIDO as readonly string[]).includes(e);
