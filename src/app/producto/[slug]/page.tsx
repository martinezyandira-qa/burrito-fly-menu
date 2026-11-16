import { PaginaProducto, metadataProducto, slugsProductos } from "@/components/pagina-producto";

export const generateStaticParams = slugsProductos;

export function generateMetadata({ params }: PageProps<"/producto/[slug]">) {
  return metadataProducto(params, "es");
}

export default function Producto({ params }: PageProps<"/producto/[slug]">) {
  return <PaginaProducto params={params} idioma="es" />;
}
