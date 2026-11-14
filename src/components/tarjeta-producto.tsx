import Image from "next/image";
import Link from "next/link";
import { fotoProducto, precioTexto, type Producto } from "@/data/menu";
import { IconoFlechaDerecha } from "./iconos";

type Props = {
  producto: Producto;
  fondo: string;
  /** id para que "Volver a la carta" regrese a esta tarjeta */
  conAncla?: boolean;
  /** Tamaño de la foto en pantalla, para que Next.js sirva la imagen justa */
  sizes?: string;
};

export function TarjetaProducto({ producto, fondo, conAncla = false, sizes = "(min-width: 768px) 260px, 50vw" }: Props) {
  return (
    <Link
      href={`/producto/${producto.slug}`}
      id={conAncla ? `p-${producto.slug}` : undefined}
      className={`flex scroll-mt-28 flex-col rounded-[18px] p-2 transition active:scale-[0.98] ${fondo}`}
    >
      {/* Tamaño fijo (cuadrado) para que la página no salte al cargar la foto */}
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-white">
        <Image src={fotoProducto(producto.slug)} alt={producto.nombre} fill sizes={sizes} className="object-cover" />
      </span>
      <span className="flex flex-col gap-2 px-1 pt-2.5 pb-0.5 pl-1.5">
        <span className="line-clamp-2 min-h-10 font-display text-[17px] leading-[1.18] font-bold">{producto.nombre}</span>
        <span className="flex items-center justify-between gap-2">
          <span className="text-[15px] font-semibold tabular-nums">{precioTexto(producto.precio)}</span>
          <span aria-hidden="true" className="flex size-[34px] flex-none items-center justify-center rounded-full bg-white">
            <IconoFlechaDerecha size={16} />
          </span>
        </span>
      </span>
    </Link>
  );
}
