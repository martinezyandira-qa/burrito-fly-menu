import Image from "next/image";
import Link from "next/link";
import { borrarPlatillo } from "@/app/admin/acciones";
import { BotonBorrar } from "@/components/admin/boton-borrar";
import { BOTON_CLARO, BOTON_PRINCIPAL } from "@/components/admin/estilos";
import { InterruptorDisponible } from "@/components/admin/interruptor-disponible";
import { obtenerCategoriasAdmin, obtenerPlatillosAdmin } from "@/lib/admin";
import { precioTexto } from "@/data/menu";

// /admin: todos los platillos, agrupados por categoría y en el orden del menú.
export default async function PaginaPlatillos() {
  const [categorias, platillos] = await Promise.all([obtenerCategoriasAdmin(), obtenerPlatillosAdmin()]);

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="font-display text-[44px] leading-none">Platillos</h1>
        <Link href="/admin/platillos/nuevo" className={BOTON_PRINCIPAL}>
          + Nuevo platillo
        </Link>
      </div>

      {categorias.length === 0 && (
        <p className="rounded-2xl bg-white p-5">
          Primero crea una categoría en <Link href="/admin/categorias" className="font-semibold underline">Categorías</Link>.
        </p>
      )}

      <div className="flex flex-col gap-7">
        {categorias.map((c) => {
          const lista = platillos.filter((p) => p.category_id === c.id);
          return (
            <section key={c.id} aria-labelledby={`cat-${c.id}`}>
              <div className="mb-2.5 flex items-baseline gap-3">
                <h2 id={`cat-${c.id}`} className="font-display text-[30px] leading-none">
                  {c.name}
                </h2>
                <span className="ml-auto text-[11px] font-semibold tracking-[0.12em] text-chocolate-suave uppercase">
                  {lista.length} platillos
                </span>
              </div>

              {lista.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 text-sm text-chocolate-suave">Sin platillos todavía.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {lista.map((p) => (
                    <li key={p.id} className={`rounded-2xl bg-white p-3 ${p.available ? "" : "opacity-80"}`}>
                      <div className="flex items-center gap-3">
                        <span className="relative size-16 flex-none overflow-hidden rounded-xl bg-gris">
                          {p.image_url && (
                            <Image src={p.image_url} alt="" fill sizes="64px" className={`object-cover ${p.available ? "" : "grayscale"}`} />
                          )}
                        </span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate text-[15px] font-semibold">{p.name}</span>
                          <span className="truncate text-xs text-chocolate-suave">{p.name_en}</span>
                          <span className="text-sm font-semibold tabular-nums">{precioTexto(p.price)}</span>
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-gris-linea pt-2.5">
                        <InterruptorDisponible id={p.id} disponible={p.available} nombre={p.name} />
                        <span className="ml-auto flex gap-2">
                          <Link href={`/admin/platillos/${p.id}`} className={BOTON_CLARO}>
                            Editar
                          </Link>
                          <BotonBorrar
                            accion={borrarPlatillo.bind(null, p.id)}
                            titulo={`¿Borrar ${p.name}?`}
                            texto="Se quita del menú y se borra su foto subida. Esto no se puede deshacer. Si solo se acabó, mejor márcalo como Agotado."
                          />
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
