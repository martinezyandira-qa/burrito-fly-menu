import type { Metadata } from "next";

// Todo /admin: título propio y que los buscadores no lo muestren.
export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  return <div lang="es">{children}</div>;
}
