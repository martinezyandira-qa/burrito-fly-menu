import Link from "next/link";
import { TEXTOS, rutaInicio, type Idioma } from "@/i18n";

export function NoEncontrado({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma];
  return (
    <main lang={idioma} className="mx-auto flex min-h-dvh max-w-120 flex-col items-start justify-center gap-5 px-4">
      <h1 className="font-display text-5xl leading-none">{t.noEncontrado}</h1>
      <Link
        href={rutaInicio(idioma)}
        className="inline-flex min-h-12 items-center rounded-full bg-mantequilla px-6 text-[15px] font-semibold"
      >
        {t.irCarta}
      </Link>
    </main>
  );
}
