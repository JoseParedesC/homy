# Pendiente de esta sesión

## Sin verificar (nada se ejecutó)
- [ ] `npm install`, `prisma migrate dev`, `nest build` y `tsc` del front: el código no se compiló ni se probó contra PostgreSQL.
- [ ] Comunicación real con personal-finance: está implementada (login delegado, `/finance/status`, ingresos y bolsillos), pero no se probó contra una instancia. Confirmar la forma de la respuesta de `GET /api/auth/me` (se asume `uid` o `id`) y de `POST /api/transactions` (se asume `id`).
- [ ] Validar que el Client ID de Google sea el mismo en Homy (front) y en personal-finance (`GOOGLE_CLIENT_ID`).

## Por implementar
- [ ] **Coincidencia estricta con un usuario existente en personal-finance:** su README no ofrece un endpoint de "existe este usuario" sin crearlo; `POST /api/auth/google` crea el usuario si no existe. Hoy la coincidencia queda garantizada por el `uid` que devuelve personal-finance, pero no se bloquea a quien no existía. Requiere un endpoint nuevo allá (p. ej. consulta por email).
- [ ] Migraciones versionadas de Prisma (`prisma/migrations`) y seed (tareas de ejemplo).
- [ ] Multi-hogar: hoy todos los usuarios comparten un único hogar.
- [ ] Gestión de roles: cambiar admin/integrante, impedir desactivar al último administrador.
- [ ] Tokens: el JWT de personal-finance expira por su cuenta; falta renovarlo o cerrar sesión de forma guiada.
- [ ] Pruebas (API y front), filtros por rango de fechas en tareas y aportes, y paginación en servidor.
- [ ] Revisar con navegador el estilo, las animaciones y el selector (teclado, Esc, paginación).
- [ ] Despliegue (Railway/Docker) y CORS de producción.
