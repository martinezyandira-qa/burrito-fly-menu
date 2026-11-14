// Datos de la carta de Burrito Fly.
// Para agregar o cambiar un producto: edita esta lista y pon su foto en /public/productos/<slug>.jpg

export type Producto = {
  slug: string;
  nombre: string;
  precio: number;
  descripcion: string;
};

export type Categoria = {
  slug: string;
  nombre: string;
  /** slug del producto cuya foto representa a la categoría */
  imagen: string;
  productos: Producto[];
};

export const CATEGORIAS: Categoria[] = [
  {
    slug: "platos-fuertes",
    nombre: "Platos fuertes",
    imagen: "burrito",
    productos: [
      { slug: "hamburguesa-tocineta", nombre: "Hamburguesa con tocineta", precio: 10.99, descripcion: "Jugosa carne a la parrilla con queso cheddar derretido, tocineta crujiente, lechuga y tomate en pan brioche con ajonjolí." },
      { slug: "pizza-pepperoni", nombre: "Pizza de pepperoni", precio: 12.99, descripcion: "Masa horneada con bordes dorados, salsa de tomate, abundante queso mozzarella y pepperoni." },
      { slug: "pollo-frito", nombre: "Pollo frito (3 piezas)", precio: 8.99, descripcion: "Piezas de pollo marinado con empanizado dorado y crujiente, jugosas por dentro." },
      { slug: "burrito", nombre: "Burrito", precio: 8.99, descripcion: "Tortilla de harina rellena de carne sazonada, arroz rojo, frijoles negros y queso fundido." },
      { slug: "tacos", nombre: "Tacos (3)", precio: 7.99, descripcion: "Tortillas de maíz con carne asada, cebolla y cilantro frescos, servidos con limón." },
      { slug: "quesadilla", nombre: "Quesadilla", precio: 7.49, descripcion: "Tortilla dorada rellena de pollo deshebrado y queso derretido, acompañada de guacamole y crema." },
      { slug: "sandwich-club", nombre: "Sándwich club", precio: 7.49, descripcion: "Pan tostado en capas con pavo, tocineta, queso cheddar, lechuga, tomate y mayonesa." },
      { slug: "ensalada-cesar", nombre: "Ensalada César", precio: 8.49, descripcion: "Lechuga romana con pechuga de pollo a la parrilla, crutones, queso parmesano y aderezo César." },
      { slug: "perro-caliente", nombre: "Perro caliente", precio: 4.99, descripcion: "Salchicha a la parrilla en pan suave con kétchup, mostaza y cebolla picada." },
    ],
  },
  {
    slug: "entradas",
    nombre: "Entradas y acompañantes",
    imagen: "alitas-bbq",
    productos: [
      { slug: "alitas-bbq", nombre: "Alitas BBQ", precio: 9.99, descripcion: "Alitas de pollo bañadas en salsa BBQ ahumada y glaseada, con bastones de apio y zanahoria." },
      { slug: "chicken-tenders", nombre: "Chicken tenders", precio: 7.99, descripcion: "Tiras de pechuga de pollo empanizadas y crujientes, con salsa de miel y mostaza." },
      { slug: "nuggets", nombre: "Nuggets (10)", precio: 6.49, descripcion: "Diez trocitos de pollo empanizados, dorados y crujientes. Ideales para compartir o para los niños." },
      { slug: "empanadas", nombre: "Empanadas (3)", precio: 5.49, descripcion: "Empanadas fritas de masa crujiente rellenas de carne molida sazonada, con salsa chimichurri." },
      { slug: "papas-fritas", nombre: "Papas fritas", precio: 3.99, descripcion: "Papas doradas, crujientes por fuera y suaves por dentro, con un toque de sal." },
    ],
  },
  {
    slug: "postres",
    nombre: "Postres",
    imagen: "brownie-helado",
    productos: [
      { slug: "brownie-helado", nombre: "Brownie con helado", precio: 5.99, descripcion: "Brownie de chocolate tibio con una bola de helado de vainilla y salsa de chocolate." },
      { slug: "cheesecake", nombre: "Cheesecake", precio: 5.49, descripcion: "Rebanada de pastel de queso cremoso sobre base de galleta, con salsa de fresa y una fresa entera." },
      { slug: "donas", nombre: "Donas (3)", precio: 4.49, descripcion: "Tres donas esponjosas: glaseada clásica, cubierta de chocolate y rosa con chispas de colores." },
    ],
  },
  {
    slug: "bebidas",
    nombre: "Bebidas",
    imagen: "batido-fresa",
    productos: [
      { slug: "batido-fresa", nombre: "Batido de fresa", precio: 4.99, descripcion: "Batido cremoso de fresa con crema batida y una fresa fresca encima." },
      { slug: "cafe-latte", nombre: "Café latte", precio: 3.49, descripcion: "Espresso con leche cremosa al vapor y arte latte en la espuma." },
      { slug: "limonada", nombre: "Limonada", precio: 2.99, descripcion: "Limonada natural y refrescante con hielo, rodajas de limón y hojas de hierbabuena." },
      { slug: "jugo-naranja", nombre: "Jugo de naranja", precio: 3.49, descripcion: "Jugo de naranja natural, recién exprimido." },
      { slug: "coca-cola", nombre: "Coca-Cola", precio: 2.49, descripcion: "Refresco de cola clásico de la familia Coca-Cola." },
      { slug: "pepsi", nombre: "Pepsi", precio: 2.49, descripcion: "Refresco de cola de la familia Pepsi." },
      { slug: "7up", nombre: "7Up", precio: 2.49, descripcion: "Refresco de lima-limón de la familia Pepsi." },
    ],
  },
];

export const fotoProducto = (slug: string) => `/productos/${slug}.jpg`;

export const precioTexto = (precio: number) => `$${precio.toFixed(2)}`;

export const numeroCategoria = (indice: number) => String(indice + 1).padStart(2, "0");

export function buscarProducto(slug: string) {
  for (let i = 0; i < CATEGORIAS.length; i++) {
    const categoria = CATEGORIAS[i];
    const producto = categoria.productos.find((p) => p.slug === slug);
    if (producto) return { producto, categoria, indiceCategoria: i };
  }
  return null;
}

// Colores de las tarjetas de producto, en orden: gris, amarillo, azul, gris.
export const TONOS_TARJETA = ["bg-gris", "bg-mantequilla", "bg-cielo", "bg-gris"] as const;
