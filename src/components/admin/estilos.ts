// Clases compartidas del panel (botones y campos de al menos 44 px de alto, cómodos en el celular).

export const BOTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50";
export const BOTON_PRINCIPAL = `${BOTON} bg-rosa text-white`;
export const BOTON_OSCURO = `${BOTON} bg-chocolate text-mantequilla`;
export const BOTON_CLARO = `${BOTON} bg-white text-chocolate border border-gris-borde`;
export const BOTON_PELIGRO = `${BOTON} bg-white text-rosa-oscuro border border-gris-borde`;

export const ETIQUETA = "flex flex-col gap-1.5 text-sm font-semibold";
export const CAMPO =
  "min-h-12 w-full rounded-xl border border-gris-borde bg-white px-3.5 text-base font-normal text-chocolate outline-none focus:border-chocolate focus:ring-2 focus:ring-mantequilla-oscuro";
export const AYUDA = "text-xs font-normal text-chocolate-suave";
export const TARJETA = "rounded-2xl bg-white p-4";
export const AVISO_ERROR = "rounded-xl bg-rosa/10 px-3.5 py-3 text-sm font-semibold text-rosa-oscuro";
