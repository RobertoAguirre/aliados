## Funcionalidades implementadas

- **Modelo de red e invitaciones**
  - Registro de usuarios con datos personales, dirección y ubicación (`lat`/`lng`) en **MongoDB Atlas**.
  - Campos de relación: `invitanteId`, `rol` (`impulsa` / `unete`), `codigo` único por usuario.
  - Endpoints backend:
    - `GET /api/referente/:codigo` (obtiene nombre y código del referente).
    - `POST /api/usuarios` (crea usuario, resuelve `invitanteId` por `invitanteCodigo`).
    - `GET /api/usuarios/by-codigo/:codigo` (obtiene usuario por código).
    - `GET /api/usuarios/:id` (detalle de usuario).
    - `GET /api/usuarios/:id/red` (usuario + lista de invitados directos).

- **Frontend y flujo principal**
  - Inicio (`/`):
    - Botones **“Crear mi red”** (`/crear-red`) y **“Mi Red”** (`/mi-red`).
    - Estilo con Tailwind y paleta de colores tipo change and code.
  - Crear mi red (`/crear-red`):
    - Formulario completo (nombre, apellidos, teléfono, fecha nacimiento, dirección, mapa).
    - Registro como `rol = impulsa`.
    - Tras crear, muestra nombre, código y enlace `/r/CODIGO` para compartir.
  - Pantalla de referente (`/r/[codigo]`):
    - Consulta API para obtener nombre del referente.
    - Layout IMPULSA (naranja) / ÚNETE (blanco) con textos:
      - “CONSTRUYE TU PROPIA RED EN APOYO A: [referente]”
      - “ÚNETE A LA RED DE: [referente]”.
  - Registro desde enlace (`/r/[codigo]/registro?rol=impulsa|unete`):
    - Mismo formulario de registro que en la guía.
    - Borde naranja si `IMPULSA`, amarillo si `ÚNETE`.
    - Guardado en MongoDB con `invitanteCodigo = codigo`.
    - Pantalla de éxito:
      - IMPULSA: muestra enlace `/r/CODIGO` para seguir invitando.
      - ÚNETE: confirma que se unió a la red.
  - Mi Red (`/mi-red`):
    - Input para escribir **código personal**.
    - Consulta backend por código y luego por red (`/api/usuarios/:id/red`).
    - Muestra:
      - Datos del usuario (nombre y código).
      - Enlace `/r/CODIGO`.
      - Lista de invitados con nombre y rol, o mensaje de que aún no hay invitados.

- **Mapa en formularios (Leaflet + OpenStreetMap)**
  - Componente reusable `LeafletMap`:
    - Mapa interactivo con teselas de OpenStreetMap.
    - Marcador draggable y actualización de coordenadas al hacer clic.
    - `bind:lat` y `bind:lng` para sincronizar con el formulario.
  - Integración:
    - `/crear-red`: mapa compacto bajo DIRECCIÓN.
    - `/r/[codigo]/registro`: mapa más alto, imitando la guía de usuario.

- **Infraestructura**
  - Backend Node.js con Express, CORS, ES modules.
  - Conexión a MongoDB Atlas centralizada en `db.js`, con índices en `codigo` e `invitanteId`.
  - Frontend SvelteKit con Tailwind v4 y Vite, proxy `/api` → backend.

## Funcionalidades pendientes (según guía de usuario)

- **QR para invitaciones**
  - Generar imagen de QR (por ejemplo con una librería en el frontend) a partir del enlace `/r/CODIGO`.
  - Mostrar QR en:
    - Pantalla de éxito tras registro como IMPULSOR.
    - Pantalla **Mi Red** (para que el usuario pueda reenviar su QR).

- **Botón de compartir (WhatsApp)**
  - Botón tipo “COMPARTIR” con icono de WhatsApp debajo del QR.
  - Acciones:
    - Abrir WhatsApp (web/móvil) con mensaje prellenado: textos como “ÚNETE A MI RED”, “Red de [nombre]”, enlace `/r/CODIGO`.
  - Ubicaciones:
    - Pantalla de éxito de IMPULSA.
    - Pantalla **Mi Red**.

- **Guía de usuario dentro de la app**
  - Enlace o sección “Guía de Usuario” accesible desde la pantalla inicial.
  - Contenido mínimo:
    - Explicación de IMPULSA vs ÚNETE.
    - Pasos para registrarse.
    - Cómo compartir QR / enlace.
    - Cómo consultar “Mi Red”.

- **Textos y microcopy alineados a la guía**
  - Ajustar mensajes para acercarlos al copy original (por ejemplo, textos bajo IMPULSA/ÚNETE, recomendaciones).
  - Añadir en **Mi Red** la recomendación: “Te recomendamos que te envíes tu QR a tu propio WhatsApp para tenerlo accesible.”

- **Mejoras futuras (no críticas para replica básica)**
  - Visualización más rica de la red (árbol, niveles, métricas).
  - Paginación / búsqueda en listas grandes de invitados.
  - Manejo de sesiones / autenticación ligera si se requiere persistir login.

