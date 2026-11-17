import type { Metadata } from "next";
import { PaginaPedido } from "@/components/pagina-pedido";
import { TEXTOS } from "@/i18n";

export const metadata: Metadata = {
  title: TEXTOS.es.pedido.metaTitulo,
  robots: { index: false },
};

export default function Pedido() {
  return <PaginaPedido idioma="es" />;
}
