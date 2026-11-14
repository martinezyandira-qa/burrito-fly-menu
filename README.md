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
- [ ] El banner muestra la foto del local y el nombre "BURRITO FLY".
- [ ] "Explorar el menú" baja hasta "Nuestra carta".
- [ ] **Wi-Fi** abre una ventana desde abajo con la red `Restaurante-Clientes` y la contraseña `bienvenidos`.
- [ ] "Copiar contraseña" cambia a **"Copiada"** por 2 segundos y la contraseña queda copiada.
- [ ] La ventana del Wi-Fi se cierra con "Cerrar", tocando fuera o con la tecla `Esc`.
- [ ] **Déjanos una reseña** abre otra pestaña. (Hoy apunta a `#`, ver sección 4.)
- [ ] Los 4 bloques de categoría (con foto) bajan a su sección.
- [ ] La barra de categorías se queda fija arriba al bajar y marca sola la categoría que estás viendo.
- [ ] Están los 24 productos con su foto, nombre y precio.

**Página de producto**
- [ ] Al tocar un producto se abre su página: foto grande, nombre, precio, categoría y descripción.
- [ ] "Más de [categoría]" muestra los otros productos de esa categoría y lleva a ellos.
- [ ] **"Volver a la carta"** regresa a la carta, justo en el producto donde estabas.
- [ ] Una dirección que no existe (por ejemplo `/producto/xyz`) muestra "No encontramos esta página".

**En computadora**
- [ ] Con la ventana ancha, los productos se ven en 4 columnas y la página de producto en dos columnas (foto a la izquierda, datos a la derecha).

Lo que ya probé yo: la carta en celular (375 px) y en computadora (1280 px), el Wi-Fi con "Copiada", ir a una categoría, abrir un producto y volver a la carta. `npm run lint` y `npm run build` terminan sin errores.

---

## 3. Dónde cambiar las cosas

| Quiero cambiar… | Archivo |
|---|---|
| Nombre del restaurante, link de reseñas de Google, red y contraseña del Wi-Fi | `src/config.ts` |
| Productos, precios, descripciones y categorías | `src/data/menu.ts` |
| Fotos de productos | `public/productos/<slug>.jpg` (cuadradas, 800 × 800 px) |
| Foto del local | `public/local-burrito-fly.jpg` |
| Colores y tipografía | `src/app/globals.css` (bloque `@theme`) y `src/app/layout.tsx` |

**Para agregar un producto:** pon su foto en `public/productos/` con un nombre simple, sin espacios ni tildes (por ejemplo `nachos.jpg`). Luego agrégalo en `src/data/menu.ts` con ese mismo `slug` (`"nachos"`), su nombre, su precio y su descripción. Su página `/producto/nachos` se crea sola.

---

## 4. Pendiente

- **Link de reseñas de Google:** en `src/config.ts`, cambia `ENLACE_RESENAS_GOOGLE = "#"` por el link real.
- **Publicarlo en internet:** cuando quieras, se puede subir a un hosting (por ejemplo Vercel) y crear el QR para las mesas con la dirección final.

---

## 5. Cómo está organizado

```
src/
  app/
    layout.tsx                 Fuentes (Playfair Display + Poppins), idioma y título
    globals.css                Colores de la propuesta C y animaciones
    page.tsx                   La carta: banner, Wi-Fi, reseña, categorías y productos
    producto/[slug]/page.tsx   Página de cada producto (se crean las 24 al compilar)
    not-found.tsx              Página "No encontramos esta página"
  components/
    boton-wifi.tsx             Botón y ventana del Wi-Fi (copiar contraseña)
    barra-categorias.tsx       Barra fija de categorías que marca la sección visible
    tarjeta-producto.tsx       Tarjeta de producto (foto de tamaño fijo, nombre, precio)
    pie.tsx                    Cierre de la página con el nombre grande
    iconos.tsx                 Íconos en SVG y la "G" de Google
  config.ts                    Datos generales del restaurante
  data/menu.ts                 La carta completa
public/
  local-burrito-fly.jpg        Foto del local
  productos/                   Fotos de los 24 productos
```

### Comandos
| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm run build` | Compila la versión final |
| `npm start` | Corre la versión final (después de `npm run build`) |
| `npm run lint` | Revisa el código |
