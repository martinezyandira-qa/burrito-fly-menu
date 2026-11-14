import Image from "next/image";
import { BarraCategorias } from "@/components/barra-categorias";
import { BotonWifi } from "@/components/boton-wifi";
import { IconoFlechaAbajo, LogoGoogle } from "@/components/iconos";
import { Pie } from "@/components/pie";
import { TarjetaProducto } from "@/components/tarjeta-producto";
import { ENLACE_RESENAS_GOOGLE, RESTAURANTE } from "@/config";
import { CATEGORIAS, TONOS_TARJETA, fotoProducto, numeroCategoria } from "@/data/menu";

// Colores de los bloques de categoría, en orden.
const TONOS_CATEGORIA = [
  { fondo: "bg-cielo", texto: "text-chocolate", flecha: "bg-white" },
  { fondo: "bg-mantequilla", texto: "text-chocolate", flecha: "bg-white" },
  { fondo: "bg-chocolate", texto: "text-mantequilla", flecha: "bg-mantequilla text-chocolate" },
  { fondo: "bg-white", texto: "text-chocolate", flecha: "bg-gris" },
];

export default function Inicio() {
  return (
    <>
      {/* 1. Banner */}
      <header className="bg-cielo">
        <div className="mx-auto flex max-w-280 flex-col gap-4 px-4 pt-4 pb-5.5">
          <div className="relative h-95 w-full overflow-hidden rounded-[18px] bg-cielo-oscuro md:h-135">
            <Image
              src="/local-burrito-fly.jpg"
              alt={`Local de ${RESTAURANTE}`}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1120px) 1088px, 100vw"
              className="object-cover object-[50%_40%]"
            />
            <div className="absolute right-3 bottom-3 left-3 flex">
              <div className="max-w-full rounded-[14px] bg-mantequilla px-4.5 pt-3.5 pb-4">
                <h1 className="font-display text-[34px] leading-[0.98] font-black tracking-[-0.01em] uppercase md:text-[64px]">
                  {RESTAURANTE}
                </h1>
              </div>
            </div>
          </div>
          <a
            href="#carta"
            className="inline-flex min-h-13 items-center gap-3 self-start rounded-full bg-mantequilla py-1.5 pr-1.5 pl-5.5 text-[15px] font-semibold"
          >
            Explorar el menú
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-chocolate text-mantequilla">
              <IconoFlechaAbajo size={18} />
            </span>
          </a>
        </div>
      </header>

      {/* 2. Wi-Fi y reseña */}
      <div className="mx-auto max-w-280 px-4 pt-4">
        <div className="grid max-w-155 grid-cols-2 gap-2.5">
          <BotonWifi />
          <a
            href={ENLACE_RESENAS_GOOGLE}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-18 items-center justify-between gap-2 rounded-2xl bg-white py-3 pr-3 pl-4 text-xs leading-[1.35] font-semibold tracking-[0.12em] uppercase transition active:scale-[0.98]"
          >
            <span>Déjanos una reseña</span>
            <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-full bg-gris">
              <LogoGoogle />
            </span>
          </a>
        </div>
      </div>

      {/* 3. Nuestra carta */}
      <section id="carta" aria-labelledby="titulo-carta">
        <div className="mx-auto max-w-280 px-4 pt-9 pb-4">
          <h2 id="titulo-carta" className="flex flex-col font-display text-[42px] leading-none font-bold tracking-[-0.015em]">
            <span>Nuestra</span>
            <span className="pl-14">carta</span>
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
                    <Image src={fotoProducto(c.imagen)} alt="" fill sizes="(min-width: 768px) 260px, 50vw" className="object-cover" />
                  </span>
                  <span className="flex items-end justify-between gap-2 px-1 pt-2.5 pb-1 pl-1.5">
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-display text-lg leading-[1.12] font-bold">{c.nombre}</span>
                      <span className="text-[10px] font-semibold tracking-[0.14em] uppercase">{c.productos.length} productos</span>
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
          categorias={CATEGORIAS.map((c) => ({ slug: c.slug, nombre: c.nombre, foto: fotoProducto(c.imagen) }))}
        />

        {/* 4. Productos por categoría */}
        <div className="mx-auto max-w-280 px-4 pb-12">
          {CATEGORIAS.map((c, i) => (
            <section key={c.slug} id={c.slug} aria-labelledby={`titulo-${c.slug}`} className="scroll-mt-21 pt-7">
              <div className="mb-3.5 flex items-baseline gap-3">
                <span className="text-[11px] font-semibold tracking-[0.1em] text-chocolate-suave">{numeroCategoria(i)}</span>
                <h3 id={`titulo-${c.slug}`} className="font-display text-[28px] leading-[1.1] font-bold">
                  {c.nombre}
                </h3>
                <span className="ml-auto text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-chocolate-suave uppercase">
                  {c.productos.length} productos
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
                {c.productos.map((p, j) => (
                  <TarjetaProducto key={p.slug} producto={p} fondo={TONOS_TARJETA[j % TONOS_TARJETA.length]} conAncla />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <Pie />
    </>
  );
}
