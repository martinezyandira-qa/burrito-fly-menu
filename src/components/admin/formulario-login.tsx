"use client";

import { useActionState } from "react";
import { iniciarSesion } from "@/app/admin/acciones";
import { AVISO_ERROR, BOTON_PRINCIPAL, CAMPO, ETIQUETA } from "./estilos";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, undefined);
  return (
    <form action={accion} className="flex flex-col gap-4">
      <label className={ETIQUETA}>
        Correo
        <input name="correo" type="email" autoComplete="email" inputMode="email" required className={CAMPO} />
      </label>
      <label className={ETIQUETA}>
        Contraseña
        <input name="contrasena" type="password" autoComplete="current-password" required className={CAMPO} />
      </label>
      {estado?.error && (
        <p role="alert" className={AVISO_ERROR}>
          {estado.error}
        </p>
      )}
      <button type="submit" disabled={pendiente} className={`${BOTON_PRINCIPAL} min-h-12 w-full`}>
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
