import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Poppins } from "next/font/google";
import { RESTAURANTE } from "@/config";
import "./globals.css";

// Títulos, nombres y precios grandes
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

// Textos pequeños (descripciones, Wi-Fi): Bebas Neue es solo mayúsculas y la contraseña distingue mayúsculas

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${RESTAURANTE} · Menú`,
    template: `%s · ${RESTAURANTE}`,
  },
  description: `Menú digital de ${RESTAURANTE}.`,
};

export const viewport: Viewport = {
  themeColor: "#fceba6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${bebas.variable} ${poppins.variable} antialiased`}>
      <body className="min-h-dvh bg-fondo font-sans text-chocolate">{children}</body>
    </html>
  );
}
