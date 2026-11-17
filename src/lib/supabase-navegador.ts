// Cliente de Supabase para el navegador. El panel lo usa solo para subir fotos a Storage
// con la sesión del admin (las reglas de Storage comprueban que sea admin).
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_LLAVE, SUPABASE_URL } from "@/lib/supabase-config";

export function crearClienteNavegador() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_LLAVE);
}
