import type { Metadata } from "next";
import { Carta } from "@/components/carta";
import { TEXTOS } from "@/i18n";

export const metadata: Metadata = {
  title: { absolute: TEXTOS.en.metaTitulo },
  description: TEXTOS.en.metaDescripcion,
};

export default function Home() {
  return <Carta idioma="en" />;
}
