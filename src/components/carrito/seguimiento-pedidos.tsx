"use client";

import { useEffect, useState } from "react";
import { IconoCheck } from "@/components/iconos";
import { TEXTOS, type Idioma } from "@/i18n";
import { ESTADOS_FINALES, type EstadoPedido } from "@/lib/estados-pedido";
import { olvidarPedidos, useMisPedidos } from "@/lib/mis-pedidos";
import { consultarEstados, type EstadoCliente } from "@/lib/pedidos";

/** Cada cuánto se vuelve a preguntar mientras el pedido sigue en curso. */
const CADA_MS = 15_000;

const PASO: Record<EstadoPedido, number> = {
  nuevo: 0,
  aceptado: 1,
  preparando: 2,
  listo: 3,
  entregado: 3,
  rechazado: -1,
  cancelado: -1,
};

const PILDORA: Record<EstadoPedido, string> = {
  nuevo: "bg-mantequilla text-chocolate",
  aceptado: "bg-mantequilla-oscuro text-chocolate",
  preparando: "bg-mantequilla-oscuro text-chocolate",
  listo: "bg-[#1f8a4c] text-white",
  entregado: "bg-chocolate text-mantequilla",
  rechazado: "bg-rosa text-white",
  cancelado: "bg-rosa text-white",
};

/**
 * Estado en vivo de los pedidos que hizo este cliente (los recuerda su navegador).
 * En el menú muestra todos los recientes; en la confirmación, solo el que se acaba de hacer.
 */
export function SeguimientoPedidos({ idioma, token, className = "" }: { idioma: Idioma; token?: string; className?: string }) {
  const t = TEXTOS[idioma].seguimiento;
  const todos = useMisPedidos();
  const pedidos = token ? todos.filter((p) => p.token === token) : todos;
  const claves = pedidos.map((p) => p.token).join(",");
  const [estados, setEstados] = useState<Record<string, EstadoCliente>>({});
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    if (!claves) return;
    const tokens = claves.split(",");
    let vivo = true;
    let enCurso = false;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const programar = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(consultar, CADA_MS);
    };

    async function consultar() {
      if (enCurso) return;
      // Con la pestaña escondida no se pregunta; se retoma al volver.
      if (document.visibilityState !== "visible") return programar();
      enCurso = true;
      let r: EstadoCliente[] | null = null;
      try {
        r = await consultarEstados(tokens);
      } catch {
        r = null;
      }
      enCurso = false;
      if (!vivo) return;
      if (r === null) {
        setSinConexion(true);
        return programar();
      }
      setSinConexion(false);
      const mapa = Object.fromEntries(r.map((e) => [e.token, e]));
      setEstados(mapa);
      // Si un pedido ya no existe (se borró o tiene más de 2 días), se deja de mostrar.
      const faltan = tokens.filter((x) => !mapa[x]);
      if (faltan.length) olvidarPedidos(faltan);
      if (r.some((e) => !ESTADOS_FINALES.includes(e.estado))) programar();
    }

    const alVolver = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(temporizador);
        consultar();
      }
    };

    consultar();
    document.addEventListener("visibilitychange", alVolver);
    return () => {
      vivo = false;
      clearTimeout(temporizador);
      document.removeEventListener("visibilitychange", alVolver);
    };
  }, [claves]);

  if (pedidos.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {pedidos.map((p) => {
        const e = estados[p.token];
        const final = e ? ESTADOS_FINALES.includes(e.estado) : false;
        const mensaje = !e
          ? t.consultando
          : e.estado === "listo"
            ? e.tipo === "domicilio"
              ? t.mensajes.listoDomicilio
              : t.mensajes.listoRecoger
            : t.mensajes[e.estado];
        const paso = e ? PASO[e.estado] : 0;

        return (
          <section
            key={p.token}
            aria-label={`${t.titulo} #${p.numero}`}
            className={`flex flex-col gap-3 rounded-[22px] bg-white p-4 ${e?.estado === "listo" ? "ring-2 ring-[#1f8a4c]" : ""}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-[30px] leading-none">
                {t.titulo} <span className="tabular-nums">#{p.numero}</span>
              </h2>
              {e && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${PILDORA[e.estado]}`}>
                  {t.estados[e.estado]}
                </span>
              )}
            </div>

            {paso >= 0 && (
              <ol className="grid grid-cols-4 gap-1.5">
                {t.pasos.map((nombre, i) => {
                  const hecho = e != null && i <= paso;
                  return (
                    <li key={nombre} className="flex flex-col gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`h-1.5 rounded-full ${hecho ? (e?.estado === "listo" || e?.estado === "entregado" ? "bg-[#1f8a4c]" : "bg-rosa") : "bg-gris"}`}
                      />
                      <span className={`flex items-center gap-1 text-[11px] font-semibold ${hecho ? "text-chocolate" : "text-chocolate-suave"}`}>
                        {hecho && <IconoCheck size={11} />}
                        {nombre}
                        <span className="sr-only">{hecho ? " ✓" : ""}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            <p aria-live="polite" className="text-[15px] font-semibold">
              {mensaje}
            </p>
            {e?.motivo && (
              <p className="-mt-1.5 text-sm text-chocolate-suave">
                {t.motivo} {e.motivo}
              </p>
            )}

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-chocolate-suave">{sinConexion ? t.sinConexion : final ? "" : t.seActualiza}</span>
              {final && (
                <button
                  type="button"
                  onClick={() => olvidarPedidos([p.token])}
                  className="min-h-11 rounded-full border border-gris-borde px-4 text-sm font-semibold"
                >
                  {t.ocultar}
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
