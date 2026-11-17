"use client";

import { useId, useRef, useState, useTransition } from "react";
import type { Resultado } from "@/app/admin/acciones";
import { AVISO_ERROR, BOTON_CLARO, BOTON_PELIGRO, BOTON_PRINCIPAL } from "./estilos";

type Props = {
  /** Acción de borrar ya preparada con el id (viene del servidor). */
  accion: () => Promise<Resultado>;
  titulo: string;
  texto?: string;
  etiqueta?: string;
};

// Botón "Borrar" que primero pide confirmación en una ventana.
export function BotonBorrar({ accion, titulo, texto = "Esto no se puede deshacer.", etiqueta = "Borrar" }: Props) {
  const ventana = useRef<HTMLDialogElement>(null);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const idTitulo = useId();

  function confirmar() {
    iniciar(async () => {
      const r = await accion();
      if (r?.error) setError(r.error);
      else ventana.current?.close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          ventana.current?.showModal();
        }}
        className={BOTON_PELIGRO}
      >
        {etiqueta}
      </button>
      <dialog
        ref={ventana}
        aria-labelledby={idTitulo}
        className="m-auto w-[min(92vw,420px)] rounded-3xl border-0 bg-white p-0 text-chocolate backdrop:bg-black/45"
      >
        <div className="flex flex-col gap-3 p-5">
          <h2 id={idTitulo} className="font-display text-[30px] leading-none">{titulo}</h2>
          <p className="text-[15px]">{texto}</p>
          {error && (
            <p role="alert" className={AVISO_ERROR}>
              {error}
            </p>
          )}
          <div className="mt-1 flex flex-wrap justify-end gap-2">
            <button type="button" autoFocus onClick={() => ventana.current?.close()} className={BOTON_CLARO}>
              Cancelar
            </button>
            <button type="button" onClick={confirmar} disabled={pendiente} className={BOTON_PRINCIPAL}>
              {pendiente ? "Borrando…" : "Sí, borrar"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
