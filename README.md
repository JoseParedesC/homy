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

## API de Homy (`/api`, Bearer JWT)
`/auth/google`, `/auth/me` · `/state` · `/members`, `/tasks` (contrato master-crud) · `/assignments`, `/assignments/:id/toggle`, `/assignments/:id/notes` · `/contributions`, `/contributions/:id/sync` · `/finance/status`, `/finance/pockets`.
