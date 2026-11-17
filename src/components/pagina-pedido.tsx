import Image from "next/image";
import Link from "next/link";
import { FormularioPedido } from "@/components/carrito/formulario-pedido";
import { IconoFlechaIzquierda } from "@/components/iconos";
import { RESTAURANTE } from "@/config";
import { TEXTOS, rutaInicio, type Idioma } from "@/i18n";

// Página del pedido (la usan "/pedido" y "/en/order"): resumen, datos y confirmación.
export function PaginaPedido({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma];
  return (
    <div lang={idioma} className="mx-auto min-h-dvh max-w-150 px-4 pt-4 pb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={rutaInicio(idioma)}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-white py-1 pr-4.5 pl-1 text-xs font-semibold tracking-[0.12em] uppercase"
        >
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-chocolate text-mantequilla">
            <IconoFlechaIzquierda size={18} />
          </span>
          {t.volver}
        </Link>
        <Image src="/logo-burrito-fly.svg" alt={RESTAURANTE} width={3239} height={2009} unoptimized className="h-auto w-24" />
      </div>
      <h1 className="mb-4 font-display text-[56px] leading-[0.92]">{t.pedido.titulo}</h1>
      <FormularioPedido idioma={idioma} />
    </div>
  );
}
