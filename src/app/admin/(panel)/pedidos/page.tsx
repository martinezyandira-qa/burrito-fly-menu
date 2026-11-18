import type { Metadata } from "next";
import { borrarPedido } from "@/app/admin/acciones";
import { BotonBorrar } from "@/components/admin/boton-borrar";
import { ActualizarSolo, BotonPruebaTelegram, CambiarEstado, EtiquetaEstado } from "@/components/admin/pedidos";
import { obtenerPedidosAdmin } from "@/lib/admin";
import { precioTexto } from "@/lib/precio";

export const metadata: Metadata = { title: "Pedidos" };

const fecha = new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
});

// /admin/pedidos: los más nuevos primero, con su estado.
export default async function PaginaPedidos() {
  const pedidos = await obtenerPedidosAdmin();
  const nuevos = pedidos.filter((p) => p.status === "nuevo").length;

  return (
    <>
      <ActualizarSolo />
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-[44px] leading-none">Pedidos</h1>
        {nuevos > 0 && <span className="rounded-full bg-rosa px-3 py-1 text-sm font-bold text-white">{nuevos} nuevos</span>}
      </div>
      <p className="mb-5 text-sm text-chocolate-suave">
        Acepta o rechaza cada pedido nuevo; el cliente ve el estado en el menú. Se actualiza solo cada 30 segundos.
      </p>

      <div className="mb-5">
        <BotonPruebaTelegram />
      </div>

      {pedidos.length === 0 && <p className="rounded-2xl bg-white p-5">Todavía no hay pedidos.</p>}

      <ul className="flex flex-col gap-3">
        {pedidos.map((p) => (
          <li
            key={p.id}
            id={`pedido-${p.order_number}`}
            className={`scroll-mt-4 rounded-2xl bg-white p-4 target:ring-4 target:ring-mantequilla-oscuro ${p.status === "nuevo" ? "ring-2 ring-rosa" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-[34px] leading-none tabular-nums">#{p.order_number}</span>
              <EtiquetaEstado estado={p.status} />
              <span className="ml-auto text-sm text-chocolate-suave">{fecha.format(new Date(p.created_at))}</span>
            </div>

            <div className="mt-3 flex flex-col gap-1 text-[15px]">
              <span className="font-semibold">{p.customer_name}</span>
              <a href={`tel:${p.phone}`} className="inline-flex min-h-11 items-center self-start font-semibold text-rosa-oscuro underline">
                📞 {p.phone}
              </a>
              <span>
                <strong>{p.order_type === "domicilio" ? "A domicilio" : "Para recoger"}</strong>
                {p.address && <> · {p.address}</>}
              </span>
              {p.notes && <span className="rounded-xl bg-mantequilla px-3 py-2 text-sm">Nota: {p.notes}</span>}
              {p.status_reason && (
                <span className="text-sm text-chocolate-suave">
                  Motivo ({p.status === "rechazado" ? "rechazo" : "cancelación"}): {p.status_reason}
                </span>
              )}
            </div>

            <ul className="mt-3 flex flex-col divide-y divide-gris-linea rounded-xl bg-gris px-3">
              {p.order_items.map((l) => (
                <li key={l.id} className="flex items-start justify-between gap-3 py-2 text-[15px]">
                  <span className="flex flex-col">
                    <span className="font-semibold">
                      {l.quantity} × {l.item_name}
                    </span>
                    {l.note && <span className="text-sm text-rosa-oscuro">“{l.note}”</span>}
                  </span>
                  <span className="tabular-nums">{precioTexto(l.unit_price * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between px-1 text-lg font-bold tabular-nums">
              <span>Total</span>
              <span>{precioTexto(p.total)}</span>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-gris-linea pt-3">
              <CambiarEstado id={p.id} numero={p.order_number} estado={p.status} />
              <div className="flex justify-end">
                <BotonBorrar
                  accion={borrarPedido.bind(null, p.id)}
                  titulo={`¿Borrar el pedido #${p.order_number}?`}
                  texto="Se borra del historial. Para pedidos reales es mejor marcarlo como Cancelado o Entregado."
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
