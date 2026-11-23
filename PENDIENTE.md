# Pendiente

## Hecho en esta sesión
- [x] Frontend verificado: `tsc --noEmit` sin errores.
- [x] Migración inicial de Prisma (`apps/api/prisma/migrations/20261123000000_init`).
- [x] Despliegue en Railway: Dockerfiles y `railway.json` para `api` y `web`, healthcheck `/api/health`, migraciones automáticas al arrancar, guía en el README.
- [x] Protección del último administrador activo (no se puede quitar rol, desactivar ni borrar).
- [x] Sesión de personal-finance expirada → 401 → el front cierra sesión y pide login.
- [x] CORS cerrado por defecto (solo `CORS_ORIGIN`).

## Sin verificar (revisar en el primer deploy)
- [ ] El API no se pudo compilar completo aquí: la sandbox no puede descargar los binarios de Prisma, así que `prisma generate` no corrió. Solo quedaban errores atribuibles al cliente sin generar. Correr `npm install && npm -w apps/api run build` en tu máquina.
- [ ] La migración SQL está escrita a mano. Comprobar que no haya diferencias: `npx prisma migrate diff --from-migrations apps/api/prisma/migrations --to-schema-datamodel apps/api/prisma/schema.prisma --shadow-database-url <url>`.
- [ ] Los Dockerfiles no se construyeron (no hay Docker aquí). Si `npm ci -w` falla, revisar que `package-lock.json` esté en el repo.
- [ ] Comunicación real con personal-finance: confirmar la forma de `GET /api/auth/me` (se asume `uid` o `id`) y de `POST /api/transactions` (se asume `id`).
- [ ] Mismo Google Client ID en Homy (front) y personal-finance (`GOOGLE_CLIENT_ID`), y dominio de `web` en *Authorized JavaScript origins*.
- [ ] Revisar en navegador estilo, animaciones y el selector (teclado, Esc, paginación).

## Por implementar
- [ ] **Coincidencia estricta con un usuario preexistente en personal-finance:** su `POST /api/auth/google` crea al usuario si no existe y no hay endpoint de consulta. Hoy la identidad queda enlazada por el `uid` que devuelve personal-finance, pero no se bloquea a quien no existía. Requiere un endpoint nuevo allá (p. ej. consulta por email) o una lista de correos permitidos en Homy.
- [ ] Multi-hogar: hoy todos los usuarios comparten un único hogar (el primero en entrar es admin).
- [ ] Gestión de roles desde la UI con confirmación; invitar integrantes por correo.
- [ ] Renovación del token de personal-finance sin volver a hacer login.
- [ ] Seed de tareas de ejemplo.
- [ ] Pruebas (API y front), filtros por fecha, paginación en servidor.
