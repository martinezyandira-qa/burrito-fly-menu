import Image from "next/image";
import { RESTAURANTE } from "@/config";

export function Pie() {
  return (
    <footer className="mx-auto max-w-280 px-4 pt-6 pb-7">
      {/* Tamaño fijo para que la página no salte al cargar el logo */}
      <Image
        src="/logo-burrito-fly.svg"
        alt=""
        width={3239}
        height={2009}
        unoptimized
        className="mx-auto mb-5 block h-auto w-[min(72vw,360px)]"
      />
      <div className="flex items-center gap-3.5 border-t border-gris-linea pt-3.5">
        <span className="font-display text-lg leading-none tracking-[0.04em] uppercase">{RESTAURANTE}</span>
        <span aria-hidden="true" className="h-px flex-auto bg-gris-borde" />
      </div>
    </footer>
  );
}
