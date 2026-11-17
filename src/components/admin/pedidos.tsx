"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { cambiarEstadoPedido } from "@/app/admin/acciones";
import type { EstadoPedido } from "@/lib/admin";

export const NOMBRES_ESTADO: Record<EstadoPedido, string> = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const COLORES_ESTADO: Record<EstadoPedido, string> = {
  nuevo: "bg-rosa text-white",
  preparando: "bg-mantequilla text-chocolate",
  listo: "bg-[#1f8a4c] text-white",
  entregado: "bg-chocolate text-mantequilla",
  cancelado: "bg-gris-borde text-chocolate",
};

const SIGUIENTES: EstadoPedido[] = ["nuevo", "preparando", "listo", "entregado", "cancelado"];

// Botones para cambiar el estado de un pedido; se guarda al tocar.
export function CambiarEstado({ id, estado }: { id: number; estado: EstadoPedido }) {
  const [actual, ponerActual] = useOptimistic(estado);
  const [, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <div role="group" aria-label="Estado del pedido" className="flex flex-wrap gap-1.5">
        {SIGUIENTES.map((e) => (
          <button
            key={e}
            type="button"
            aria-pressed={actual === e}
            onClick={() => {
              if (e === actual) return;
              setError(null);
              iniciar(async () => {
                ponerActual(e);
                const r = await cambiarEstadoPedido(id, e);
                if (r?.error) setError(r.error);
              });
            }}
            className={`min-h-11 rounded-full px-3.5 text-sm font-semibold transition ${
              actual === e ? COLORES_ESTADO[e] : "border border-gris-borde bg-white text-chocolate"
            }`}
          >
            {NOMBRES_ESTADO[e]}
          </button>
        ))}
      </div>
      {error && (
        <span role="alert" className="text-xs font-semibold text-rosa-oscuro">
          {error}
        </span>
      )}
    </div>
  );
}

export function EtiquetaEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${COLORES_ESTADO[estado]}`}>{NOMBRES_ESTADO[estado]}</span>;
}

// Vuelve a leer los pedidos cada 30 segundos para ver los nuevos sin recargar.
export function ActualizarSolo({ segundos = 30 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);
  return null;
}
