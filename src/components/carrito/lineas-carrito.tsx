"use client";

import Image from "next/image";
import { IconoBasura, IconoMas, IconoMenos } from "@/components/iconos";
import { TEXTOS, type Idioma } from "@/i18n";
import {
  CANTIDAD_MAXIMA,
  NOTA_MAXIMA,
  cambiarCantidad,
  cambiarNota,
  quitarDelCarrito,
  type LineaCarrito,
} from "@/lib/carrito";
import { precioTexto } from "@/lib/precio";

// Lista editable del pedido: cantidad (− +), nota por platillo y quitar.
// La usan el panel del carrito y la página del pedido.
export function LineasCarrito({ lineas, idioma }: { lineas: LineaCarrito[]; idioma: Idioma }) {
  const t = TEXTOS[idioma].carrito;
  return (
    <ul className="flex flex-col gap-2.5">
      {lineas.map((l) => {
        const nombre = idioma === "en" ? l.nombreEn || l.nombre : l.nombre;
        return (
          <li key={l.linea} className={`rounded-2xl p-2.5 ${l.agotado ? "bg-rosa/10 ring-2 ring-rosa" : "bg-gris"}`}>
            <div className="flex gap-3">
              <span className="relative size-16 flex-none overflow-hidden rounded-xl bg-white">
                <Image src={l.imagen} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-display text-[22px] leading-none">{nombre}</span>
                <span className="text-xs text-chocolate-suave tabular-nums">
                  {precioTexto(l.precio)} × {l.cantidad}
                </span>
                <span className="text-[15px] font-semibold tabular-nums">{precioTexto(l.precio * l.cantidad)}</span>
              </span>
              <button
                type="button"
                onClick={() => quitarDelCarrito(l.linea)}
                aria-label={`${t.quitar} ${nombre}`}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full bg-white text-chocolate"
              >
                <IconoBasura size={18} />
              </button>
            </div>

            {l.agotado && (
              <p role="alert" className="mt-2 text-sm font-semibold text-rosa-oscuro">
                {t.agotado}
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-2">
              <div className="flex items-center rounded-full bg-white" role="group" aria-label={`${t.cantidad}: ${nombre}`}>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(l.linea, l.cantidad - 1)}
                  disabled={l.cantidad <= 1}
                  aria-label={t.menos}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full disabled:opacity-30"
                >
                  <IconoMenos size={16} />
                </button>
                <span aria-live="polite" className="w-7 text-center text-base font-semibold tabular-nums">
                  {l.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(l.linea, l.cantidad + 1)}
                  disabled={l.cantidad >= CANTIDAD_MAXIMA}
                  aria-label={t.mas}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-full disabled:opacity-30"
                >
                  <IconoMas size={16} />
                </button>
              </div>
              <label className="min-w-0 flex-1">
                <span className="sr-only">
                  {t.nota}: {nombre}
                </span>
                <input
                  type="text"
                  value={l.nota}
                  maxLength={NOTA_MAXIMA}
                  placeholder={t.notaEjemplo}
                  onChange={(e) => cambiarNota(l.linea, e.target.value)}
                  className="min-h-11 w-full rounded-full border border-gris-borde bg-white px-3.5 text-base outline-none focus:border-chocolate"
                />
              </label>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
