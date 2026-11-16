"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type CategoriaChip = { slug: string; nombre: string; foto: string };

// Barra de categorías fija arriba. Marca sola la categoría que se está viendo.
export function BarraCategorias({ categorias, etiqueta }: { categorias: CategoriaChip[]; etiqueta: string }) {
  const [activa, setActiva] = useState(categorias[0]?.slug);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = categorias.map((c) => c.slug);
    function alHacerScroll() {
      let actual = ids[0];
      for (const id of ids) {
        const seccion = document.getElementById(id);
        if (seccion && seccion.getBoundingClientRect().top <= 160) actual = id;
      }
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) actual = ids[ids.length - 1];
      setActiva(actual);
    }
    alHacerScroll();
    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, [categorias]);

  // Mantiene visible la píldora activa cuando la barra se desliza de lado.
  useEffect(() => {
    const caja = contenedor.current;
    const chip = caja?.querySelector<HTMLElement>(`[data-slug="${activa}"]`);
    if (!caja || !chip) return;
    const izquierda = chip.offsetLeft - (caja.clientWidth - chip.offsetWidth) / 2;
    caja.scrollTo({ left: izquierda, behavior: "smooth" });
  }, [activa]);

  return (
    <nav aria-label={etiqueta} className="sticky top-0 z-20 bg-fondo py-2">
      <div className="mx-auto max-w-280 px-4">
        <div
          ref={contenedor}
          className="flex gap-2 overflow-x-auto rounded-full bg-white p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categorias.map((c) => {
            const on = c.slug === activa;
            return (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                data-slug={c.slug}
                aria-current={on ? "true" : undefined}
                onClick={() => setActiva(c.slug)}
                className={`inline-flex min-h-11 flex-none items-center gap-2 rounded-full border py-0 pr-4 pl-1.5 text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors ${
                  on ? "border-chocolate bg-mantequilla" : "border-gris-linea bg-white"
                }`}
              >
                <span className="relative size-8 flex-none overflow-hidden rounded-full bg-white">
                  <Image src={c.foto} alt="" fill sizes="32px" className="object-cover" />
                </span>
                {c.nombre}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
