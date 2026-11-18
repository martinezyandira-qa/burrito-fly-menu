# Burrito Fly · Menú digital

Menú digital de Burrito Fly hecho con **Next.js 16 (App Router)** y **Tailwind CSS v4**, con el diseño de la propuesta C (Bento).
No usa librerías extra: solo Next.js, React y Tailwind.

---

## 1. Probarlo en tu computadora (localhost)

### Lo que necesitas
- **Node.js 20.9 o más nuevo.** Para ver tu versión: `node -v`. Si no lo tienes, descárgalo de nodejs.org (versión LTS).

### Pasos
1. Abre una terminal en esta carpeta (`burrito-fly-menu`).
2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre en el navegador: **http://localhost:3000**
5. Para verlo como en un celular: en Chrome presiona `F12` y luego `Ctrl + Shift + M`, y elige un teléfono (por ejemplo iPhone 12 Pro, 390 px).
6. Para apagar el servidor: en la terminal presiona `Ctrl + C`.

Mientras `npm run dev` está corriendo, cada cambio que guardes se ve al instante en el navegador.

### Probarlo en tu celular (misma red Wi-Fi)
El modo de desarrollo bloquea por seguridad las conexiones desde otros aparatos, así que para el celular usa la versión final:
```bash
npm run build
npm start
```
La terminal muestra una línea **Network**, por ejemplo `http://192.168.1.75:3000`. Escribe esa dirección en el navegador del celular (conectado al mismo Wi-Fi que la computadora).
Si Windows pregunta si permite el acceso a Node.js en la red, elige **Redes privadas** y acepta.

---

## 2. Qué revisar (lista de prueba)

**Carta (página principal)**
- [ ] El banner muestra la foto del local y el logo de Burrito Fly.
- [ ] Los botones **Español** / **English** cambian el idioma de toda la carta (el activo se ve rosa con ✓). En inglés la dirección es `/en`.
- [ ] **Wi-Fi** abre una ventana desde abajo con la red `Restaurante-Clientes` y la contraseña `bienvenidos`.
- [ ] "Copiar contraseña" cambia a **"Copiada"** por 2 segundos y la contraseña queda copiada.
- [ ] La ventana del Wi-Fi se cierra con "Cerrar", tocando fuera o con la tecla `Esc`.
- [ ] **Déjanos una reseña** abre en otra pestaña la ventana de Google para escribir una reseña de Burrito Fly (Google pide iniciar sesión).
- [ ] Los 4 bloques de categoría (con foto) bajan a su sección.
- [ ] La barra de categorías se queda fija arriba al bajar y marca sola la categoría que estás viendo.
- [ ] Están los 24 productos con su foto, nombre y precio.

**Página de producto**
- [ ] Al tocar un producto se abre su página: foto grande, nombre, precio, categoría y descripción.
- [ ] "Más de [categoría]" muestra los otros productos de esa categoría y lleva a ellos.
- [ ] **"Volver a la carta"** regresa a la carta, justo en el producto donde estabas.
- [ ] Una dirección que no existe (por ejemplo `/producto/xyz`) muestra "No encontramos esta página".
- [ ] En inglés, el producto se abre en `/en/product/…` y "Back to menu" regresa a `/en`.

**En computadora**
- [ ] Con la ventana ancha, los productos se ven en 4 columnas y la página de producto en dos columnas (foto a la izquierda, datos a la derecha).

Lo que ya probé yo: la carta en celular (375 px) y en computadora (1280 px), el Wi-Fi con "Copiada", ir a una categoría, abrir un producto y volver a la carta. `npm run lint` y `npm run build` terminan sin errores.

---

## 3. Dónde cambiar las cosas

| Quiero cambiar… | Archivo |
|---|---|
| Nombre del restaurante, link de reseñas de Google, red y contraseña del Wi-Fi | `src/config.ts` |
| Productos, precios, descripciones y categorías (español e inglés) | `src/data/menu.ts` |
| Textos de botones y títulos en español e inglés | `src/i18n.ts` |
| Fotos de productos | `public/productos/<slug>.jpg` (cuadradas, 800 × 800 px) |
| Foto del local | `public/local-burrito-fly.jpg` |
| Logo | `public/logo-burrito-fly.svg` |
| Colores y tipografía | `src/app/globals.css` (bloque `@theme`) y `src/app/layout.tsx` |

**Para agregar un producto:** pon su foto en `public/productos/` con un nombre simple, sin espacios ni tildes (por ejemplo `nachos.jpg`). Luego agrégalo en `src/data/menu.ts` con ese mismo `slug` (`"nachos"`), su nombre, su precio, su descripción y su versión en inglés (`en: { nombre, descripcion }`). Sus páginas `/producto/nachos` y `/en/product/nachos` se crean solas.

---

## 4. Pendiente

- **QR para las mesas:** crearlo con la dirección publicada, https://burrito-fly-menu.vercel.app (en inglés: https://burrito-fly-menu.vercel.app/en).

### Publicación
El menú está en Vercel, en el proyecto `burrito-fly-menu`, conectado al repositorio de GitHub. Cada vez que se sube un cambio a la rama `main` (`git push`), Vercel vuelve a publicar la página solo, en uno o dos minutos.

### Base de datos (Supabase)
Los platillos y categorías viven en Supabase, en las tablas `categories` y `menu_items`.
- `supabase/schema.sql` crea las tablas y la seguridad (RLS): cualquiera puede **leer** las categorías y los platillos con `available = true`; nadie puede escribir con la llave pública.
- `supabase/seed.sql` carga las 4 categorías y 24 platillos originales (se puede volver a correr sin duplicar).
- La app lee con `obtenerCarta()` en `src/data/menu.ts`, guardado en caché: un cambio en Supabase se ve en el menú en uno o dos minutos.
- Variables necesarias (en `.env.local` y en Vercel → Settings → Environment Variables): `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Panel de administrador (`/admin`)
- Entrada en `/admin/login` con correo y contraseña (Supabase Auth). No hay registro: los usuarios se crean en Supabase → Authentication.
- `src/proxy.ts` protege todo `/admin` (sin sesión → login). Además, cada página y cada acción comprueba que el usuario esté en la tabla `admins`.
- `supabase/admin.sql` crea la tabla `admins`, la función `is_admin()`, las reglas para que solo los admins escriban, y el bucket público `menu-images` (solo admins suben y borran). Al final tiene la línea para agregar tu correo como admin.
- Platillos: lista por categoría, crear, editar, borrar (con confirmación) e interruptor Disponible/Agotado. Las fotos se achican en el navegador y se suben a Storage.
- Categorías: crear, editar, borrar (solo si no tienen platillos) y cambiar el orden con flechas.
- Al guardar, el panel borra la caché del menú (`updateTag("menu")`), así el menú público muestra el cambio de inmediato, sin volver a publicar.
- Nunca se usa la llave `service_role`: todo se escribe con la sesión del admin y la llave pública, y RLS decide.

### Pedidos
- Carrito: botón "Agregar" en cada platillo, cantidades, nota por platillo y botón flotante. Se guarda en `localStorage` (`src/lib/carrito.ts`).
- `/pedido` y `/en/order`: resumen, nombre, teléfono (10 dígitos), para recoger o a domicilio (con dirección), notas y confirmación con número de pedido.
- `supabase/pedidos.sql` crea `orders` (número desde #1001) y `order_items` (nombre y precio al momento del pedido), y la función `create_order`.
- **Precios y total los calcula Supabase** leyendo `menu_items`; el navegador solo manda id, cantidad y nota. Rechaza platillos inexistentes o agotados, cantidades fuera de 1–20, y avisa si los precios cambiaron.
- RLS: el público no puede leer, crear directo, editar ni borrar pedidos; solo los admins.
- Anti-spam: campo oculto (honeypot), mínimo 3 segundos para enviar y máximo 3 pedidos por teléfono cada 10 minutos.
- Panel: `/admin/pedidos` con los más nuevos primero y actualización automática cada 30 segundos. Cada pedido nuevo se **acepta** o se **rechaza**; después avanza Preparando → Listo → Entregado, o se cancela. Rechazar y cancelar piden un motivo opcional para el cliente. Los pasos permitidos están en `src/lib/estados-pedido.ts`.
- Avisos por Telegram (`src/lib/telegram.ts`, solo servidor): con cada pedido guardado llega un mensaje con número, cliente, tipo, dirección, platillos, total, notas y enlace al pedido en el panel. Se envía después de responder al cliente; si Telegram falla, el pedido no se afecta y solo queda un error `[telegram]` en la consola del servidor. Lo escrito por el cliente se escapa (`&`, `<`, `>`). Variables (solo servidor, sin `NEXT_PUBLIC`): `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`. Para probar: botón "Enviar mensaje de prueba a Telegram" en `/admin/pedidos`.
- Seguimiento del cliente: al pedir, su navegador guarda una clave secreta del pedido (`tracking_token`). Con ella, la función `order_status` le devuelve solo número, estado, motivo y tipo (nunca nombre, teléfono, dirección, platillos ni total). El número de pedido no sirve para consultar: no hay ninguna página con el número en la URL. La tarjeta aparece en la confirmación y arriba del menú, y se actualiza cada 15 segundos (`src/components/carrito/seguimiento-pedidos.tsx`).

---

## 5. Cómo está organizado

```
src/
  app/
    layout.tsx                 Fuentes (Bebas Neue + Poppins), idioma y título
    globals.css                Colores de la propuesta C y animaciones
    page.tsx                   La carta en español (/)
    producto/[slug]/page.tsx   Producto en español (/producto/…; se crean las 24 al compilar)
    not-found.tsx              Página "No encontramos esta página"
    en/                        Las mismas páginas en inglés (/en y /en/product/…)
  components/
    carta.tsx                  La carta: banner, idioma, Wi-Fi, reseña, categorías y productos
    pagina-producto.tsx        Página de producto (foto, precio, descripción, "Más de…")
    boton-wifi.tsx             Botón y ventana del Wi-Fi (copiar contraseña)
    barra-categorias.tsx       Barra fija de categorías que marca la sección visible
    tarjeta-producto.tsx       Tarjeta de producto (foto de tamaño fijo, nombre, precio)
    pie.tsx                    Cierre de la página con el logo
    iconos.tsx                 Íconos en SVG y la "G" de Google
  config.ts                    Datos generales del restaurante
  i18n.ts                      Textos de la interfaz en español e inglés
  data/menu.ts                 Lee la carta desde Supabase (obtenerCarta) y sus ayudas
  lib/supabase.ts              Conexión pública con Supabase (menú, en caché)
  lib/supabase-servidor.ts     Conexión con la sesión del admin (panel)
  lib/supabase-navegador.ts    Conexión desde el navegador (subir fotos)
  lib/admin.ts                 Revisión de permisos y lectura de datos del panel
  proxy.ts                     Protege /admin (redirige al login si no hay sesión)
  app/admin/                   Panel: login, platillos, categorías y acciones (acciones.ts)
  components/admin/            Formularios, interruptor y botón de borrar del panel
supabase/
  schema.sql                   Tablas, índice y seguridad (RLS)
  seed.sql                     Los 24 platillos originales
  admin.sql                    Tabla admins, reglas de escritura y bucket de fotos
  pedidos.sql                  Tablas de pedidos, RLS y función create_order
public/
  local-burrito-fly.jpg        Foto del local
  logo-burrito-fly.svg         Logo (pie de página)
  logo-burrito-fly-claro.svg   Logo con "Sazón Mexicana" en blanco (banner)
  iphone.html                  Vista de la app dentro de un iPhone
  productos/                   Fotos de los 24 productos
```

### Comandos
| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compila la versión final |
| `npm start` | Corre la versión final (después de `npm run build`) |
| `npm run lint` | Revisa el código |
