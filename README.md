# Aliados QR

Red de colaboradores en forma de pirámide: invitante e invitados bien ubicados mediante enlaces y QR.

- **Frontend:** SvelteKit + Tailwind (paleta change and code: neón #EEFF00, negro, naranja #FFA500, azul #6A5ACD).
- **Backend:** Node.js (Express), ES modules.

## Cómo correr

```bash
# Terminal 1 – API
cd backend && npm run dev

# Terminal 2 – Web
cd frontend && npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:3001

## Flujo

1. **Inicio** (`/`): "Crear mi red" (primer impulsor) o "Mi Red".
2. **Crear mi red** (`/crear-red`): formulario sin referente → obtienes tu enlace `/r/CODIGO`.
3. **Entrar por enlace/QR** (`/r/:codigo`): se muestra el nombre del referente y opciones IMPULSA / ÚNETE.
4. **Registro** (`/r/:codigo/registro?rol=impulsa|unete`): mismo formulario; borde naranja (IMPULSA) o amarillo (ÚNETE). Botón "CREAR USUARIO".

La API expone: `GET /api/referente/:codigo`, `POST /api/usuarios`, `GET /api/usuarios/:id/red`. Los datos están en memoria; sustituir por base de datos cuando corresponda.
