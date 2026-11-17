"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { IconoCheck, IconoFlechaIzquierda } from "@/components/iconos";
import { TEXTOS, rutaInicio, type CodigoError, type Idioma } from "@/i18n";
import {
  actualizarPrecios,
  marcarAgotado,
  totalCarrito,
  useCarrito,
  vaciarCarrito,
  type LineaCarrito,
} from "@/lib/carrito";
import { enviarPedido, type RespuestaPedido } from "@/lib/pedidos";
import { precioTexto } from "@/lib/precio";
import { LineasCarrito } from "./lineas-carrito";

type Confirmado = Extract<RespuestaPedido, { ok: true }> & { nombres: Record<number, string> };

const sinSuscripcion = () => () => {};
/** false en el servidor, true en el navegador (el carrito vive en el navegador). */
const useEnNavegador = () => useSyncExternalStore(sinSuscripcion, () => true, () => false);

const CAMPO =
  "min-h-12 w-full rounded-xl border border-gris-borde bg-white px-3.5 text-base text-chocolate outline-none focus:border-chocolate focus:ring-2 focus:ring-mantequilla-oscuro";
const ETIQUETA = "flex flex-col gap-1.5 text-sm font-semibold";

export function FormularioPedido({ idioma }: { idioma: Idioma }) {
  const t = TEXTOS[idioma].pedido;
  const lineas = useCarrito();
  const enNavegador = useEnNavegador();
  const [confirmado, setConfirmado] = useState<Confirmado | null>(null);

  if (confirmado) return <Confirmacion pedido={confirmado} idioma={idioma} />;

  if (!enNavegador) {
    return <div aria-busy="true" className="h-64 rounded-[22px] bg-white" />;
  }

  if (lineas.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-[22px] bg-white p-5">
        <p className="text-[15px]">{t.vacio}</p>
        <Link href={rutaInicio(idioma)} className="inline-flex min-h-12 items-center rounded-full bg-rosa px-6 text-[15px] font-semibold text-white">
          {t.irMenu}
        </Link>
      </div>
    );
  }

  return <Formulario lineas={lineas} idioma={idioma} alConfirmar={setConfirmado} />;
}

function Formulario({
  lineas,
  idioma,
  alConfirmar,
}: {
  lineas: LineaCarrito[];
  idioma: Idioma;
  alConfirmar: (c: Confirmado) => void;
}) {
  const t = TEXTOS[idioma].pedido;
  const tc = TEXTOS[idioma].carrito;
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipo, setTipo] = useState<"recoger" | "domicilio">("recoger");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [tocado, setTocado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();
  const abiertoEn = useRef(0);
  const cajaError = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    abiertoEn.current = Date.now();
  }, []);

  useEffect(() => {
    if (error) cajaError.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  const total = totalCarrito(lineas);
  const digitos = telefono.replace(/\D/g, "");
  const telefonoValido = digitos.length === 10;
  const hayAgotados = lineas.some((l) => l.agotado);

  function mostrarError(codigo: CodigoError, extra = "") {
    setError(`${t.errores[codigo]}${extra ? ` ${extra}` : ""}`);
  }

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTocado(true);
    setError(null);
    if (nombre.trim().length < 2) return mostrarError("NOMBRE_INVALIDO");
    if (!telefonoValido) return mostrarError("TELEFONO_INVALIDO");
    if (tipo === "domicilio" && direccion.trim().length < 5) return mostrarError("DIRECCION_REQUERIDA");
    if (hayAgotados) return setError(tc.agotado);

    const sitioWeb = String(new FormData(e.currentTarget).get("sitio_web") ?? "");
    const copia = lineas;

    iniciar(async () => {
      let r: RespuestaPedido;
      try {
        r = await enviarPedido({
          nombre,
          telefono: digitos,
          tipo,
          direccion,
          notas,
          lineas: copia.map((l) => ({ menu_item_id: l.id, quantity: l.cantidad, note: l.nota })),
          totalVisto: total,
          sitioWeb,
          abiertoEn: abiertoEn.current,
        });
      } catch {
        return mostrarError("GENERAL");
      }

      if (r.ok) {
        const nombres = Object.fromEntries(copia.map((l) => [l.id, idioma === "en" ? l.nombreEn || l.nombre : l.nombre]));
        alConfirmar({ ...r, nombres });
        vaciarCarrito();
        window.scrollTo({ top: 0 });
        return;
      }
      if (r.error === "PLATILLO_AGOTADO" && r.agotado) {
        marcarAgotado(r.agotado.id);
        const linea = copia.find((l) => l.id === r.agotado?.id);
        const nombreVisible = linea ? (idioma === "en" ? linea.nombreEn || linea.nombre : linea.nombre) : r.agotado.nombre;
        return mostrarError("PLATILLO_AGOTADO", nombreVisible);
      }
      if (r.error === "PRECIOS_CAMBIARON" && r.precios) actualizarPrecios(r.precios);
      mostrarError(r.error);
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-3">
      <section aria-labelledby="titulo-resumen" className="flex flex-col gap-3 rounded-[22px] bg-white p-4">
        <h2 id="titulo-resumen" className="font-display text-[30px] leading-none">
          {t.resumen}
        </h2>
        <LineasCarrito lineas={lineas} idioma={idioma} />
        <div className="flex items-baseline justify-between px-1.5 pt-1">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-chocolate-suave uppercase">{tc.total}</span>
          <span className="text-2xl font-bold tabular-nums">{precioTexto(total)}</span>
        </div>
      </section>

      <section aria-labelledby="titulo-datos" className="flex flex-col gap-4 rounded-[22px] bg-white p-4">
        <h2 id="titulo-datos" className="font-display text-[30px] leading-none">
          {t.datos}
        </h2>
        <label className={ETIQUETA}>
          {t.nombre}
          <input
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="name"
            maxLength={80}
            required
            aria-invalid={tocado && nombre.trim().length < 2}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          {t.telefono}
          <input
            name="telefono"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^\d\s-]/g, "").slice(0, 14))}
            onBlur={() => telefono && setTocado(true)}
            required
            aria-invalid={tocado && !telefonoValido}
            aria-describedby="ayuda-telefono"
            className={CAMPO}
          />
          {tocado && !telefonoValido && (
            <span id="ayuda-telefono" className="text-xs font-semibold text-rosa-oscuro">
              {t.telefonoInvalido}
            </span>
          )}
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">{t.tipo}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["recoger", "domicilio"] as const).map((opcion) => (
              <label
                key={opcion}
                className={`flex min-h-13 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-3 text-[15px] font-semibold transition has-focus-visible:ring-2 has-focus-visible:ring-mantequilla-oscuro ${
                  tipo === opcion ? "border-chocolate bg-chocolate text-mantequilla" : "border-gris-borde bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="tipo"
                  value={opcion}
                  checked={tipo === opcion}
                  onChange={() => setTipo(opcion)}
                  className="sr-only"
                />
                {tipo === opcion && <IconoCheck size={16} />}
                {opcion === "recoger" ? t.recoger : t.domicilio}
              </label>
            ))}
          </div>
        </fieldset>

        {tipo === "domicilio" && (
          <label className={ETIQUETA}>
            {t.direccion}
            <textarea
              name="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              autoComplete="street-address"
              rows={3}
              maxLength={300}
              required
              aria-invalid={tocado && direccion.trim().length < 5}
              className={`${CAMPO} py-3`}
            />
            <span className="text-xs font-normal text-chocolate-suave">{t.direccionAyuda}</span>
          </label>
        )}

        <label className={ETIQUETA}>
          {t.notas}
          <textarea
            name="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={t.notasEjemplo}
            className={`${CAMPO} py-3`}
          />
        </label>

        {/* Anti-spam: campo invisible para personas. Si llega lleno, el pedido se rechaza. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Sitio web
            <input type="text" name="sitio_web" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>
      </section>

      <p className="px-2 text-sm text-chocolate-suave">{t.pago}</p>

      {error && (
        <p ref={cajaError} role="alert" className="rounded-2xl bg-rosa/10 px-4 py-3 text-[15px] font-semibold text-rosa-oscuro">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 bg-fondo/95 px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="submit"
          disabled={enviando}
          className="flex min-h-14 w-full cursor-pointer items-center justify-center rounded-full bg-rosa px-5 text-base font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {enviando ? t.enviando : `${t.confirmar} · ${precioTexto(total)}`}
        </button>
      </div>
    </form>
  );
}

function Confirmacion({ pedido, idioma }: { pedido: Confirmado; idioma: Idioma }) {
  const t = TEXTOS[idioma].pedido;
  const tc = TEXTOS[idioma].carrito;
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titulo.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col items-center gap-2 rounded-[22px] bg-mantequilla px-5 pt-6 pb-7 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-rosa text-white">
          <IconoCheck size={28} />
        </span>
        <h2 ref={titulo} tabIndex={-1} className="font-display text-[44px] leading-none outline-none">
          {t.recibido}
        </h2>
        <span className="text-[11px] font-semibold tracking-[0.16em] text-chocolate-suave uppercase">{t.numero}</span>
        <span className="font-display text-[84px] leading-[0.85] tabular-nums">#{pedido.numero}</span>
        <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold">
          {pedido.tipo === "domicilio" ? t.aDomicilio : t.paraRecoger}
        </span>
        <p className="mt-1 max-w-80 text-sm">{t.guardaNumero}</p>
      </section>

      <section aria-labelledby="titulo-confirmado" className="flex flex-col gap-2 rounded-[22px] bg-white p-4">
        <h3 id="titulo-confirmado" className="font-display text-[28px] leading-none">
          {t.resumen}
        </h3>
        <ul className="flex flex-col divide-y divide-gris-linea">
          {pedido.lineas.map((l, i) => (
            <li key={i} className="flex items-start justify-between gap-3 py-2.5">
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold">
                  {l.quantity} × {pedido.nombres[l.menu_item_id] ?? l.item_name}
                </span>
                {l.note && <span className="text-sm text-chocolate-suave">“{l.note}”</span>}
              </span>
              <span className="text-[15px] font-semibold tabular-nums">{precioTexto(l.unit_price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between border-t border-gris-linea pt-3">
          <span className="text-[11px] font-semibold tracking-[0.14em] text-chocolate-suave uppercase">{tc.total}</span>
          <span className="text-2xl font-bold tabular-nums">{precioTexto(pedido.total)}</span>
        </div>
      </section>

      <p className="px-2 text-sm text-chocolate-suave">{t.pago}</p>

      <Link
        href={rutaInicio(idioma)}
        className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-chocolate text-[15px] font-semibold text-mantequilla"
      >
        <IconoFlechaIzquierda size={18} />
        {t.volverMenu}
      </Link>
    </div>
  );
}
