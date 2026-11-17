// Proxy (antes llamado "middleware" en Next.js): corre antes de cada página de /admin.
// 1. Renueva la sesión de Supabase (cookies).
// 2. Sin sesión → /admin/login. Con sesión en /admin/login → /admin.
// Es solo un primer filtro: cada página y cada acción del panel vuelve a comprobar que seas admin.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_LLAVE, SUPABASE_URL } from "@/lib/supabase-config";

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_LLAVE, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesNuevas, encabezados) {
        cookiesNuevas.forEach(({ name, value }) => request.cookies.set(name, value));
        respuesta = NextResponse.next({ request });
        cookiesNuevas.forEach(({ name, value, options }) => respuesta.cookies.set(name, value, options));
        Object.entries(encabezados).forEach(([clave, valor]) => respuesta.headers.set(clave, valor));
      },
    },
  });

  // getClaims() verifica el token de la sesión (y lo renueva si hace falta).
  const { data } = await supabase.auth.getClaims();
  const conSesion = Boolean(data?.claims);
  const enLogin = request.nextUrl.pathname === "/admin/login";

  if (!conSesion && !enLogin) return redirigir(request, "/admin/login", respuesta);
  if (conSesion && enLogin) return redirigir(request, "/admin", respuesta);
  return respuesta;
}

// Redirige sin perder las cookies de sesión que Supabase acaba de renovar.
function redirigir(request: NextRequest, ruta: string, respuesta: NextResponse) {
  const destino = NextResponse.redirect(new URL(ruta, request.url));
  respuesta.cookies.getAll().forEach((cookie) => destino.cookies.set(cookie));
  // Encabezados que Supabase pide para que ninguna caché guarde una respuesta con sesión.
  for (const clave of ["cache-control", "expires", "pragma"]) {
    const valor = respuesta.headers.get(clave);
    if (valor) destino.headers.set(clave, valor);
  }
  return destino;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
