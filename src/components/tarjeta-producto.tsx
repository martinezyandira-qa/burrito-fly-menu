import Image from "next/image";
import Link from "next/link";
import { BotonAgregar } from "@/components/carrito/boton-agregar";
import { precioTexto, textoProducto, type Producto } from "@/data/menu";
import { rutaProducto, type Idioma } from "@/i18n";

type Props = {
  producto: Producto;
  idioma: Idioma;
  fondo: string;
  /** id para que "Volver a la carta" regrese a esta tarjeta */
  conAncla?: boolean;
  /** Tamaño de la foto en pantalla, para que Next.js sirva la imagen justa */
  sizes?: string;
};

// La foto y el nombre llevan a la página del platillo; el botón "Agregar" va aparte
// (un botón no puede ir dentro de un enlace).
export function TarjetaProducto({ producto, idioma, fondo, conAncla = false, sizes = "(min-width: 768px) 260px, 50vw" }: Props) {
  const { nombre } = textoProducto(producto, idioma);
  return (
    <div id={conAncla ? `p-${producto.slug}` : undefined} className={`flex scroll-mt-28 flex-col rounded-[18px] p-2 ${fondo}`}>
      <Link href={rutaProducto(idioma, producto.slug)} className="flex flex-col transition active:scale-[0.98]">
        {/* Tamaño fijo (cuadrado) para que la página no salte al cargar la foto */}
        <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-white">
          <Image src={producto.imagen} alt={nombre} fill sizes={sizes} className="object-cover" />
        </span>
        <span className="line-clamp-2 min-h-11 px-1 pt-2.5 pl-1.5 font-display text-[22px] leading-none">{nombre}</span>
      </Link>
      <span className="flex items-center justify-between gap-1.5 px-1 pt-2 pb-0.5 pl-1.5">
        <span className="text-[15px] font-semibold tabular-nums">{precioTexto(producto.precio)}</span>
        <BotonAgregar
          idioma={idioma}
          nombreVisible={nombre}
          producto={{
            id: producto.id,
            slug: producto.slug,
            nombre: producto.nombre,
            nombreEn: producto.en.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
          }}
        />
      </span>
    </div>
  );
}
