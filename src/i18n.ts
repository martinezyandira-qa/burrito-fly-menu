// Textos de la interfaz en español e inglés.
// Español vive en "/" y "/producto/…"; inglés en "/en" y "/en/product/…".
import { RESTAURANTE } from "@/config";

export type Idioma = "es" | "en";

export const IDIOMAS: { idioma: Idioma; etiqueta: string }[] = [
  { idioma: "es", etiqueta: "Español" },
  { idioma: "en", etiqueta: "English" },
];

export const TEXTOS = {
  es: {
    metaTitulo: `${RESTAURANTE} · Menú`,
    metaDescripcion: `Menú digital de ${RESTAURANTE}.`,
    fotoLocal: `Local de ${RESTAURANTE}`,
    idioma: "Idioma",
    resena: "Déjanos una reseña",
    tituloCarta: ["Nuestra", "carta"],
    productos: "productos",
    categorias: "Categorías",
    volver: "Volver a la carta",
    fotoProducto: "Foto del producto",
    descripcion: "Descripción",
    masDe: "Más de",
    noEncontrado: "No encontramos esta página",
    irCarta: "Ir a la carta",
    wifi: {
      titulo: "Wi-Fi",
      red: "Red",
      contrasena: "Contraseña",
      copiar: "Copiar contraseña",
      copiada: "Copiada",
      cerrar: "Cerrar",
    },
  },
  en: {
    metaTitulo: `${RESTAURANTE} · Menu`,
    metaDescripcion: `${RESTAURANTE} digital menu.`,
    fotoLocal: `${RESTAURANTE} restaurant`,
    idioma: "Language",
    resena: "Leave us a review",
    tituloCarta: ["Our", "menu"],
    productos: "items",
    categorias: "Categories",
    volver: "Back to menu",
    fotoProducto: "Product photo",
    descripcion: "Description",
    masDe: "More from",
    noEncontrado: "We couldn't find this page",
    irCarta: "Go to the menu",
    wifi: {
      titulo: "Wi-Fi",
      red: "Network",
      contrasena: "Password",
      copiar: "Copy password",
      copiada: "Copied",
      cerrar: "Close",
    },
  },
} satisfies Record<Idioma, unknown>;

export type TextosWifi = (typeof TEXTOS)["es"]["wifi"];

export const rutaInicio = (idioma: Idioma) => (idioma === "en" ? "/en" : "/");

export const rutaProducto = (idioma: Idioma, slug: string) =>
  idioma === "en" ? `/en/product/${slug}` : `/producto/${slug}`;
