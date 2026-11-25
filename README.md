# Homy (monorepo)
Tareas del hogar, puntajes y aportes. `apps/api` (NestJS + Prisma + PostgreSQL) y `apps/web` (React + Vite + Tailwind 3, con `@joseparedesc/master-crud` y `@joseparedesc/master-components`).

## Arranque
    npm install
    npm run db:up                                   # PostgreSQL en :5433
    cp apps/api/.env.example apps/api/.env          # editar JWT_SECRET y FINANCE_API_URL
    cp apps/web/.env.example apps/web/.env.local    # editar VITE_GOOGLE_CLIENT_ID
    npm run db:migrate -- --name init
    npm run dev:api & npm run dev:web

## Identidad y personal-finance
Login con Google en el front → `POST /api/auth/google` de Homy → reenvía el ID token a `POST /api/auth/google` de personal-finance. El `uid` que devuelve personal-finance se guarda en `Member.pfUid`, y su JWT viaja dentro del JWT de Homy para crear ingresos (`POST /api/transactions`) y leer bolsillos (`GET /api/pockets`) desde el servidor. Ambos servicios deben usar el **mismo Google Client ID**. `GET /api/finance/status` verifica conexión y que el `uid` de la sesión coincida con `/api/auth/me` de personal-finance.
El primer usuario en entrar es administrador; los siguientes entran como integrantes.

## Usuarios y acceso
- El administrador registra a cada integrante en **Maestros → Integrantes** con su **correo de Google** (el mismo de su cuenta de personal-finance).
- Al entrar con Google, Homy lo reconoce por ese correo y guarda su `uid` de personal-finance ("Cuenta: Vinculada"). Desde ahí puede entrar y **marcar como realizadas sus tareas asignadas** (solo el responsable puede hacerlo).
- Solo entran correos registrados. El primer usuario crea el hogar como administrador. `OPEN_REGISTRATION=true` en el API reabre el registro a cualquiera.
- Los aportes se envían a personal-finance **desde la cuenta de su titular**: si el administrador registra un aporte de otro integrante, queda pendiente hasta que ese integrante lo envíe.

## Puntos y penalizaciones
- Puntaje = puntos de tareas hechas + anotaciones del administrador (suman o restan) + penalizaciones.
- **Penalizar** (pestaña Puntajes, solo administrador): integrante, puntos a restar, motivo obligatorio y tarea relacionada opcional. Se pueden quitar.
- Las anotaciones con puntos negativos cuentan como penalización en el total restado de cada integrante.

## API de Homy (`/api`, Bearer JWT)
`/auth/google`, `/auth/me` · `/state` · `/members`, `/tasks` (contrato master-crud) · `/assignments`, `/assignments/:id/toggle`, `/assignments/:id/notes` · `/contributions`, `/contributions/:id/sync` · `/penalties` (POST, DELETE `/:id`), `/finance/status`, `/finance/pockets`.

## Deploy en Railway
Un proyecto con 3 servicios, todos con el repo completo como *Root Directory* (déjalo en `/`):
1. **PostgreSQL** (plugin de Railway).
2. **api** → *Settings → Config file path*: `/apps/api/railway.json`. Variables:
   `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET` (largo, aleatorio), `JWT_EXPIRES_IN` (igual o menor al de personal-finance), `CORS_ORIGIN=https://<dominio-web>`, `FINANCE_API_URL=https://<dominio-personal-finance>` (o su URL privada `http://<servicio>.railway.internal:<puerto>`). Al arrancar ejecuta `prisma migrate deploy`.
3. **web** → *Config file path*: `/apps/web/railway.json`. Variables (se usan en build): `VITE_API_URL=https://<dominio-api>`, `VITE_GOOGLE_CLIENT_ID`.
4. En Google Cloud Console, agrega el dominio de **web** a *Authorized JavaScript origins* del mismo Client ID que usa personal-finance.
5. Genera dominios públicos para api y web; el orden recomendado es api → web (para conocer `VITE_API_URL`) y luego volver a poner `CORS_ORIGIN` en api.
