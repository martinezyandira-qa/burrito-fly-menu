import Image from "next/image";
import Link from "next/link";
import { BarraCategorias } from "@/components/barra-categorias";
import { BotonWifi } from "@/components/boton-wifi";
import { CarritoFlotante } from "@/components/carrito/carrito-flotante";
import { SeguimientoPedidos } from "@/components/carrito/seguimiento-pedidos";
import { IconoCheck, IconoFlechaAbajo, LogoGoogle } from "@/components/iconos";
import { Pie } from "@/components/pie";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { ENLACE_RESENAS_GOOGLE, RESTAURANTE } from "@/config";
import { TONOS_TARJETA, nombreCategoria, numeroCategoria, obtenerCarta } from "@/data/menu";
import { IDIOMAS, TEXTOS, rutaInicio, type Idioma } from "@/i18n";

// Colores de los bloques de categoría, en orden.
const TONOS_CATEGORIA = [
  { fondo: "bg-rosa", texto: "text-white", flecha: "bg-white" },
  { fondo: "bg-mantequilla", texto: "text-chocolate", flecha: "bg-white" },
  { fondo: "bg-chocolate", texto: "text-mantequilla", flecha: "bg-mantequilla text-chocolate" },
  { fondo: "bg-white", texto: "text-chocolate", flecha: "bg-gris" },
];

// La carta completa. La usan "/" (español) y "/en" (inglés).
export async function Carta({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma];
  // Desde Supabase (en caché): solo platillos disponibles, en orden de categoría.
  const CATEGORIAS = await obtenerCarta();
  return (
    <div lang={idioma}>
      {/* 1. Banner */}
      <header className="bg-mantequilla">
        <div className="mx-auto flex max-w-280 flex-col gap-4 px-4 pt-4 pb-5.5">
          <div className="relative h-95 w-full overflow-hidden rounded-[18px] bg-mantequilla-oscuro md:h-135">
            <Image
              src="/local-burrito-fly.jpg"
              alt={t.fotoLocal}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1120px) 1088px, 100vw"
              className="object-cover object-[50%_40%]"
            />
            <h1 className="absolute right-3 bottom-3">
              {/* Tamaño fijo para que la página no salte al cargar el logo */}
              <Image
                src="/logo-burrito-fly-claro.svg"
                alt={RESTAURANTE}
                width={3239}
                height={2009}
                unoptimized
                loading="eager"
                className="h-auto w-52 drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)] md:w-80"
              />
            </h1>
          </div>

          {/* Idioma de la carta */}
          <nav aria-label={t.idioma} className="flex gap-2.5">
            {IDIOMAS.map(({ idioma: opcion, etiqueta }) => {
              const activo = opcion === idioma;
              return (
                <Link
                  key={opcion}
                  href={rutaInicio(opcion)}
                  hrefLang={opcion}
                  lang={opcion}
                  aria-current={activo ? "page" : undefined}
                  className={`inline-flex min-h-13 items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition active:scale-[0.98] ${
                    activo ? "bg-rosa text-white" : "bg-white text-chocolate"
                  }`}
                >
                  {activo && <IconoCheck size={16} />}
                  {etiqueta}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 2. Wi-Fi y reseña */}
      <div className="mx-auto max-w-280 px-4 pt-4">
        <div className="grid max-w-155 grid-cols-2 gap-2.5">
          <BotonWifi textos={t.wifi} />
          <a
            href={ENLACE_RESENAS_GOOGLE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-18 items-center justify-between gap-2 rounded-2xl bg-white py-3 pr-3 pl-4 text-sm leading-[1.3] font-semibold tracking-[0.12em] uppercase transition active:scale-[0.98]"
          >
            <span>{t.resena}</span>
            <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-full bg-gris">
              <LogoGoogle />
            </span>
          </a>
        </div>
      </div>

      {/* Estado de los pedidos de este cliente (solo aparece si hizo uno) */}
      <div className="mx-auto max-w-280 px-4">
        <SeguimientoPedidos idioma={idioma} className="max-w-155 pt-4" />
      </div>

      {/* 3. Nuestra carta */}
      <section id="carta" aria-labelledby="titulo-carta">
        <div className="mx-auto max-w-280 px-4 pt-9 pb-4">
          <h2 id="titulo-carta" className="flex flex-col font-display text-[56px] leading-[0.92] tracking-[0.01em]">
            <span>{t.tituloCarta[0]}</span>
            <span>{t.tituloCarta[1]}</span>
          </h2>
        </div>

        {/* Bloques de categoría con foto */}
        <div className="mx-auto max-w-280 px-4 pb-6">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {CATEGORIAS.map((c, i) => {
              const tono = TONOS_CATEGORIA[i % TONOS_CATEGORIA.length];
              return (
                <a
                  key={c.slug}
                  href={`#${c.slug}`}
                  className={`flex flex-col rounded-[18px] p-2 transition active:scale-[0.98] ${tono.fondo} ${tono.texto}`}
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-white">
                    <Image src={c.imagen} alt="" fill sizes="(min-width: 768px) 260px, 50vw" className="object-cover" />
                  </span>
                  <span className="flex items-end justify-between gap-2 px-1 pt-2.5 pb-1 pl-1.5">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-display text-[24px] leading-none">{nombreCategoria(c, idioma)}</span>
                      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                        {c.productos.length} {t.productos}
                      </span>
                    </span>
                    <span aria-hidden="true" className={`flex size-8 flex-none items-center justify-center rounded-full text-chocolate ${tono.flecha}`}>
                      <IconoFlechaAbajo size={15} />
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <BarraCategorias
          etiqueta={t.categorias}
          categorias={CATEGORIAS.map((c) => ({ slug: c.slug, nombre: nombreCategoria(c, idioma), foto: c.imagen }))}
        />

        {/* 4. Productos por categoría */}
        <div className="mx-auto max-w-280 px-4 pb-12">
          {CATEGORIAS.map((c, i) => (
            <section key={c.slug} id={c.slug} aria-labelledby={`titulo-${c.slug}`} className="scroll-mt-21 pt-7">
              <div className="mb-3.5 flex items-baseline gap-3">
                <span className="text-[11px] font-semibold tracking-[0.1em] text-chocolate-suave">{numeroCategoria(i)}</span>
                <h3 id={`titulo-${c.slug}`} className="font-display text-[34px] leading-none">
                  {nombreCategoria(c, idioma)}
                </h3>
                <span className="ml-auto text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-chocolate-suave uppercase">
                  {c.productos.length} {t.productos}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
                {c.productos.map((p, j) => (
                  <TarjetaProducto
                    key={p.slug}
                    producto={p}
                    idioma={idioma}
                    fondo={TONOS_TARJETA[j % TONOS_TARJETA.length]}
                    conAncla
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <Pie />
      <CarritoFlotante idioma={idioma} />
    </div>
  );
}
