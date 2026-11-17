import type { Metadata } from "next";
import { FilaCategoria, FormularioCategoria } from "@/components/admin/categorias";
import { obtenerCategoriasAdmin, obtenerPlatillosAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Categorías" };

// /admin/categorias: orden con flechas, crear, editar y borrar.
export default async function PaginaCategorias() {
  const [categorias, platillos] = await Promise.all([obtenerCategoriasAdmin(), obtenerPlatillosAdmin()]);

  return (
    <>
      <h1 className="mb-1 font-display text-[44px] leading-none">Categorías</h1>
      <p className="mb-5 text-sm text-chocolate-suave">El orden de esta lista es el orden del menú.</p>

      <ol className="mb-8 flex flex-col gap-2.5">
        {categorias.map((c, i) => (
          <FilaCategoria
            key={c.id}
            categoria={c}
            cantidad={platillos.filter((p) => p.category_id === c.id).length}
            posicion={i + 1}
            esPrimera={i === 0}
            esUltima={i === categorias.length - 1}
          />
        ))}
      </ol>

      <section className="rounded-2xl bg-white p-4">
        <h2 className="mb-3 font-display text-[28px] leading-none">Nueva categoría</h2>
        <FormularioCategoria />
      </section>
    </>
  );
}
