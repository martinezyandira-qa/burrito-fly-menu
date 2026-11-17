import type { Metadata } from "next";
import { PaginaPedido } from "@/components/pagina-pedido";
import { TEXTOS } from "@/i18n";

export const metadata: Metadata = {
  title: TEXTOS.en.pedido.metaTitulo,
  robots: { index: false },
};

export default function Order() {
  return <PaginaPedido idioma="en" />;
}
