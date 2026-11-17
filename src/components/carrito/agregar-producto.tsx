"use client";

import { useEffect, useRef, useState } from "react";
import { IconoCheck, IconoMas, IconoMenos } from "@/components/iconos";
import { TEXTOS, type Idioma } from "@/i18n";
import { CANTIDAD_MAXIMA, NOTA_MAXIMA, agregarAlCarrito, type ProductoParaCarrito } from "@/lib/carrito";
import { precioTexto } from "@/lib/precio";

// Página del platillo: elegir cantidad, escribir una nota y agregar al pedido.
export function AgregarProducto({ producto, idioma }: { producto: ProductoParaCarrito; idioma: Idioma }) {
  const t = TEXTOS[idioma].carrito;
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");
  const [listo, setListo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function agregar() {
    agregarAlCarrito(producto, cantidad, nota);
    setCantidad(1);
    setNota("");
    setListo(true);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setListo(false), 1800);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-chocolate-suave uppercase">{t.nota}</span>
        <input
          type="text"
          value={nota}
          maxLength={NOTA_MAXIMA}
          placeholder={t.notaEjemplo}
          onChange={(e) => setNota(e.target.value)}
          className="min-h-12 rounded-full border border-gris-borde bg-white px-4 text-base outline-none focus:border-chocolate"
        />
      </label>
      <div className="flex items-center gap-2.5">
        <div className="flex items-center rounded-full bg-gris" role="group" aria-label={t.cantidad}>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            disabled={cantidad <= 1}
            aria-label={t.menos}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full disabled:opacity-30"
          >
            <IconoMenos size={18} />
          </button>
          <span aria-live="polite" className="w-8 text-center text-lg font-semibold tabular-nums">
            {cantidad}
          </span>
          <button
            type="button"
            onClick={() => setCantidad((c) => Math.min(CANTIDAD_MAXIMA, c + 1))}
            disabled={cantidad >= CANTIDAD_MAXIMA}
            aria-label={t.mas}
            className="flex size-12 cursor-pointer items-center justify-center rounded-full disabled:opacity-30"
          >
            <IconoMas size={18} />
          </button>
        </div>
        <button
          type="button"
          onClick={agregar}
          className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-rosa px-4 text-[15px] font-semibold text-white transition active:scale-[0.98]"
        >
          {listo ? <IconoCheck size={18} /> : <IconoMas size={18} />}
          <span aria-live="polite">
            {listo ? `${t.agregado}` : `${t.agregar} · ${precioTexto(producto.precio * cantidad)}`}
          </span>
        </button>
      </div>
    </div>
  );
}
