"use client";

import { useEffect, useRef, useState } from "react";
import { WIFI } from "@/config";
import { IconoCheck, IconoCopiar, IconoWifi } from "./iconos";

export function BotonWifi() {
  const [abierto, setAbierto] = useState(false);
  const [copiada, setCopiada] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  // Bloquea el scroll de la página mientras la ventana está abierta.
  useEffect(() => {
    if (!abierto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [abierto]);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function copiar() {
    // El cambio a "Copiada" no espera al portapapeles: algunos navegadores tardan o piden permiso.
    try {
      navigator.clipboard?.writeText(WIFI.contrasena).catch(() => {});
    } catch {
      // Si el navegador no deja copiar, la contraseña igual está a la vista.
    }
    setCopiada(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCopiada(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex min-h-18 cursor-pointer items-center justify-between gap-2 rounded-2xl bg-chocolate py-3 pr-3 pl-4 text-left text-xs font-semibold tracking-[0.16em] text-mantequilla uppercase transition active:scale-[0.98]"
      >
        <span>Wi-Fi</span>
        <span className="flex size-10 flex-none items-center justify-center rounded-full bg-mantequilla text-chocolate">
          <IconoWifi />
        </span>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex animate-aparecer items-end justify-center bg-chocolate/55 md:items-center"
          onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
        >
          <button
            type="button"
            aria-label="Cerrar"
            tabIndex={-1}
            onClick={() => setAbierto(false)}
            className="absolute inset-0 size-full cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wifi-titulo"
            className="relative flex max-h-[92dvh] w-full max-w-120 animate-subir flex-col gap-3 overflow-y-auto rounded-t-[28px] bg-white px-4 pt-3 pb-5 md:rounded-[28px]"
          >
            <span aria-hidden="true" className="h-1 w-10 self-center rounded-full bg-gris-borde" />
            <div className="flex items-center justify-between gap-3 py-1 pr-1 pl-1.5">
              <h2 id="wifi-titulo" className="font-display text-3xl font-extrabold">
                Wi-Fi
              </h2>
              <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-cielo">
                <IconoWifi size={22} />
              </span>
            </div>

            <dl className="grid gap-2">
              <div className="rounded-[14px] bg-gris px-4 py-3">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-chocolate-suave uppercase">Red</dt>
                <dd className="mt-1 text-[17px] font-semibold">{WIFI.red}</dd>
              </div>
              <div className="rounded-[14px] bg-mantequilla px-4 py-3">
                <dt className="text-[11px] font-semibold tracking-[0.14em] text-chocolate-suave uppercase">Contraseña</dt>
                <dd className="mt-1 font-mono text-lg font-semibold">{WIFI.contrasena}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={copiar}
              className="mt-1 flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full bg-chocolate text-[15px] font-semibold text-mantequilla"
            >
              {copiada ? <IconoCheck size={18} /> : <IconoCopiar size={18} />}
              <span aria-live="polite">{copiada ? "Copiada" : "Copiar contraseña"}</span>
            </button>
            <button
              ref={botonCerrar}
              type="button"
              onClick={() => setAbierto(false)}
              className="min-h-12 cursor-pointer rounded-full border border-chocolate bg-white text-[15px] font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
