// Avisos por Telegram (solo servidor). El token y el chat salen de variables de entorno
// SIN prefijo NEXT_PUBLIC, así que nunca llegan al navegador. Si este archivo se importara
// desde el navegador, la compilación falla gracias a "server-only".
import "server-only";

import { SITIO_URL } from "@/config";
import { precioTexto } from "@/lib/precio";

export type AvisoPedido = {
  numero: number;
  nombre: string;
  telefono: string;
  tipo: "recoger" | "domicilio";
  direccion: string | null;
  notas: string | null;
  total: number;
  lineas: { nombre: string; cantidad: number; precioUnitario: number; nota: string | null }[];
  /** Mensaje de prueba desde el panel */
  prueba?: boolean;
};

export type ResultadoTelegram = { ok: true } | { ok: false; error: string };

/** Límite de Telegram para un mensaje. */
const LIMITE = 4096;

/** Telegram (parse_mode HTML) solo necesita escapar &, < y >. Todo texto del cliente pasa por aquí. */
export const escaparHtml = (texto: string) => texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const enlacePedido = (numero: number) => `${SITIO_URL}/admin/pedidos#pedido-${numero}`;

/** Arma el mensaje. Si quedara demasiado largo, quita notas por platillo y luego platillos del final. */
export function mensajePedido(p: AvisoPedido): string {
  const armar = (conNotas: boolean, maxLineas: number) => {
    const e = escaparHtml;
    const filas: string[] = [];
    filas.push(`${p.prueba ? "🧪 <b>PRUEBA</b> · " : ""}🌯 <b>Pedido nuevo #${p.numero}</b>`, "");
    filas.push(`👤 ${e(p.nombre)}`, `📞 ${e(p.telefono)}`);
    filas.push(p.tipo === "domicilio" ? "🛵 <b>A domicilio</b>" : "🏃 <b>Para recoger</b>");
    if (p.tipo === "domicilio" && p.direccion) filas.push(`📍 ${e(p.direccion)}`);
    filas.push("");
    for (const l of p.lineas.slice(0, maxLineas)) {
      filas.push(`${l.cantidad} × ${e(l.nombre)} — ${precioTexto(l.precioUnitario * l.cantidad)}`);
      if (conNotas && l.nota) filas.push(`   <i>Nota: ${e(l.nota)}</i>`);
    }
    const faltan = p.lineas.length - maxLineas;
    if (faltan > 0) filas.push(`… y ${faltan} platillo(s) más (ver en el panel)`);
    filas.push("", `<b>Total: ${precioTexto(p.total)}</b>`);
    if (p.notas) filas.push("", `📝 <b>Notas:</b> ${e(p.notas)}`);
    filas.push("", `<a href="${enlacePedido(p.numero)}">Abrir pedido #${p.numero} en el panel</a>`);
    return filas.join("\n");
  };

  let texto = armar(true, p.lineas.length);
  if (texto.length <= LIMITE) return texto;
  texto = armar(false, p.lineas.length);
  for (let n = p.lineas.length; texto.length > LIMITE && n > 0; n--) texto = armar(false, n - 1);
  return texto.length <= LIMITE ? texto : texto.slice(0, LIMITE);
}

/** Manda un mensaje al chat configurado. No lanza errores: devuelve qué pasó. */
export async function enviarTelegram(texto: string): Promise<ResultadoTelegram> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chat = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token) return { ok: false, error: "Falta la variable TELEGRAM_BOT_TOKEN." };
  if (!chat) return { ok: false, error: "Falta la variable TELEGRAM_CHAT_ID." };

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat,
        text: texto,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    const datos = (await r.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
    if (!r.ok || !datos?.ok) {
      return { ok: false, error: ocultarToken(`Telegram respondió ${r.status}: ${datos?.description ?? "sin detalle"}`, token) };
    }
    return { ok: true };
  } catch (e) {
    const detalle =
      e instanceof Error ? (e.name === "TimeoutError" ? "Telegram no respondió a tiempo." : e.message) : "Error desconocido.";
    return { ok: false, error: ocultarToken(`No se pudo conectar con Telegram: ${detalle}`, token) };
  }
}

/** Aviso de pedido nuevo. Si falla, solo lo registra en la consola del servidor. */
export async function avisarPedidoNuevo(p: AvisoPedido) {
  const r = await enviarTelegram(mensajePedido(p));
  if (!r.ok) console.error(`[telegram] No se pudo avisar del pedido #${p.numero}. ${r.error}`);
}

/** Nunca dejar el token en un registro o en la pantalla. */
const ocultarToken = (texto: string, token: string) => texto.split(token).join("«token»");
