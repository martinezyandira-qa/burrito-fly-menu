// Cliente de Supabase para el servidor (páginas y acciones del panel), con la sesión del
// admin guardada en cookies. Usa la llave pública: los permisos los decide RLS.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_LLAVE, SUPABASE_URL } from "@/lib/supabase-config";

export async function crearClienteServidor() {
  const almacen = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_LLAVE, {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(cookiesNuevas) {
        try {
          cookiesNuevas.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Desde una página (Server Component) no se pueden escribir cookies.
          // No pasa nada: el proxy (src/proxy.ts) ya renueva la sesión en cada visita a /admin.
        }
      },
    },
  });
}
