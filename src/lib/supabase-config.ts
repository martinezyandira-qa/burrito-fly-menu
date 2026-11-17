// Valores de conexión con Supabase. Vienen de variables de entorno:
// en tu computadora, de .env.local; en Vercel, de Settings → Environment Variables.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const llave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !llave) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. Agrégalas en .env.local (local) o en Vercel → Settings → Environment Variables.",
  );
}

export const SUPABASE_URL = url;
/** Llave pública (publishable/anon): solo puede hacer lo que permitan las políticas RLS. */
export const SUPABASE_LLAVE = llave;

/** Bucket de Storage donde el panel sube las fotos. */
export const BUCKET_FOTOS = "menu-images";

/** Si la foto vive en nuestro bucket, devuelve su ruta dentro de él (para poder borrarla). */
export function rutaEnBucket(imagen: string | null | undefined) {
  if (!imagen) return null;
  const prefijo = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_FOTOS}/`;
  return imagen.startsWith(prefijo) ? decodeURIComponent(imagen.slice(prefijo.length)) : null;
}
