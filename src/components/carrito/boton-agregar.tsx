"use client";

import { useEffect, useRef, useState } from "react";
import { IconoCheck, IconoMas } from "@/components/iconos";
import { TEXTOS, type Idioma } from "@/i18n";
import { agregarAlCarrito, type ProductoParaCarrito } from "@/lib/carrito";

// Botón "Agregar" de las tarjetas del menú: suma 1 al pedido y confirma con un ✓ breve.
export function BotonAgregar({ producto, idioma, nombreVisible }: { producto: ProductoParaCarrito; idioma: Idioma; nombreVisible: string }) {
  const t = TEXTOS[idioma].carrito;
  const [listo, setListo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        agregarAlCarrito(producto);
        setListo(true);
        if (temporizador.current) clearTimeout(temporizador.current);
        temporizador.current = setTimeout(() => setListo(false), 1200);
      }}
      aria-label={`${t.agregar} ${nombreVisible}`}
      className="inline-flex min-h-11 flex-none cursor-pointer items-center gap-1 rounded-full bg-white px-3 text-[13px] font-semibold text-chocolate transition active:scale-[0.96]"
    >
      {listo ? <IconoCheck size={15} /> : <IconoMas size={15} />}
      <span aria-live="polite">{listo ? t.agregado : t.agregar}</span>
    </button>
  );
}
