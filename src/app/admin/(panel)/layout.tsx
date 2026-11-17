import { redirect } from "next/navigation";
import { Suspense } from "react";
import { cerrarSesion } from "@/app/admin/acciones";
import { BOTON_CLARO } from "@/components/admin/estilos";
import { ListaNav, NavAdmin } from "@/components/admin/nav-admin";
import { obtenerSesion } from "@/lib/admin";

// Marco del panel: barra superior (secciones y cerrar sesión) y la revisión de permisos.
export default function LayoutPanel({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 bg-chocolate text-mantequilla">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-2.5">
          <span className="mr-auto font-display text-[28px] leading-none">Burrito Fly · Panel</span>
          <form action={cerrarSesion}>
            <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-mantequilla px-4 text-sm font-semibold text-chocolate">
              Cerrar sesión
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-3xl px-2.5 py-1.5">
          <Suspense fallback={<ListaNav ruta="" />}>
            <NavAdmin />
          </Suspense>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-5 pb-16">
        <Suspense fallback={<Cargando />}>
          <SoloAdmins>{children}</SoloAdmins>
        </Suspense>
      </main>
    </div>
  );
}

// Segunda revisión (la primera es el proxy): sesión válida y usuario en la tabla admins.
async function SoloAdmins({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();
  if (sesion.estado === "sin-sesion") redirect("/admin/login");
  if (sesion.estado === "sin-permiso") {
    return (
      <div className="rounded-2xl bg-white p-5">
        <h1 className="mb-2 font-display text-[36px] leading-none">Sin permiso</h1>
        <p className="mb-4 text-[15px]">
          La cuenta <strong>{sesion.correo}</strong> no está en la lista de administradores. Pide que la agreguen a la
          tabla <code>admins</code> en Supabase.
        </p>
        <form action={cerrarSesion}>
          <button type="submit" className={BOTON_CLARO}>
            Cerrar sesión
          </button>
        </form>
      </div>
    );
  }
  return children;
}

function Cargando() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex flex-col gap-3">
      <div className="h-11 w-48 rounded-full bg-white" />
      <div className="h-20 rounded-2xl bg-white" />
      <div className="h-20 rounded-2xl bg-white" />
      <div className="h-20 rounded-2xl bg-white" />
    </div>
  );
}
