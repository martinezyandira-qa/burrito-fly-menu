import type { Metadata } from "next";
import Image from "next/image";
import { FormularioLogin } from "@/components/admin/formulario-login";
import { RESTAURANTE } from "@/config";

export const metadata: Metadata = { title: "Iniciar sesión" };

// No hay página de registro: los admins se crean en Supabase.
export default function PaginaLogin() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <Image
        src="/logo-burrito-fly.svg"
        alt={RESTAURANTE}
        width={3239}
        height={2009}
        unoptimized
        priority
        className="mx-auto h-auto w-52"
      />
      <div className="rounded-3xl bg-white p-5">
        <h1 className="mb-4 font-display text-[40px] leading-none">Panel de admin</h1>
        <FormularioLogin />
      </div>
    </main>
  );
}
