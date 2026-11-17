"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { cambiarEstadoPedido } from "@/app/admin/acciones";
import { MOTIVO_MAXIMO, SIGUIENTES_ESTADOS, type EstadoPedido } from "@/lib/estados-pedido";
import { AVISO_ERROR, AYUDA, BOTON, BOTON_CLARO, BOTON_OSCURO, BOTON_PELIGRO, CAMPO } from "./estilos";

export const NOMBRES_ESTADO: Record<EstadoPedido, string> = {
  nuevo: "Nuevo",
  aceptado: "Aceptado",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
};

const COLORES_ESTADO: Record<EstadoPedido, string> = {
  nuevo: "bg-rosa text-white",
  aceptado: "bg-mantequilla-oscuro text-chocolate",
  preparando: "bg-mantequilla text-chocolate",
  listo: "bg-[#1f8a4c] text-white",
  entregado: "bg-chocolate text-mantequilla",
  rechazado: "bg-gris-borde text-chocolate",
  cancelado: "bg-gris-borde text-chocolate",
};

/** Texto del botón que lleva a cada estado. */
const ACCION: Partial<Record<EstadoPedido, string>> = {
  aceptado: "✓ Aceptar pedido",
  preparando: "Empezar a preparar",
  listo: "Marcar como listo",
  entregado: "Marcar como entregado",
};

const MOTIVOS_RAPIDOS = ["Se acabó un ingrediente", "Estamos por cerrar", "Fuera de la zona de entrega", "Mucha demanda en este momento"];

/**
 * Botones del pedido según su estado:
 * nuevo → Aceptar / Rechazar; después, el siguiente paso (Preparando → Listo → Entregado) o Cancelar.
 * El cliente ve cada cambio en el menú.
 */
export function CambiarEstado({ id, numero, estado }: { id: number; numero: number; estado: EstadoPedido }) {
  const [actual, ponerActual] = useOptimistic(estado);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const siguientes = SIGUIENTES_ESTADOS[actual] ?? [];

  if (siguientes.length === 0 && !error) return null;

  function cambiar(nuevo: EstadoPedido, motivo = "") {
    setError(null);
    iniciar(async () => {
      ponerActual(nuevo);
      const r = await cambiarEstadoPedido(id, nuevo, motivo);
      if (r?.error) setError(r.error);
    });
  }

  const avanzar = siguientes.filter((e) => e !== "rechazado" && e !== "cancelado");
  const terminar = siguientes.find((e) => e === "rechazado" || e === "cancelado");

  return (
    <div className="flex flex-col gap-2">
      {actual === "nuevo" ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() => cambiar("aceptado")}
            className={`${BOTON} min-h-13 bg-[#1f8a4c] text-base text-white`}
          >
            {ACCION.aceptado}
          </button>
          <BotonConMotivo
            numero={numero}
            estado="rechazado"
            deshabilitado={pendiente}
            alConfirmar={(m) => cambiar("rechazado", m)}
            claseBoton={`${BOTON_PELIGRO} min-h-13 text-base`}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {avanzar.map((e, i) => (
            <button
              key={e}
              type="button"
              disabled={pendiente}
              onClick={() => cambiar(e)}
              className={i === 0 ? `${BOTON_OSCURO} min-h-12 text-[15px]` : BOTON_CLARO}
            >
              {ACCION[e] ?? NOMBRES_ESTADO[e]}
            </button>
          ))}
          {terminar && (
            <span className="ml-auto">
              <BotonConMotivo
                numero={numero}
                estado={terminar}
                deshabilitado={pendiente}
                alConfirmar={(m) => cambiar(terminar, m)}
                claseBoton={BOTON_PELIGRO}
              />
            </span>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className={AVISO_ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Rechazar o cancelar: pide confirmación y un motivo opcional que verá el cliente. */
function BotonConMotivo({
  numero,
  estado,
  deshabilitado,
  alConfirmar,
  claseBoton,
}: {
  numero: number;
  estado: EstadoPedido;
  deshabilitado: boolean;
  alConfirmar: (motivo: string) => void;
  claseBoton: string;
}) {
  const ventana = useRef<HTMLDialogElement>(null);
  const [motivo, setMotivo] = useState("");
  const idTitulo = useId();
  const rechazar = estado === "rechazado";

  return (
    <>
      <button
        type="button"
        disabled={deshabilitado}
        onClick={() => {
          setMotivo("");
          ventana.current?.showModal();
        }}
        className={claseBoton}
      >
        {rechazar ? "Rechazar" : "Cancelar pedido"}
      </button>
      <dialog
        ref={ventana}
        aria-labelledby={idTitulo}
        className="m-auto w-[min(92vw,440px)] rounded-3xl border-0 bg-white p-0 text-chocolate backdrop:bg-black/45"
      >
        <form
          method="dialog"
          onSubmit={(e) => {
            e.preventDefault();
            ventana.current?.close();
            alConfirmar(motivo);
          }}
          className="flex flex-col gap-3 p-5"
        >
          <h2 id={idTitulo} className="font-display text-[30px] leading-none">
            {rechazar ? `¿Rechazar el pedido #${numero}?` : `¿Cancelar el pedido #${numero}?`}
          </h2>
          <p className="text-[15px]">El cliente verá en el menú que su pedido fue {rechazar ? "rechazado" : "cancelado"}.</p>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Motivo para el cliente (opcional)
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              maxLength={MOTIVO_MAXIMO}
              className={`${CAMPO} py-3`}
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS_RAPIDOS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMotivo(m)}
                className="min-h-10 rounded-full border border-gris-borde px-3 text-xs font-semibold"
              >
                {m}
              </button>
            ))}
          </div>
          <p className={AYUDA}>Toca un motivo para usarlo o escribe el tuyo.</p>
          <div className="mt-1 flex flex-wrap justify-end gap-2">
            <button type="button" autoFocus onClick={() => ventana.current?.close()} className={BOTON_CLARO}>
              Volver
            </button>
            <button type="submit" className={`${BOTON} bg-rosa-oscuro text-white`}>
              {rechazar ? "Sí, rechazar" : "Sí, cancelar"}
            </button>
          </div>
        </form>
      </dialog>
    </>
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
