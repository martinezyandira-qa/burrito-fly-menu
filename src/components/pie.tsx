import { RESTAURANTE } from "@/config";

export function Pie() {
  const [primera, ...resto] = RESTAURANTE.split(" ");
  return (
    <footer className="mx-auto max-w-280 px-4 pt-6 pb-7">
      <p
        aria-hidden="true"
        className="mb-5 flex flex-wrap gap-x-[0.25em] font-display text-[clamp(44px,12vw,150px)] leading-[0.95] font-extrabold tracking-[-0.02em]"
      >
        <span className="text-chocolate">{primera}</span>
        {resto.length > 0 && <span className="text-cielo">{resto.join(" ")}</span>}
      </p>
      <div className="flex items-center gap-3.5 border-t border-gris-linea pt-3.5">
        <span className="font-display text-sm font-extrabold uppercase">{RESTAURANTE}</span>
        <span aria-hidden="true" className="h-px flex-auto bg-gris-borde" />
      </div>
    </footer>
  );
}
