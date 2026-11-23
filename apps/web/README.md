# Hogar
Tareas del hogar, puntajes y aportes. React + Vite + TS + Tailwind 3, con `@joseparedesc/master-crud` (maestros) y `@joseparedesc/master-components` (selectores).

    npm install && cp .env.example .env.local && npm run dev

- **Datos del hogar**: sin `VITE_HOME_API_URL` viven en localStorage. Con ella, los maestros usan `createRestAdapter` (contrato: rutas `/members` y `/tasks` con list/get/create/PATCH/`/active`/`/references`/DELETE con 409 `{referencedBy}`; `id` string, fechas ISO). Asignaciones, notas y aportes siguen locales hasta que existan sus endpoints.
- **personal-finance**: botón de Google → `POST /api/auth/google` → JWT en sessionStorage. Cada aporte se envía como `POST /api/transactions` (`type: income`, `pocketId` opcional). Bolsillos desde `GET /api/pockets`. Requiere `CORS_ORIGIN` con el origen del front.
- **Roles**: el administrador asigna tareas, deja anotaciones (±puntos) y ve Maestros; solo el responsable marca su tarea como realizada. Puntaje = puntos de tareas hechas + anotaciones.
- Paquete de selectores: `@joseparedesc/master-components`.
