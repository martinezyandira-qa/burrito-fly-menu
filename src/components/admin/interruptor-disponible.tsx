"use client";

import { useOptimistic, useState, useTransition } from "react";
import { cambiarDisponible } from "@/app/admin/acciones";

// Interruptor rápido Disponible / Agotado: cambia al tocarlo y se guarda en Supabase.
export function InterruptorDisponible({ id, disponible, nombre }: { id: number; disponible: boolean; nombre: string }) {
  const [valor, ponerValor] = useOptimistic(disponible);
  const [, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function alternar() {
    const nuevo = !valor;
    setError(null);
    iniciar(async () => {
      ponerValor(nuevo);
      const r = await cambiarDisponible(id, nuevo);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={valor}
        aria-label={`${nombre} disponible`}
        onClick={alternar}
        className="inline-flex min-h-11 items-center gap-2.5 rounded-full pr-1 text-sm font-semibold"
      >
        <span
          aria-hidden="true"
          className={`relative h-7 w-12 flex-none rounded-full transition-colors ${valor ? "bg-[#1f8a4c]" : "bg-gris-borde"}`}
        >
          <span
            className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${valor ? "translate-x-5" : ""}`}
          />
        </span>
        <span className={valor ? "text-[#1f8a4c]" : "text-chocolate-suave"}>{valor ? "Disponible" : "Agotado"}</span>
      </button>
      {error && (
        <span role="alert" className="text-xs font-semibold text-rosa-oscuro">
          {error}
        </span>
      )}
    </div>
  );
}
