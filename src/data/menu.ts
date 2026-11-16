// Datos de la carta de Burrito Fly.
// Para agregar o cambiar un producto: edita esta lista y pon su foto en /public/productos/<slug>.jpg

import type { Idioma } from "@/i18n";

export type Producto = {
  slug: string;
  nombre: string;
  precio: number;
  descripcion: string;
  /** Nombre y descripción en inglés */
  en: { nombre: string; descripcion: string };
};

export type Categoria = {
  slug: string;
  nombre: string;
  /** Nombre en inglés */
  nombreEn: string;
  /** slug del producto cuya foto representa a la categoría */
  imagen: string;
  productos: Producto[];
};

export const CATEGORIAS: Categoria[] = [
  {
    slug: "entradas",
    nombre: "Entradas y acompañantes",
    nombreEn: "Starters & sides",
    imagen: "alitas-bbq",
    productos: [
      { slug: "alitas-bbq", nombre: "Alitas BBQ", precio: 9.99, descripcion: "Alitas de pollo bañadas en salsa BBQ ahumada y glaseada, con bastones de apio y zanahoria.",
        en: { nombre: "BBQ wings", descripcion: "Chicken wings tossed in a smoky, glazed BBQ sauce, with celery and carrot sticks." } },
      { slug: "chicken-tenders", nombre: "Chicken tenders", precio: 7.99, descripcion: "Tiras de pechuga de pollo empanizadas y crujientes, con salsa de miel y mostaza.",
        en: { nombre: "Chicken tenders", descripcion: "Crispy breaded chicken breast strips, with honey mustard sauce." } },
      { slug: "nuggets", nombre: "Nuggets (10)", precio: 6.49, descripcion: "Diez trocitos de pollo empanizados, dorados y crujientes. Ideales para compartir o para los niños.",
        en: { nombre: "Nuggets (10)", descripcion: "Ten golden, crispy breaded chicken bites. Great for sharing or for the kids." } },
      { slug: "empanadas", nombre: "Empanadas (3)", precio: 5.49, descripcion: "Empanadas fritas de masa crujiente rellenas de carne molida sazonada, con salsa chimichurri.",
        en: { nombre: "Empanadas (3)", descripcion: "Fried empanadas with a crispy crust, filled with seasoned ground beef, served with chimichurri sauce." } },
      { slug: "papas-fritas", nombre: "Papas fritas", precio: 3.99, descripcion: "Papas doradas, crujientes por fuera y suaves por dentro, con un toque de sal.",
        en: { nombre: "French fries", descripcion: "Golden fries, crispy on the outside and soft on the inside, with a touch of salt." } },
    ],
  },
  {
    slug: "platos-fuertes",
    nombre: "Platos fuertes",
    nombreEn: "Main dishes",
    imagen: "burrito",
    productos: [
      { slug: "hamburguesa-tocino", nombre: "Hamburguesa con tocino", precio: 10.99, descripcion: "Jugosa carne a la parrilla con queso cheddar derretido, tocino crujiente, lechuga y tomate en pan brioche con ajonjolí.",
        en: { nombre: "Bacon burger", descripcion: "Juicy grilled beef patty with melted cheddar cheese, crispy bacon, lettuce and tomato on a sesame brioche bun." } },
      { slug: "pizza-pepperoni", nombre: "Pizza de pepperoni", precio: 12.99, descripcion: "Masa horneada con bordes dorados, salsa de tomate, abundante queso mozzarella y pepperoni.",
        en: { nombre: "Pepperoni pizza", descripcion: "Oven-baked crust with golden edges, tomato sauce, plenty of mozzarella cheese and pepperoni." } },
      { slug: "pollo-frito", nombre: "Pollo frito (3 piezas)", precio: 8.99, descripcion: "Piezas de pollo marinado con empanizado dorado y crujiente, jugosas por dentro.",
        en: { nombre: "Fried chicken (3 pieces)", descripcion: "Marinated chicken pieces with a golden, crispy breading, juicy on the inside." } },
      { slug: "burrito", nombre: "Burrito", precio: 8.99, descripcion: "Tortilla de harina rellena de carne sazonada, arroz rojo, frijoles negros y queso fundido.",
        en: { nombre: "Burrito", descripcion: "Flour tortilla filled with seasoned beef, red rice, black beans and melted cheese." } },
      { slug: "tacos", nombre: "Tacos (3)", precio: 7.99, descripcion: "Tortillas de maíz con carne asada, cebolla y cilantro frescos, servidos con limón.",
        en: { nombre: "Tacos (3)", descripcion: "Corn tortillas with carne asada, fresh onion and cilantro, served with lime." } },
      { slug: "quesadilla", nombre: "Quesadilla", precio: 7.49, descripcion: "Tortilla dorada rellena de pollo deshebrado y queso derretido, acompañada de guacamole y crema.",
        en: { nombre: "Quesadilla", descripcion: "Golden tortilla filled with shredded chicken and melted cheese, served with guacamole and sour cream." } },
      { slug: "sandwich-club", nombre: "Sándwich club", precio: 7.49, descripcion: "Pan tostado en capas con pavo, tocineta, queso cheddar, lechuga, tomate y mayonesa.",
        en: { nombre: "Club sandwich", descripcion: "Layers of toasted bread with turkey, bacon, cheddar cheese, lettuce, tomato and mayonnaise." } },
      { slug: "ensalada-cesar", nombre: "Ensalada César", precio: 8.49, descripcion: "Lechuga romana con pechuga de pollo a la parrilla, crutones, queso parmesano y aderezo César.",
        en: { nombre: "Caesar salad", descripcion: "Romaine lettuce with grilled chicken breast, croutons, parmesan cheese and Caesar dressing." } },
      { slug: "perro-caliente", nombre: "Perro caliente", precio: 4.99, descripcion: "Salchicha a la parrilla en pan suave con kétchup, mostaza y cebolla picada.",
        en: { nombre: "Hot dog", descripcion: "Grilled sausage on a soft bun with ketchup, mustard and chopped onion." } },
    ],
  },
  {
    slug: "postres",
    nombre: "Postres",
    nombreEn: "Desserts",
    imagen: "brownie-helado",
    productos: [
      { slug: "brownie-helado", nombre: "Brownie con helado", precio: 5.99, descripcion: "Brownie de chocolate tibio con una bola de helado de vainilla y salsa de chocolate.",
        en: { nombre: "Brownie with ice cream", descripcion: "Warm chocolate brownie with a scoop of vanilla ice cream and chocolate sauce." } },
      { slug: "cheesecake", nombre: "Cheesecake", precio: 5.49, descripcion: "Rebanada de pastel de queso cremoso sobre base de galleta, con salsa de fresa y una fresa entera.",
        en: { nombre: "Cheesecake", descripcion: "A slice of creamy cheesecake on a cookie crust, with strawberry sauce and a whole strawberry." } },
      { slug: "donas", nombre: "Donas (3)", precio: 4.49, descripcion: "Tres donas esponjosas: glaseada clásica, cubierta de chocolate y rosa con chispas de colores.",
        en: { nombre: "Donuts (3)", descripcion: "Three fluffy donuts: classic glazed, chocolate frosted, and pink with rainbow sprinkles." } },
    ],
  },
  {
    slug: "bebidas",
    nombre: "Bebidas",
    nombreEn: "Drinks",
    imagen: "batido-fresa",
    productos: [
      { slug: "batido-fresa", nombre: "Batido de fresa", precio: 4.99, descripcion: "Batido cremoso de fresa con crema batida y una fresa fresca encima.",
        en: { nombre: "Strawberry milkshake", descripcion: "Creamy strawberry milkshake topped with whipped cream and a fresh strawberry." } },
      { slug: "cafe-latte", nombre: "Café latte", precio: 3.49, descripcion: "Espresso con leche cremosa al vapor y arte latte en la espuma.",
        en: { nombre: "Caffè latte", descripcion: "Espresso with creamy steamed milk and latte art on the foam." } },
      { slug: "limonada", nombre: "Limonada", precio: 2.99, descripcion: "Limonada natural y refrescante con hielo, rodajas de limón y hojas de hierbabuena.",
        en: { nombre: "Lemonade", descripcion: "Fresh, natural lemonade with ice, lemon slices and mint leaves." } },
      { slug: "jugo-naranja", nombre: "Jugo de naranja", precio: 3.49, descripcion: "Jugo de naranja natural, recién exprimido.",
        en: { nombre: "Orange juice", descripcion: "Natural, freshly squeezed orange juice." } },
      { slug: "coca-cola", nombre: "Coca-Cola", precio: 2.49, descripcion: "Refresco de cola clásico de la familia Coca-Cola.",
        en: { nombre: "Coca-Cola", descripcion: "Classic cola soft drink from the Coca-Cola family." } },
      { slug: "pepsi", nombre: "Pepsi", precio: 2.49, descripcion: "Refresco de cola de la familia Pepsi.",
        en: { nombre: "Pepsi", descripcion: "Cola soft drink from the Pepsi family." } },
      { slug: "7up", nombre: "7Up", precio: 2.49, descripcion: "Refresco de lima-limón de la familia Pepsi.",
        en: { nombre: "7Up", descripcion: "Lemon-lime soft drink from the Pepsi family." } },
    ],
  },
];

export const fotoProducto = (slug: string) => `/productos/${slug}.jpg`;

export const precioTexto = (precio: number) => `$${precio.toFixed(2)}`;

export const numeroCategoria = (indice: number) => String(indice + 1).padStart(2, "0");

/** Nombre y descripción del producto en el idioma pedido */
export const textoProducto = (p: Producto, idioma: Idioma) =>
  idioma === "en" ? p.en : { nombre: p.nombre, descripcion: p.descripcion };

export const nombreCategoria = (c: Categoria, idioma: Idioma) => (idioma === "en" ? c.nombreEn : c.nombre);

export function buscarProducto(slug: string) {
  for (let i = 0; i < CATEGORIAS.length; i++) {
    const categoria = CATEGORIAS[i];
    const producto = categoria.productos.find((p) => p.slug === slug);
    if (producto) return { producto, categoria, indiceCategoria: i };
  }
  return null;
}

// Colores de las tarjetas de producto, en orden: marrón, amarillo, rosa, marrón.
export const TONOS_TARJETA = [
  "bg-chocolate text-mantequilla",
  "bg-mantequilla",
  "bg-rosa text-white",
  "bg-chocolate text-mantequilla",
] as const;
