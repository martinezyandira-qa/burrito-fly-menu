import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioPlatillo } from "@/components/admin/formulario-platillo";
import { obtenerCategoriasAdmin, obtenerPlatilloAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Editar platillo" };

export default async function PaginaEditarPlatillo({ params }: PageProps<"/admin/platillos/[id]">) {
  const { id } = await params;
  const [platillo, categorias] = await Promise.all([obtenerPlatilloAdmin(Number(id) || 0), obtenerCategoriasAdmin()]);
  if (!platillo) notFound();

  return (
    <>
      <h1 className="mb-1 font-display text-[44px] leading-none">Editar platillo</h1>
      <p className="mb-4 text-sm text-chocolate-suave">
        En el menú: <a href={`/producto/${platillo.slug}`} target="_blank" rel="noopener" className="font-semibold underline">/producto/{platillo.slug}</a>
      </p>
      <FormularioPlatillo key={platillo.id} categorias={categorias} platillo={platillo} />
    </>
  );
}
