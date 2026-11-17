"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconoBolsa } from "@/components/iconos";
import { TEXTOS, rutaPedido, type Idioma } from "@/i18n";
import { cantidadCarrito, totalCarrito, useCarrito } from "@/lib/carrito";
import { precioTexto } from "@/lib/precio";
import { LineasCarrito } from "./lineas-carrito";

// Botón flotante con número de platillos y total; abre el carrito desde abajo.
export function CarritoFlotante({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma].carrito;
  const lineas = useCarrito();
  const [abierto, setAbierto] = useState(false);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  const cantidad = cantidadCarrito(lineas);
  const total = totalCarrito(lineas);
  const visible = abierto && lineas.length > 0;

  // Bloquea el scroll de la página mientras el carrito está abierto.
  useEffect(() => {
    if (!visible) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [visible]);

  if (lineas.length === 0) return null;

  return (
    <>
      {/* Espacio para que el botón flotante no tape el final de la página */}
      <div aria-hidden="true" className="h-24" />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="pointer-events-auto flex min-h-15 w-full max-w-120 cursor-pointer animate-subir items-center gap-3 rounded-full bg-rosa py-2 pr-2 pl-3 text-white shadow-[0_10px_30px_rgba(62,37,32,0.35)] transition active:scale-[0.98]"
        >
          <span className="relative flex size-11 flex-none items-center justify-center rounded-full bg-white text-rosa">
            <IconoBolsa size={22} />
            <span className="absolute -top-1 -right-1 flex min-w-5.5 items-center justify-center rounded-full bg-chocolate px-1 text-[11px] leading-5.5 font-bold text-mantequilla tabular-nums">
              {cantidad}
            </span>
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-semibold tracking-[0.12em] uppercase opacity-90">{t.platillos(cantidad)}</span>
            <span className="text-lg font-bold tabular-nums">{precioTexto(total)}</span>
          </span>
          <span className="ml-auto rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-rosa">{t.verPedido}</span>
        </button>
      </div>

      {visible && (
        <div
          className="fixed inset-0 z-50 flex animate-aparecer items-end justify-center bg-chocolate/55 md:items-center"
          onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}
        >
          <button
            type="button"
            aria-label={t.cerrar}
            tabIndex={-1}
            onClick={() => setAbierto(false)}
            className="absolute inset-0 size-full cursor-default"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="carrito-titulo"
            className="relative flex max-h-[92dvh] w-full max-w-120 animate-subir flex-col rounded-t-[28px] bg-white md:rounded-[28px]"
          >
            <div className="flex flex-col gap-3 overflow-y-auto px-4 pt-3 pb-3">
              <span aria-hidden="true" className="h-1 w-10 self-center rounded-full bg-gris-borde" />
              <div className="flex items-center justify-between gap-3 py-1 pl-1.5">
                <h2 id="carrito-titulo" className="font-display text-[40px] leading-none">
                  {t.tuPedido}
                </h2>
                <button
                  ref={botonCerrar}
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="min-h-11 cursor-pointer rounded-full border border-chocolate px-4 text-sm font-semibold"
                >
                  {t.cerrar}
                </button>
              </div>
              <LineasCarrito lineas={lineas} idioma={idioma} />
            </div>

            <div className="flex flex-col gap-2 border-t border-gris-linea px-4 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between px-1.5">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-chocolate-suave uppercase">{t.total}</span>
                <span className="text-2xl font-bold tabular-nums">{precioTexto(total)}</span>
              </div>
              <Link
                href={rutaPedido(idioma)}
                className="flex min-h-13 items-center justify-center rounded-full bg-rosa text-[15px] font-semibold text-white"
              >
                {t.hacerPedido}
              </Link>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="min-h-12 cursor-pointer rounded-full text-[15px] font-semibold"
              >
                {t.seguir}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
