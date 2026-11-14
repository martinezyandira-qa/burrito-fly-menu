import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import { RESTAURANTE } from "@/config";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

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
  themeColor: "#bcd5eb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${playfair.variable} ${poppins.variable} antialiased`}>
      <body className="min-h-dvh bg-fondo font-sans text-chocolate">{children}</body>
    </html>
  );
}
