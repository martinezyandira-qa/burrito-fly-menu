// Conexión con Supabase. Los valores vienen de variables de entorno:
// en tu computadora, de .env.local; en Vercel, de Settings → Environment Variables.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Agrégalas en .env.local (local) o en Vercel → Settings → Environment Variables.",
  );
}

// La llave "anon" es pública: solo puede hacer lo que permitan las políticas RLS (leer el menú).
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
