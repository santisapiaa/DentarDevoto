# Dentar Devoto — Web App

Proyecto full-stack: **React (Vite)** en el frontend, **Node.js + Express** en el backend, **PostgreSQL** como base de datos.

## Estructura

```
consultorio/
  frontend/    -> sitio público + panel admin (React)
  backend/     -> API REST (Express)
```

## 1. Base de datos

Con PostgreSQL instalado localmente:

```bash
createdb consultorio
psql consultorio < backend/src/db/schema.sql
```

Después de correr el schema (que ya deja cargados los 10 tratamientos y los 2 profesionales reales), creá el primer usuario admin con:

```bash
cd backend
npm run crear-admin -- tu-correo@ejemplo.com unaContraseñaSegura admin
```

Desde ahí, ese usuario puede crear el resto del staff en `/admin/usuarios`.

## 2. Backend

```bash
cd backend
cp .env.example .env   # completar DATABASE_URL y JWT_SECRET
npm install
npm run dev
```

Corre en `http://localhost:4000`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173` y ya tiene configurado el proxy hacia `/api` -> `localhost:4000`.

## Qué está armado

- Sitio público: Home, Servicios y Profesionales conectados a la API real (`/api/servicios`, `/api/profesionales`), Contacto con dirección y mapa reales.
- Botón flotante y CTAs de WhatsApp, con el número centralizado en `frontend/src/lib/whatsapp.js` (un solo lugar para cambiarlo).
- Login de staff contra la API (`/api/auth/login`) con JWT, con límite de intentos (rate limiting) para frenar fuerza bruta.
- `/admin` protegido por un guard real en el frontend (`RequireAuth`) — ya no se puede entrar sin loguearse.
- Panel admin con Pacientes, Turnos, Servicios y Usuarios, todos conectados a la API real (alta, edición y baja donde corresponde).
- Backend con `helmet`, CORS restringido al origen del frontend, y todas las rutas de escritura protegidas con JWT (antes `POST /api/servicios` estaba sin proteger).
- Alta de usuarios de staff desde `/admin/usuarios`, restringida a rol `admin` (antes solo se podía por SQL a mano).

## Pendiente / a definir con Santiago

- Campos reales del fichero de pacientes (historia clínica, tratamientos, etc.) — hoy la tabla `pacientes` tiene solo lo básico.
- Confirmar si 011-3970-5956 tiene WhatsApp activo, o conseguir un número de WhatsApp dedicado para la sucursal (hoy los CTAs apuntan a ese número).
- Fotos reales de los profesionales (Dr. Mariano Sapia, Dra. María Laura Perazzi) y del consultorio — hoy la imagen del hero es un placeholder con los colores del logo.
- Matrícula (MN) y universidad de cada profesional para sumar en `/profesionales`.
- Todavía no hay tests automatizados ni control de versiones (`git init`) — recomendado antes de seguir sumando features.
