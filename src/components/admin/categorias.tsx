"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { borrarCategoria, guardarCategoria, moverCategoria } from "@/app/admin/acciones";
import { IconoFlechaAbajo } from "@/components/iconos";
import type { CategoriaAdmin } from "@/lib/admin";
import { BotonBorrar } from "./boton-borrar";
import { AVISO_ERROR, AYUDA, BOTON_CLARO, BOTON_PRINCIPAL, CAMPO, ETIQUETA } from "./estilos";

// Formulario de categoría: vacío para crear, o con datos para editar.
export function FormularioCategoria({ categoria, alTerminar }: { categoria?: CategoriaAdmin; alTerminar?: () => void }) {
  const [estado, accion, guardando] = useActionState(guardarCategoria, undefined);
  const formulario = useRef<HTMLFormElement>(null);

  // Al guardar bien: limpia el formulario (crear) o cierra la edición.
  useEffect(() => {
    if (!estado?.ok) return;
    if (alTerminar) alTerminar();
    else formulario.current?.reset();
  }, [estado, alTerminar]);

  return (
    <form ref={formulario} action={accion} className="flex flex-col gap-3">
      {categoria && <input type="hidden" name="id" value={categoria.id} />}
      <label className={ETIQUETA}>
        Nombre (español)
        <input name="name" required maxLength={60} defaultValue={categoria?.name} className={CAMPO} />
      </label>
      <label className={ETIQUETA}>
        Name (English)
        <input name="name_en" maxLength={60} lang="en" defaultValue={categoria?.name_en} className={CAMPO} />
        <span className={AYUDA}>Si lo dejas vacío, se usa el nombre en español.</span>
      </label>
      {estado?.error && (
        <p role="alert" className={AVISO_ERROR}>
          {estado.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {alTerminar && (
          <button type="button" onClick={alTerminar} className={BOTON_CLARO}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={guardando} className={BOTON_PRINCIPAL}>
          {guardando ? "Guardando…" : categoria ? "Guardar" : "Agregar categoría"}
        </button>
      </div>
    </form>
  );
}

type PropsFila = {
  categoria: CategoriaAdmin;
  cantidad: number;
  posicion: number;
  esPrimera: boolean;
  esUltima: boolean;
};

export function FilaCategoria({ categoria, cantidad, posicion, esPrimera, esUltima }: PropsFila) {
  const [editando, setEditando] = useState(false);
  const [moviendo, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function mover(direccion: -1 | 1) {
    setError(null);
    iniciar(async () => {
      const r = await moverCategoria(categoria.id, direccion);
      if (r?.error) setError(r.error);
    });
  }

  const flecha = "flex size-11 flex-none items-center justify-center rounded-full border border-gris-borde bg-white disabled:opacity-30";

  return (
    <li className={`rounded-2xl bg-white p-3 ${moviendo ? "opacity-60" : ""}`}>
      {editando ? (
        <FormularioCategoria categoria={categoria} alTerminar={() => setEditando(false)} />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="w-6 flex-none text-center text-sm font-semibold text-chocolate-suave tabular-nums">{posicion}</span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-display text-[24px] leading-none">{categoria.name}</span>
              <span className="truncate text-xs text-chocolate-suave">
                {categoria.name_en} · {cantidad} platillos
              </span>
            </span>
            <span className="ml-auto flex gap-1.5">
              <button
                type="button"
                aria-label={`Subir ${categoria.name}`}
                disabled={esPrimera || moviendo}
                onClick={() => mover(-1)}
                className={flecha}
              >
                <IconoFlechaAbajo size={18} className="rotate-180" />
              </button>
              <button
                type="button"
                aria-label={`Bajar ${categoria.name}`}
                disabled={esUltima || moviendo}
                onClick={() => mover(1)}
                className={flecha}
              >
                <IconoFlechaAbajo size={18} />
              </button>
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap justify-end gap-2 border-t border-gris-linea pt-2.5">
            <button type="button" onClick={() => setEditando(true)} className={BOTON_CLARO}>
              Editar
            </button>
            <BotonBorrar
              accion={() => borrarCategoria(categoria.id)}
              titulo={`¿Borrar ${categoria.name}?`}
              texto={
                cantidad > 0
                  ? `Tiene ${cantidad} platillo(s): no se puede borrar hasta que los muevas a otra categoría o los borres.`
                  : "Esto no se puede deshacer."
              }
            />
          </div>
        </>
      )}
      {error && (
        <p role="alert" className={`mt-2 ${AVISO_ERROR}`}>
          {error}
        </p>
      )}
    </li>
  );
}
