// Cliente público de Supabase para el menú: sin sesión ni cookies, así su lectura se puede
// guardar en caché y es igual para todos los visitantes.
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_LLAVE, SUPABASE_URL } from "@/lib/supabase-config";

export const supabase = createClient(SUPABASE_URL, SUPABASE_LLAVE, {
  auth: { persistSession: false },
});
