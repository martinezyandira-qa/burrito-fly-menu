// Formato de precio del menú: 8.5 → "$8.50". Sirve en el servidor y en el navegador.
export const precioTexto = (precio: number) => `$${precio.toFixed(2)}`;
