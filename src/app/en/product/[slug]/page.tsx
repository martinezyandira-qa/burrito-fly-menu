import { PaginaProducto, metadataProducto, slugsProductos } from "@/components/pagina-producto";

export const generateStaticParams = slugsProductos;

export function generateMetadata({ params }: PageProps<"/en/product/[slug]">) {
  return metadataProducto(params, "en");
}

export default function Product({ params }: PageProps<"/en/product/[slug]">) {
  return <PaginaProducto params={params} idioma="en" />;
}
