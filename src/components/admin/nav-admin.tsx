"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/admin/pedidos", texto: "Pedidos" },
  { href: "/admin", texto: "Platillos" },
  { href: "/admin/categorias", texto: "Categorías" },
] as const;

/** Secciones del panel; marca la sección actual según la ruta. */
export function NavAdmin() {
  return <ListaNav ruta={usePathname()} />;
}

/** La misma barra sin sección marcada: se muestra mientras se conoce la ruta. */
export function ListaNav({ ruta }: { ruta: string }) {
  return (
    <nav aria-label="Secciones del panel" className="flex gap-1.5 overflow-x-auto">
      {ENLACES.map(({ href, texto }) => {
        const activo = href === "/admin" ? ruta === "/admin" || ruta.startsWith("/admin/platillos") : ruta.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap ${
              activo ? "bg-mantequilla text-chocolate" : "text-mantequilla"
            }`}
          >
            {texto}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noopener"
        className="ml-auto inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap text-mantequilla"
      >
        Ver menú ↗
      </a>
    </nav>
  );
}
