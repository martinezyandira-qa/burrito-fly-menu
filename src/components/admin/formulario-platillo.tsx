"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { guardarPlatillo } from "@/app/admin/acciones";
import type { CategoriaAdmin, PlatilloAdmin } from "@/lib/admin";
import { BUCKET_FOTOS, rutaEnBucket } from "@/lib/supabase-config";
import { crearClienteNavegador } from "@/lib/supabase-navegador";
import { AVISO_ERROR, AYUDA, BOTON_CLARO, BOTON_PELIGRO, BOTON_PRINCIPAL, CAMPO, ETIQUETA, TARJETA } from "./estilos";

type Props = {
  categorias: Pick<CategoriaAdmin, "id" | "name">[];
  platillo?: PlatilloAdmin;
};

// Formulario para crear o editar un platillo.
export function FormularioPlatillo({ categorias, platillo }: Props) {
  const [estado, accion, guardando] = useActionState(guardarPlatillo, undefined);
  const [subiendo, setSubiendo] = useState(false);

  return (
    <form action={accion} className="flex flex-col gap-4">
      {platillo && <input type="hidden" name="id" value={platillo.id} />}

      <section className={`${TARJETA} flex flex-col gap-4`}>
        <CampoFoto inicial={platillo?.image_url ?? null} onSubiendo={setSubiendo} />
      </section>

      <section className={`${TARJETA} flex flex-col gap-4`}>
        <h2 className="font-display text-[26px] leading-none">Español</h2>
        <label className={ETIQUETA}>
          Nombre
          <input name="name" required maxLength={80} defaultValue={platillo?.name} className={CAMPO} />
        </label>
        <label className={ETIQUETA}>
          Descripción
          <textarea name="description" rows={3} maxLength={400} defaultValue={platillo?.description ?? ""} className={`${CAMPO} py-3`} />
        </label>
      </section>

      <section className={`${TARJETA} flex flex-col gap-4`}>
        <div>
          <h2 className="font-display text-[26px] leading-none">English</h2>
          <p className={AYUDA}>Para el menú en inglés. Si lo dejas vacío, se usa el texto en español.</p>
        </div>
        <label className={ETIQUETA}>
          Name
          <input name="name_en" maxLength={80} defaultValue={platillo?.name_en} lang="en" className={CAMPO} />
        </label>
        <label className={ETIQUETA}>
          Description
          <textarea
            name="description_en"
            rows={3}
            maxLength={400}
            lang="en"
            defaultValue={platillo?.description_en ?? ""}
            className={`${CAMPO} py-3`}
          />
        </label>
      </section>

      <section className={`${TARJETA} grid gap-4 sm:grid-cols-2`}>
        <label className={ETIQUETA}>
          Precio (USD)
          <input
            name="price"
            required
            inputMode="decimal"
            pattern="[0-9]+([.,][0-9]{1,2})?"
            placeholder="8.99"
            defaultValue={platillo ? platillo.price.toFixed(2) : ""}
            className={CAMPO}
          />
        </label>
        <label className={ETIQUETA}>
          Categoría
          <select name="category_id" required defaultValue={platillo?.category_id ?? ""} className={CAMPO}>
            <option value="" disabled>
              Elige una…
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-12 items-center gap-3 text-[15px] font-semibold sm:col-span-2">
          <input
            type="checkbox"
            name="available"
            defaultChecked={platillo?.available ?? true}
            className="size-6 flex-none accent-[#1f8a4c]"
          />
          Disponible (si no, aparece como agotado y no se muestra en el menú)
        </label>
      </section>

      {estado?.error && (
        <p role="alert" className={AVISO_ERROR}>
          {estado.error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex gap-2 bg-fondo/95 px-4 py-3 backdrop-blur">
        <Link href="/admin" className={`${BOTON_CLARO} flex-1`}>
          Cancelar
        </Link>
        <button type="submit" disabled={guardando || subiendo} className={`${BOTON_PRINCIPAL} flex-[2]`}>
          {guardando ? "Guardando…" : subiendo ? "Subiendo foto…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

// ---------- Foto ----------

const LADO_MAXIMO = 1600; // px

/** Achica la foto en el navegador (máx. 1600 px, JPG) para que suba rápido y el menú cargue ligero. */
async function achicarFoto(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return new Promise((listo, fallo) =>
    lienzo.toBlob((blob) => (blob ? listo(blob) : fallo(new Error("No se pudo leer la imagen."))), "image/jpeg", 0.85),
  );
}

function CampoFoto({ inicial, onSubiendo }: { inicial: string | null; onSubiendo: (v: boolean) => void }) {
  const [foto, setFoto] = useState<string | null>(inicial);
  const [estado, setEstado] = useState<"listo" | "subiendo">("listo");
  const [error, setError] = useState<string | null>(null);
  const selector = useRef<HTMLInputElement>(null);

  // Fotos subidas en esta pantalla que todavía no se guardaron: si se reemplazan, se borran.
  const subidaSinGuardar = foto !== inicial ? rutaEnBucket(foto) : null;

  async function borrarSubidaSinGuardar() {
    if (subidaSinGuardar) await crearClienteNavegador().storage.from(BUCKET_FOTOS).remove([subidaSinGuardar]);
  }

  async function elegir(archivo: File | undefined) {
    if (!archivo) return;
    setError(null);
    setEstado("subiendo");
    onSubiendo(true);
    try {
      const blob = await achicarFoto(archivo);
      const supabase = crearClienteNavegador();
      const ruta = `platillos/${crypto.randomUUID()}.jpg`;
      const { error: e } = await supabase.storage
        .from(BUCKET_FOTOS)
        .upload(ruta, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (e) throw new Error(`No se pudo subir la foto: ${e.message}`);
      await borrarSubidaSinGuardar();
      setFoto(supabase.storage.from(BUCKET_FOTOS).getPublicUrl(ruta).data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setEstado("listo");
      onSubiendo(false);
      if (selector.current) selector.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold">Foto</span>
      <input type="hidden" name="image_url" value={foto ?? ""} />
      <input type="hidden" name="image_url_anterior" value={inicial ?? ""} />

      {/* Tamaño fijo (cuadrado) para que nada salte al cargar */}
      <div className="relative aspect-square w-full max-w-64 overflow-hidden rounded-2xl bg-gris">
        {foto ? (
          <Image src={foto} alt="Foto del platillo" fill sizes="256px" className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-sm text-chocolate-suave">Sin foto</span>
        )}
        {estado === "subiendo" && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-sm font-semibold">Subiendo…</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label className={`${BOTON_CLARO} cursor-pointer`}>
          {foto ? "Cambiar foto" : "Subir foto"}
          <input
            ref={selector}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            disabled={estado === "subiendo"}
            onChange={(e) => elegir(e.target.files?.[0])}
          />
        </label>
        {foto && (
          <button
            type="button"
            className={BOTON_PELIGRO}
            disabled={estado === "subiendo"}
            onClick={async () => {
              await borrarSubidaSinGuardar();
              setFoto(null);
            }}
          >
            Quitar foto
          </button>
        )}
      </div>
      <p className={AYUDA}>Se achica sola antes de subir. La foto anterior se borra cuando guardas.</p>
      {error && (
        <p role="alert" className={AVISO_ERROR}>
          {error}
        </p>
      )}
    </div>
  );
}
