import type { Metadata } from "next";
import { FormularioPlatillo } from "@/components/admin/formulario-platillo";
import { obtenerCategoriasAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Nuevo platillo" };

export default async function PaginaNuevoPlatillo() {
  const categorias = await obtenerCategoriasAdmin();
  return (
    <>
      <h1 className="mb-4 font-display text-[44px] leading-none">Nuevo platillo</h1>
      <FormularioPlatillo categorias={categorias} />
    </>
  );
}
