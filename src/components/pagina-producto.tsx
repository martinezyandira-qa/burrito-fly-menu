import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IconoFlechaIzquierda } from "@/components/iconos";
import { Pie } from "@/components/pie";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { buscarProducto, nombreCategoria, numeroCategoria, obtenerCarta, precioTexto, textoProducto } from "@/data/menu";
import { TEXTOS, rutaInicio, type Idioma } from "@/i18n";

type Params = Promise<{ slug: string }>;

// Una página por producto disponible al compilar (la usan "/producto/…" y "/en/product/…").
// Los platillos que se agreguen después en Supabase se generan la primera vez que alguien los abre.
export async function slugsProductos() {
  const categorias = await obtenerCarta();
  return categorias.flatMap((c) => c.productos.map((p) => ({ slug: p.slug })));
}

export async function metadataProducto(params: Params, idioma: Idioma): Promise<Metadata> {
  const { slug } = await params;
  const encontrado = await buscarProducto(slug);
  if (!encontrado) return {};
  const { nombre, descripcion } = textoProducto(encontrado.producto, idioma);
  return { title: nombre, description: descripcion };
}

const TONOS_RELACIONADOS = [
  "bg-mantequilla",
  "bg-chocolate text-mantequilla",
  "bg-rosa text-white",
  "bg-chocolate text-mantequilla",
];

// La parte que depende del producto va dentro de <Suspense>, así la navegación es instantánea:
// primero aparece el esqueleto (mismo tamaño) y enseguida el producto.
export function PaginaProducto({ params, idioma }: { params: Params; idioma: Idioma }) {
  return (
    <div lang={idioma}>
      <Suspense fallback={<EsqueletoProducto />}>
        <DetalleProducto params={params} idioma={idioma} />
      </Suspense>
      <Pie />
    </div>
  );
}

function EsqueletoProducto() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-280 px-4 pt-4">
      <div className="mb-3 h-12 w-52 rounded-full bg-white" />
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-5">
        <div className="rounded-[22px] bg-rosa p-3">
          <div className="aspect-square w-full rounded-2xl bg-white" />
        </div>
        <div className="h-52 rounded-[22px] bg-white" />
      </div>
    </div>
  );
}

async function DetalleProducto({ params, idioma }: { params: Params; idioma: Idioma }) {
  const t = TEXTOS[idioma];
  const { slug } = await params;
  const encontrado = await buscarProducto(slug);
  if (!encontrado) notFound();
  const { producto, categoria, indiceCategoria } = encontrado;
  const relacionados = categoria.productos.filter((p) => p.slug !== producto.slug);
  const { nombre, descripcion } = textoProducto(producto, idioma);
  const categoriaNombre = nombreCategoria(categoria, idioma);

  return (
    <>
      <div className="mx-auto flex max-w-280 items-center justify-between gap-3 px-4 pt-4 pb-3">
        <Link
          href={`${rutaInicio(idioma)}#p-${producto.slug}`}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white py-1 pr-4.5 pl-1 text-xs font-semibold tracking-[0.12em] uppercase"
        >
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-chocolate text-mantequilla">
            <IconoFlechaIzquierda size={18} />
          </span>
          {t.volver}
        </Link>
        <span className="inline-flex min-h-9 min-w-0 items-center gap-2 rounded-full border border-gris-borde py-0 pr-3.5 pl-1 text-[11px] font-semibold tracking-[0.1em] uppercase">
          <span className="relative size-7 flex-none overflow-hidden rounded-full bg-white">
            <Image src={categoria.imagen} alt="" fill sizes="28px" className="object-cover" />
          </span>
          <span className="truncate">{categoriaNombre}</span>
        </span>
      </div>

      <main className="mx-auto max-w-280 px-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-5">
          <section aria-label={t.fotoProducto} className="rounded-[22px] bg-rosa p-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white">
              <Image
                src={producto.imagen}
                alt={nombre}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1120px) 560px, (min-width: 768px) 52vw, 100vw"
                className="object-cover"
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 md:sticky md:top-6">
            <section aria-labelledby="nombre-producto" className="flex flex-col gap-3.5 rounded-[22px] bg-white px-5 pt-5.5 pb-6">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-chocolate-suave uppercase">
                {numeroCategoria(indiceCategoria)} · {categoriaNombre}
              </span>
              <h1 id="nombre-producto" className="font-display text-[52px] leading-[0.95] tracking-[0.01em] md:text-[72px]">
                {nombre}
              </h1>
              <span className="inline-flex min-h-12 items-center self-start rounded-full bg-mantequilla px-5.5 text-[22px] font-bold tabular-nums">
                {precioTexto(producto.precio)}
              </span>
            </section>

            {descripcion && (
              <section aria-labelledby="titulo-descripcion" className="flex flex-col gap-2.5 rounded-[22px] bg-gris px-5 pt-5 pb-5.5">
                <h2 id="titulo-descripcion" className="text-[11px] font-semibold tracking-[0.16em] text-chocolate-suave uppercase">
                  {t.descripcion}
                </h2>
                <p className="text-[15px] leading-[1.65]">{descripcion}</p>
              </section>
            )}
          </div>
        </div>

        {relacionados.length > 0 && (
          <section aria-labelledby="titulo-mas" className="pt-9 pb-3">
            <h2 id="titulo-mas" className="mb-3.5 flex flex-col font-display text-[42px] leading-[0.92]">
              <span>{t.masDe}</span>
              <span className="pl-10">{categoriaNombre}</span>
            </h2>
            <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
              {relacionados.map((p, j) => (
                <div key={p.slug} className="w-41 flex-none snap-start md:w-auto">
                  <TarjetaProducto producto={p} idioma={idioma} fondo={TONOS_RELACIONADOS[j % TONOS_RELACIONADOS.length]} sizes="(min-width: 768px) 260px, 164px" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
