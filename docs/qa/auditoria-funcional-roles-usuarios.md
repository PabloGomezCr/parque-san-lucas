# Auditoría funcional y guía QA: roles, usuarios y credenciales

**Proyecto:** Monitoreo de Parques Nacionales · Parque Nacional Isla San Lucas  
**Fecha de auditoría:** 2026-10-06  
**Alcance:** estado leído de `db.json`, autenticación, RBAC, rutas, servicios, pruebas, branding, tema y scripts del proyecto.

> Esta guía distingue el comportamiento que existe en el código de los escenarios que solo son propuestas de prueba. Los usuarios y contraseñas de la sección 5 se leyeron directamente de `db.json`. No se agregaron usuarios ni se modificó la base durante esta auditoría.

## 1. Estado general

La aplicación React/Vite tiene autenticación local mock, autorización por permisos y persistencia temporal con JSON Server. La interfaz filtra navegación y acciones; los servicios vuelven a consultar al actor activo y comprueban permiso y parque. Esto es una defensa de demostración en el cliente: JSON Server no impone autorización y sus endpoints pueden invocarse directamente.

Existen seis roles en el código: `MASTER_ADMIN`, `ADMIN`, `PARK_RANGER`, `TOUR_GUIDE`, `READ_ONLY` y el rol heredado `Supervisor`. `TOUR_GUIDE` y `READ_ONLY` tienen fixtures y pruebas, pero no usuarios correspondientes en `db.json`; no se puede iniciar sesión como ellos hasta crear cuentas locales.

**Trazabilidad del cambio:** el workspace no contiene metadata Git (`git rev-parse --is-inside-work-tree` falla con `not a git repository`). Por eso no es posible certificar una lista exacta de archivos distintos de una revisión base. Las tablas de cambios abajo identifican los archivos que actualmente implementan cada módulo; [branding-changed-files.md](../branding-changed-files.md) es un manifiesto de branding existente, no sustituye una diff Git completa.

## 2. Cambios implementados

| Módulo | Archivo | Cambio/objetivo | Estado |
| --- | --- | --- | --- |
| Autenticación | [LoginPage.jsx](../../src/pages/auth/LoginPage.jsx), [authService.js](../../src/services/authService.js), [AuthContext.jsx](../../src/context/AuthContext.jsx) | Login contra `users`, sesión en almacenamiento local, cierre y regreso al destino solicitado. `safeUser` elimina `password` de la sesión. | Mock implementado |
| Autorización | [roles.js](../../src/config/roles.js), [permissions.js](../../src/config/permissions.js) | Roles como conjuntos de permisos, permisos base/opcionales, validación de usuario activo y parque. | Implementado en Front-End |
| Navegación/rutas | [navigation.js](../../src/config/navigation.js), [ProtectedRoute.jsx](../../src/routes/ProtectedRoute.jsx), [AppRoutes.jsx](../../src/routes/AppRoutes.jsx) | Menú filtrado por permisos, rutas protegidas, rutas no encontradas y vistas compartidas por sección/permisos. | Implementado |
| Usuarios | [userService.js](../../src/services/userService.js), [UserManagement.jsx](../../src/components/admin/UserManagement.jsx) | Consulta/creación/edición de usuarios, asignación de roles y opcionales con validación de parque e historial. | Mock implementado; solo Maestro administra roles |
| Delegación | [delegationService.js](../../src/services/delegationService.js), [DelegationPanel.jsx](../../src/components/admin/DelegationPanel.jsx), [DelegationSummary.jsx](../../src/components/admin/DelegationSummary.jsx) | Delegar y reasignar tareas/mantenimiento, elegir usuarios activos del parque y conservar `assignedToUserId`, `assignedByUserId`, `delegatedAt` e historial. | Implementado en cliente |
| Tareas | [taskService.js](../../src/services/taskService.js), [RecordForm.jsx](../../src/components/records/RecordForm.jsx), [RecordDetail.jsx](../../src/components/records/RecordDetail.jsx) | CRUD controlado por permisos, estados, detalle, delegación y referencia a incidencias. | Implementado con JSON Server |
| Mantenimiento | [maintenanceService.js](../../src/services/maintenanceService.js), [MaintenancePage.jsx](../../src/pages/maintenance/MaintenancePage.jsx) | Consulta, creación/edición y delegación/reasignación según permisos. | Implementado con JSON Server |
| Guía turístico | [GuideDashboardPage.jsx](../../src/pages/dashboard/GuideDashboardPage.jsx), [tourService.js](../../src/services/tourService.js), [visitorGroupService.js](../../src/services/visitorGroupService.js), [parkInfoService.js](../../src/services/parkInfoService.js), [incidentService.js](../../src/services/incidentService.js) | Dashboard de guía, recorridos, grupos con datos mínimos, reportes propios y referencias del parque. | Implementado mock; sin cuenta sembrada |
| Chat | [chatService.js](../../src/services/chatService.js), [chatRepository.js](../../src/repositories/chatRepository.js), [ChatPanel.jsx](../../src/components/chat/ChatPanel.jsx) | Canal grupal por parque, directos con autorización, miembros, marcadores de lectura y filtrado de conversaciones. | Implementado mock; sin WebSocket |
| Proyecciones IA | No hay servicio, página, ruta ni contrato de proyección en `src/`. | No existen predicciones con confidence/trend/factors/recommendation, `insufficient_data` u `outdated`. | No implementado |
| Branding | [BrandLogo.jsx](../../src/components/branding/BrandLogo.jsx), `src/components/branding/BrandLogo.scss`, `public/assets/branding/` | Logo compartido; PNG maestro como identidad principal y SVG para animación. E2E comprueba hash/silueta y reduced motion. | Implementado; fidelidad raster 1:1 del SVG no certificada |
| Theme | [ThemeContext.jsx](../../src/context/ThemeContext.jsx), [ProfilePage.jsx](../../src/pages/profile/ProfilePage.jsx) | Claro/oscuro/sistema, persistencia y controles compartidos. | Implementado en navegador |
| QA | [permissions.test.js](../../src/config/permissions.test.js), [GuideDashboardPage.test.jsx](../../src/pages/dashboard/GuideDashboardPage.test.jsx), [ReadOnlyRole.test.jsx](../../src/components/admin/ReadOnlyRole.test.jsx), `src/services/*test.js`, `tests/*.spec.js` | Pruebas unitarias, integración React y Playwright por roles/módulos. | Vitest y build verificados; E2E no ejecutado en esta auditoría |

La app usa una arquitectura compartida `components → pages → routes → App.jsx → main.jsx`; no hay Sidebar ni AppLayout por rol.

## 3. Roles encontrados

| ID de rol | Nombre visible | Descripción basada en el código |
| --- | --- | --- |
| `MASTER_ADMIN` | Administrador Maestro | Administración del parque, permisos y delegación completa dentro de su parque. |
| `ADMIN` | Administrador | Operación administrativa; opcionales controlados por permisos. |
| `PARK_RANGER` | Guardaparque | Operación de campo, incidencias y módulos de monitoreo. |
| `TOUR_GUIDE` | Guía Turístico | Recorridos, grupos, orientación y reportes propios. |
| `READ_ONLY` | Usuario de Consulta | Consulta de dashboard y módulos permitidos sin escritura. |
| `Supervisor` | Supervisor | Rol heredado de demostración; se conserva por compatibilidad. |

No se encontraron otros IDs de rol en `roles.js` / `permissionsByRole`. `assignableRoles` deriva de las claves de `roles`, por lo que los seis pueden asignarse desde la gestión autorizada.

## 4. Matriz de permisos, rutas y acciones

Los permisos marcados como opcionales solo se activan si aparecen en el `optionalPermissions` del usuario y están permitidos para su rol. La navegación es el menú visible; las rutas de detalle y formularios dependen de permisos adicionales.

| Rol | Permisos efectivos configurados | Rutas visibles en navegación actual | Acciones principales / límites |
| --- | --- | --- | --- |
| `MASTER_ADMIN` | `dashboard.view`; `task.view/create/edit/delegate/reassign/complete`; `maintenance.view/create/edit/delegate/reassign`; `heritage.view/create/edit`; `species.view/create/edit/observation.create`; `tourist.view/create/edit`; `well.view`; `reports.view/export`; `users.view/create/edit/assign_role`; `delegation.view_history`; `chat.group/direct_admin`; `profile.view/edit`. | `/dashboard`, `/tasks`, `/tourists`, `/maintenance`, `/heritage`, `/species`, `/well-monitoring`, `/reports`, `/users`, `/chat`, `/profile`. No tiene `incident.*` en su matriz. | Delegar/reasignar tareas y mantenimiento, ver historial, administrar usuarios/roles y ambos chats. No tiene permisos de eliminación; no recibe `well.create/edit/delete`. |
| `ADMIN` | Base: `dashboard.view`; `task.view/create/edit`; `maintenance.view/create/edit`; `heritage.view/create`; `species.view`; `tourist.view/create`; `reports.view`; `chat.group/direct_admin`; `profile.view/edit`. Opcionales: `task.delegate`, `maintenance.delegate`, `reports.export`, `users.view`, `users.edit`. | Base: `/dashboard`, `/tasks`, `/tourists`, `/maintenance`, `/heritage`, `/species`, `/reports`, `/chat`, `/profile`. `/users` solo con `users.view`. | Puede crear/editar tareas y mantenimiento y crear patrimonio/turistas. Sin `task.complete`, no finaliza tareas. Sin opcionales, no delega, exporta ni entra a Usuarios. No puede asignar roles ni crear usuarios porque carece de `users.assign_role/users.create`. |
| `PARK_RANGER` | Base: `dashboard.view`; `task.view/create/edit/complete`; `maintenance.view/create/edit`; `tourist.view/create`; `heritage.view/create`; `species.view/create/edit/observation.create`; `well.view`; `reports.view`; `incident.view/manage`; `chat.group`; `profile.view/edit`. Opcionales: `task.delegate`, `maintenance.delegate`, `chat.direct_admin`. | `/dashboard`, `/tasks`, `/tourists`, `/maintenance`, `/heritage`, `/species`, `/well-monitoring`, `/reports`, `/incidents`, `/chat`, `/profile`. | Operación de campo, lectura/escritura científica permitida, revisión/conversión de incidencias. No administra usuarios. Sin opcionales no delega ni usa chat directo; no exporta reportes ni edita patrimonio. |
| `TOUR_GUIDE` | `dashboard.view`; `tour.view/create/update_own`; `visitor_group.view/create/update_own`; `tourist.view/create/update_own`; `incident.create/view_own`; `park_info.view`; `routes.view`; `species.view`; `heritage.view`; `chat.group`; `profile.view/update_own`. | `/dashboard`, `/tours`, `/visitors`, `/park-info`, `/heritage`, `/species`, `/incidents`, `/chat`, `/profile`. `/tourists` no se muestra; las URLs heredadas de turistas derivan a grupos agregados. | Crear/actualizar recorridos propios y grupos, reportar/consultar incidencias propias, chat grupal y consulta interpretativa. No ve Usuarios, tareas, mantenimiento, pozo ni reportes; no edita ciencia/patrimonio ni entra al chat directo. |
| `READ_ONLY` | Base: `dashboard.view`, `task.view`, `maintenance.view`, `heritage.view`, `species.view`, `reports.view`, `profile.view`. Único opcional: `chat.group`, no concedido por defecto. | `/dashboard`, `/tasks`, `/maintenance`, `/heritage`, `/species`, `/reports`, `/profile`. `/chat` solo después de conceder `chat.group`. | Consulta sin crear/editar/borrar/finalizar/delegar/asignar/administrar usuarios/exportar/reportar. Perfil sin formulario de edición ni cambio de contraseña. |
| `Supervisor` | `dashboard.view`, `reports.view/export`, `profile.view/edit`; `task.view/create/edit/complete/delete`; `maintenance.view/create/edit/complete/delete`; `heritage.view/create/edit/complete/delete`; `tourist.view/create/edit/delete`; `species.view/create/edit/delete/observation.create`; `well.view/create/edit/delete`. | `/dashboard`, `/tasks`, `/tourists`, `/maintenance`, `/heritage`, `/species`, `/well-monitoring`, `/reports`, `/profile`. | Conserva el conjunto amplio heredado, incluidos varios permisos `delete`; no tiene `users.*`, `chat.*`, `incident.*`, delegación ni permisos nuevos de Tours. No tiene opciones asignables configuradas. |

**Restricciones relevantes:** `ADMIN` tiene acceso grupal y directo base; el Guardaparque tiene solo grupal base; el Guía, grupal base; READ_ONLY solo grupal opcional. `TOUR_GUIDE` incluye `tourist.*` por matriz, pero las rutas heredadas muestran grupos agregados para no exponer la ficha personal de turistas. READ_ONLY y Guía no tienen entradas de Usuarios ni mantenimiento completo.

## 5. Usuarios de prueba leídos de `db.json`

`email` es el identificador que realmente compara el login. No hay campo `username` separado.

| Nombre | Email / usuario | Rol | Park ID | Estado | Contraseña en `db.json` | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| Sofía Arias | `sofia.arias@mock.gov` | `Supervisor` | `1` | `active: true` | `secret123` | Cuenta original de demostración; sin `optionalPermissions`. |
| Administrador de Prueba | `master.admin@mock.gov` | `MASTER_ADMIN` | `1` | `active: true` | `secret123` | Administrador Maestro; sin opcionales. |
| Administrador de Operaciones Mock | `admin@mock.gov` | `ADMIN` | `1` | `active: true` | `secret123` | `optionalPermissions: []`. |
| Guardaparque de Prueba | `guardaparque@mock.gov` | `PARK_RANGER` | `1` | `active: true` | `secret123` | `optionalPermissions: []`. |

Las cuatro cuentas del JSON usan la misma contraseña mock y pertenecen al mismo parque. La colección contiene **4 usuarios**. No hay cuentas `TOUR_GUIDE` ni `READ_ONLY` en la base persistida. Los fixtures de test no son cuentas de login de `db.json`.

Otros datos útiles del JSON: 1 parque; 2 rutas activas mock; 0 Tours; 0 grupos; 3 tareas; 2 atenciones de turistas; 2 mantenimientos; 6 registros patrimoniales; 7 especies; 1 observación; 3 lecturas de pozo; 1 incidencia; 1 canal grupal activo; 0 mensajes, 0 miembros y 0 conversaciones directas.

## 6. Cómo funciona el login y las credenciales

- [authService.js](../../src/services/authService.js) hace `GET /users`, compara `email.toLowerCase()` con el correo ingresado normalizado y compara `password` por igualdad exacta con `item.password`.
- Después exige `id`, `parkId` y `active === true`. No hay bypass de desarrollo ni contraseña por defecto en el código.
- `db.json` guarda el campo `password` **en texto plano**. No usa `passwordHash` ni hash. Es solo mock local, no producción.
- `safeUser` quita `password` antes de guardar la sesión en `localStorage` con la clave `parque-isla-san-lucas-auth`.
- `AuthContext` restaura esa sesión al recargar. El servicio vuelve a consultar al usuario y comprueba actor activo, mismo parque y permiso en las operaciones protegidas.
- Cambio de contraseña/profile permitido actualiza el mock en `users`; no hay recuperación real. FIDO2/MFA y “recordarme” aparecen como POR VALIDAR.
- **Discrepancia:** la pantalla dice “Correo o usuario” y muestra un ejemplo de código `GP-XXXX`, pero `authService` solo busca por `email`. Use email; el login por código no está implementado.

## 7. Cómo iniciar el proyecto

Requisito: Node.js `>=22.12.0`.

1. Instalar dependencias: `npm install` (comando npm; no es un script del proyecto).
2. En una terminal: `npm run server` → JSON Server en puerto `3001`.
3. En otra terminal: `npm run dev` → Vite imprime la URL, normalmente `http://localhost:5173`.
4. API local por defecto: `http://localhost:3001`; `apiClient.js` permite `VITE_API_URL`.
5. Login: `http://localhost:5173/login` si Vite eligió el puerto predeterminado.

Scripts reales en `package.json`: `npm run dev`, `npm run server`, `npm run build`, `npm run lint`, `npm run preview`, `npm test`, `npm run test:run`, `npm run test:watch`, `npm run test:coverage`, `npm run test:e2e`, `npm run format`.

Playwright usa puertos separados: API temporal `3101`, Vite `5175`, viewport inicial `1280×1024`. [test-server.mjs](../../scripts/test-server.mjs) copia `db.json` a un directorio temporal; los E2E no deberían modificar la base de trabajo. Para E2E instalar Chromium una vez con `npx playwright install chromium`.

## 8. Guía de login por rol

### MASTER_ADMIN

**Usuario:** `master.admin@mock.gov` · **Contraseña:** `secret123` · **Park:** `1`  
**Debe ver:** Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Pozo, Reportes, Usuarios, Chat, Perfil.  
**Puede:** crear/editar conforme a matriz; finalizar tareas; delegar y reasignar tarea/mantenimiento; ver historial; gestionar cuentas y roles del mismo parque; exportar; chat grupal/directo.  
**No puede:** acceder a otro parque mediante servicios; eliminar registros según los permisos definidos; escribir en pozo (`well.view` solamente).

### ADMIN

**Usuario:** `admin@mock.gov` · **Contraseña:** `secret123` · **Park:** `1`  
**Debe ver de inicio:** Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Reportes, Chat, Perfil. No Usuarios ni Pozo.  
**Puede:** crear/editar tareas y mantenimiento; crear patrimonio y atención turística; chat grupal/directo.  
**No puede por defecto:** finalizar tarea, delegar, exportar, administrar usuarios, registrar/editar especies. Los cinco opcionales están vacíos en `db.json`.

### PARK_RANGER

**Usuario:** `guardaparque@mock.gov` · **Contraseña:** `secret123` · **Park:** `1`  
**Debe ver:** Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Pozo, Reportes, Incidencias, Chat, Perfil.  
**Puede:** crear/editar tareas y mantenimiento, completar tarea, crear atención/especie/patrimonio, crear observaciones, consultar pozo y gestionar incidencias.  
**No puede por defecto:** delegar, chat directo, exportar, administrar usuarios o editar patrimonio. Opcionales del JSON vacíos.

### TOUR_GUIDE

**Credencial:** no existe usuario Guía en `db.json`; no se puede iniciar sesión con una cuenta actual.  
**Para probar:** iniciar como Maestro, abrir `/users`, crear un usuario de prueba activo en park `1` y asignar `TOUR_GUIDE`; usar una contraseña mock temporal de al menos 8 caracteres creada por quien ejecuta la prueba. No guardar en este manual como si ya existiera.  
**Debe ver:** Inicio del guía, Mis recorridos, Visitantes, Información del parque, Incidencias propias, Chat grupal, Patrimonio, Especies y Perfil.  
**Puede:** crear/actualizar recorridos y grupos propios; enviar reportes; consultar rutas/especies/patrimonio.  
**No puede:** entrar a Usuarios o Mantenimiento/Tareas; editar especies/patrimonio; usar chat directo. Tours y grupos empiezan vacíos aunque haya dos rutas seed.

### READ_ONLY

**Credencial:** no existe usuario READ_ONLY en `db.json`; no se puede iniciar sesión con una cuenta actual.  
**Para probar:** crear con el Maestro un usuario temporal `READ_ONLY`, activo y en park `1`, con contraseña temporal de al menos 8 caracteres. Solo asignar `chat.group` si la política local lo permite.  
**Debe ver:** Inicio, Tareas, Mantenimiento, Patrimonio, Especies, Reportes, Perfil. Chat oculto por defecto.  
**Puede:** consultar y filtrar.  
**No puede:** crear, editar, borrar, completar, delegar/reasignar, administrar usuarios, exportar ni reportar incidencias. Los formularios de perfil/password se ocultan.

### Supervisor heredado

**Usuario:** `sofia.arias@mock.gov` · **Contraseña:** `secret123` · **Park:** `1`. Mantiene permisos de legado, incluidos delete y escritura de pozo. No tiene Chat ni Usuarios. Usar esta cuenta para comprobar regresión de compatibilidad, no como sustituto de un rol de solo lectura.

### Cuentas sugeridas que NO existen

Solo como propuesta local para facilitar QA: `guide@sanlucas.test` (`TOUR_GUIDE`) y `readonly@sanlucas.test` (`READ_ONLY`). No están en `db.json`; no tienen contraseñas actuales y no funcionan hasta crearlas explícitamente. No son credenciales obtenidas del proyecto.

## 9. Pruebas manuales por módulo

### Administración de roles/usuarios

1. Entrar como `master.admin@mock.gov`.
2. Abrir `/users`; comprobar que el listado pertenece al parque `1`.
3. Crear usuario con correo único, contraseña mock >=8 caracteres y rol asignable.
4. Asignar rol; verificar historial/actor y que la contraseña no aparezca en la respuesta de usuario.
5. Para ADMIN opcional, marcar únicamente un permiso permitido y guardar. Cerrar/iniciar sesión de ADMIN para refrescar la navegación.
6. Intentar `/users` como ADMIN sin `users.view`, Guía o READ_ONLY: espera `Acceso restringido`.

ADMIN puede consultar/editar usuarios únicamente con sus opcionales `users.view`/`users.edit`; no puede crear usuarios ni asignar roles, pues no tiene `users.create` ni `users.assign_role`.

### Tareas

- `/tasks`: consultar, buscar, filtrar lista/Kanban.
- `/tasks/new`: disponible para Maestro, ADMIN y Guardaparque; denegado para Guía/READ_ONLY.
- `/tasks/1`: inspeccionar detalle y acciones. La finalización requiere `task.complete`; delegación/reasignación usa permisos separados.
- `/tasks/1/edit`: protegido por `task.edit`.
- READ_ONLY debe ver tarjetas/detalles sin crear/editar/borrar/finalizar/delegar.

### Mantenimiento

- `/maintenance`: consulta para Maestro, ADMIN, Guardaparque y READ_ONLY.
- `/maintenance/new`, `/:id/edit`: Maestro, ADMIN y Guardaparque según `maintenance.create/edit`.
- Delegación inicial requiere `maintenance.delegate`; reasignación requiere `maintenance.reassign`. ADMIN/Guardaparque no los tienen por defecto. Maestro sí los tiene.
- En detalle, verificar responsable, `Delegado por`, fecha e historial. READ_ONLY no debe mostrar formulario ni botones de escritura.

### Guía: pruebas manuales

Requiere crear primero una cuenta Guía como indica la sección 8.

| ID | Pasos | Resultado esperado |
| --- | --- | --- |
| GUIDE-01 Dashboard | Login Guía → `/dashboard`. | `Inicio del guía`, conteo de hoy/próximos recorridos, grupos/visitantes/incidencias, info/avisos/chat. No resumen administrativo ni Pozo. |
| GUIDE-02 Recorrido | `/tours` → elegir fecha, ruta seed, horarios y estado → guardar. Cambiar estado de propio recorrido. | Persiste `parkId`, `guideId`, route/group IDs y estado. Opciones permitidas: `scheduled`, `in_progress`, `completed`, `cancelled`. |
| GUIDE-03 Grupo | `/visitors` → cantidad, procedencia, idioma, tipo, fecha/hora y observación. | Grupo propio; no requiere nombre del visitante. |
| GUIDE-04 Incidencia | `/incidents` → registrar asistencia, sendero, señal, situación u objeto perdido. | Reporte `received`, actor/fecha/historial; el Guía no lo convierte ni lo gestiona. |
| GUIDE-05 Especie | `/species` → abrir ficha. | Lectura interpretativa. |
| GUIDE-06 Editar especie | Intentar “Editar”, `/species/:id/edit` o crear observación. | Acción oculta y URL denegada; sin `species.edit` ni `species.observation.create`. |
| GUIDE-07 Patrimonio | `/heritage` → abrir intervención existente. | Lectura solamente; no hay editar ni intervenir. |
| GUIDE-08 Usuarios | Abrir `/users` directamente. | `Acceso restringido`; no aparece Usuarios en el menú. |

El Guía ve Chat grupal, no Directo administrativo. `/tourists` se deriva a grupos agregados para no exponer nombres personales.

### READ_ONLY: pruebas manuales

Requiere crear primero el usuario temporal. Abrir `/dashboard`, `/tasks`, `/maintenance`, `/heritage`, `/species`, `/reports`, `/profile`; comprobar consulta y filtros. Confirmar que no aparecen CTAs de crear/editar/borrar/delegar/completar, export CSV, formularios de perfil/password o gestión de usuarios. Probar `/tasks/new`, `/tasks/1/edit`, `/maintenance/new`, `/maintenance/1/edit`, `/heritage/new`, `/species/new`, `/users` y `/incidents`: todos deben mostrar `Acceso restringido`. `/chat` también debe denegar salvo opcional `chat.group`.

## 10. Pruebas de proyecciones IA

No hay proyecciones IA implementadas. No existen los seis catálogos/módulos AI solicitados, endpoints, modelos ni campos de respuesta `confidence`, `trend`, `factors`, `recommendation`, `insufficient_data` u `outdated`. Los gráficos de historial son resúmenes descriptivos. `riskLevel` y `recommendations` en `modules.js` son campos de la ficha científica, no resultados de IA.

| Caso pedido | Estado verificable | Prueba posible hoy |
| --- | --- | --- |
| AI-01 Pozo | IA no implementada; sí hay lecturas/monitor de pozo. | Consultar `/well-monitoring`; no afirmar predicción. |
| AI-02 Afluencia | IA no implementada; sí hay atenciones y reporte descriptivo. | `/reports`, catálogo turístico. |
| AI-03 Clima | No hay servicio/colección de clima encontrada. | Ninguna IA; caso pendiente. |
| AI-04 Mantenimiento | No hay predictor; sí registros y estados. | `/maintenance`; inspección manual, no predicción. |
| AI-05 Biodiversidad | No hay predictor; sí catálogo y observaciones. | `/species`; consulta manual. |
| AI-06 Patrimonio | No hay predictor; sí intervenciones. | `/heritage`; consulta manual. |

| Rol | Pozo | Afluencia | Clima | Mantenimiento | Biodiversidad | Patrimonio |
| --- | --- | --- | --- | --- | --- | --- |
| `MASTER_ADMIN` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |
| `ADMIN` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |
| `PARK_RANGER` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |
| `TOUR_GUIDE` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |
| `READ_ONLY` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |
| `Supervisor` | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA | Sin acceso IA |

“Sin acceso IA” significa que la feature no existe, no que el rol carezca necesariamente de acceso a los datos base (por ejemplo, READ_ONLY sí tiene `well.view` denegado y no ve pozo; Master/Guardaparque sí consultan el monitor normal).

## 11. Pruebas de chat

El chat usa colecciones mock de canales, miembros, mensajes y conversaciones directas; la sesión actual requiere el mismo `parkId`. No usa WebSocket; actualiza después de enviar/refrescar y mantiene marcadores de lectura.

| ID | Pasos | Resultado esperado |
| --- | --- | --- |
| CHAT-01 Grupal | Master/ADMIN/Guardaparque/Guía → `/chat` → Chat grupal → enviar. | Canal activo del parque `1`; mensaje asociado a channelId y sender; aparece en el log del parque. READ_ONLY solo con `chat.group` opcional. |
| CHAT-02 Directo | Master o ADMIN → tab “Directo administrativo” → seleccionar usuario activo mismo parque → enviar. | Conversación entre dos miembros; mensaje visible solo a ambos; estado no leído se actualiza. Guardaparque requiere opcional `chat.direct_admin`. |
| CHAT-03 Guía directo | Guía → `/chat`. Intentar encontrar tab directo. | No aparece; servicio exige `chat.direct_admin`, permiso que el Guía no tiene. |
| CHAT-04 Otro parque | Intentar usar destinatario/canal con parkId `2`. | Servicio/repository rechaza por parque. `db.json` actual solo tiene usuarios del parque `1`; usar fixture `foreignWorker` de `chatService.test.js` para repetirlo automáticamente. |

En el JSON de inicio hay un canal grupal activo, pero 0 miembros/mensajes/conversaciones.

## 12. Pruebas de delegación

Los permisos de delegación no equivalen a `edit`; el servicio verifica actor, parque, permiso, usuario activo y serializa cambios por registro en este cliente. El Maestro es la cuenta de prueba con delegate y reassign base.

### TEST D-01: delegar tarea

1. Iniciar sesión como `master.admin@mock.gov` / `secret123`.
2. Abrir `/tasks/1` (tarea seed “Inspección de sendero norte”).
3. En “Usuario responsable”, seleccionar un usuario activo del parque `1` distinto del actor.
4. Pulsar “Delegar registro”.
5. Verificar responsable y sección Historial.
6. En JSON temporal revisar `assignedToUserId`, `assignedByUserId`, `delegatedAt`, `delegationHistory[0]` y `parkId`.

**Esperado:** responsable y actor correctos, fecha presente, evento con módulo/recordId/parque y asignación previa `null`; evento conserva nombres históricos.

### TEST D-02: reasignar

1. Sobre la misma tarea ya delegada, entrar con Maestro.
2. Seleccionar otro usuario activo del mismo parque.
3. Pulsar “Reasignar responsable”.
4. Verificar que cambia `assignedToUserId` y agrega un evento, sin borrar el anterior.

**Esperado:** historial anterior + evento nuevo; `previousAssignedToUserId` coincide con responsable anterior.

### TEST D-03: usuario sin permiso

1. Login como `guardaparque@mock.gov` (sin opcionales en JSON), abrir `/tasks/1`.
2. Verificar que Delegación y responsables/selector/botón no aparecen.
3. Abrir `/maintenance/1` y repetir.

**Esperado:** no hay CTA de delegar/reasignar; llamada al servicio sin permiso se rechaza. `delegationService.test.js` cubre denegación y usuarios/park IDs inválidos.

## 13. Pruebas de navegación, rutas, tema y responsive

### Navegación por rol

Comparar menú visible con la tabla de la sección 4. Después escribir manualmente una ruta no autorizada: debe terminar en `/unauthorized` con “Acceso restringido”. `/` deriva a `/dashboard`.

### ProtectedRoute

- Sin sesión → `/tasks` debe ir a `/login` conservando `from`.
- Sesión activa con permiso → entra.
- Sesión activa sin permiso → `/unauthorized`.
- Usuario inactivo/sesión sin parkId → autenticación considerada inválida.
- URL inexistente → `404 · Página no encontrada`.

### Light/dark

1. Abrir menú superior “Cambiar tema”; elegir claro/oscuro.
2. En Perfil → Preferencias, alternar Light/Dark/Automático.
3. Recargar: la preferencia se conserva en `localStorage` (`parque-isla-san-lucas-theme`).
4. Revisar Sidebar, tarjetas, formularios, chat, diálogos y logo en ambos temas. El logo reacciona a `data-theme`; reduced motion desactiva animación.
5. Contraste: consultar artefactos existentes bajo `docs/qa/`; no es certificación institucional.

### Responsive

Usar DevTools Responsive Design y probar anchos **320, 375, 390, 768, 1024, 1280 y 1440 px**. Revisar Sidebar/drawer, navbar, título/breadcrumb, grid de dashboard, tabla/lista, campos, chat, logo y modales; comprobar que no haya scroll horizontal, texto truncado o controles inaccesibles. Breakpoints existentes incluyen 420/480/599/600/700/768/1024/1400 según componente. Playwright usa 1280×1024 por defecto y `chat.spec.js` también prueba 390×844; no cubre automáticamente toda la matriz indicada.

## 14. Tests automáticos existentes

- Vitest: `npm test` / `npm run test:run`; último resultado observado tras READ_ONLY: **39 archivos, 273 tests aprobados**. `npm run build` y `npm run lint` también terminaron correctamente en esa validación.
- Suites relevantes: `permissions.test.js`, `ProtectedRoute.test.jsx`, `authService.test.js`, `delegationService.test.js`, `chatService.test.js`, `ChatPanel.test.jsx`, `AdminFeatures.test.jsx`, `AdminRole.test.jsx`, `ParkRangerRole.test.jsx`, `GuideDashboardPage.test.jsx`, `ReadOnlyRole.test.jsx`, `DashboardPage.test.jsx`, `ProfilePage.test.jsx`, `ReportsPage.test.jsx`.
- Playwright: `npm run test:e2e`; `npm run test:e2e -- --list` enumera **18 pruebas en 6 archivos**. La lista cubre login/CRUD tareas, especies, reportes, pozo, perfil, 22 páginas/branding, ADMIN, Maestro, Guardaparque y chat. No contiene E2E de Guía ni READ_ONLY.
- En esta auditoría se ejecutó `--list`, no la suite E2E. Los resultados 39/273, lint/build son la última validación registrada en la sesión de implementación; no son una afirmación de que E2E se ejecutó aquí.
- `npm run test:coverage` genera cobertura; `npm run test:watch` modo watch. `npm run format` modifica archivos y no es un test.

## 15. Errores y brechas detectadas

| Severidad | Archivo/área | Problema | Impacto | Corrección recomendada |
| --- | --- | --- | --- | --- |
| HIGH para producción | `db.json`, `authService.js`, `apiClient.js` | Contraseñas en texto plano y autorización en cliente/servicios contra JSON Server. | No es seguridad de producción; cualquiera con acceso API puede leer/escribir endpoints mock. | Antes de desplegar: backend autenticado, hashes seguros, autorización por parque en servidor, secretos fuera del repositorio, transporte protegido. Mantener cuentas actuales solo para demo local. |
| MEDIUM | `db.json` | Faltan usuarios con roles `TOUR_GUIDE` y `READ_ONLY`. | No es posible probar login normal con esos roles; solo fixtures/render directo. | Crear cuentas mock explícitas y documentadas, parque `1`, activar cuenta y opcional chat solo con aprobación local. |
| MEDIUM | `LoginPage.jsx` / `authService.js` | “Correo o usuario”/código `GP-XXXX` aparece en interfaz, pero login solo busca email. | Un código de usuario no autenticará. | Cambiar label/placeholder a correo o implementar identificador adicional con tests. |
| MEDIUM | IA/proyecciones | No hay funciones IA ni seis proyecciones solicitadas. | AI-01…AI-06 y campos confidence/trend/etc. no se pueden validar. | Definir contrato/datos/modelo, permisos y tests antes de anunciar la función. |
| MEDIUM | `tests/*.spec.js` | Playwright no tiene recorridos E2E de Guía ni READ_ONLY. | Flujos cubiertos por Vitest, no por navegador real con JSON Server. | Añadir specs E2E al crear usuarios demo para esos roles. |
| LOW | `README.md`, `docs/admin.md`, `docs/master-admin.md`, `docs/park-ranger.md` | Documentación de rol/cuentas refleja implementación anterior; no explica Guía/Read Only como cuentas actuales. | La persona puede asumir que hay credenciales que no existen. | Mantener este manual como referencia actual y sincronizar las guías existentes en una tarea documental posterior. |
| LOW | Workspace | No hay `.git`/diff accesible. | No se puede determinar con evidencia qué archivos exactos cambiaron desde una base anterior. | Restaurar/proveer historial Git o un commit base antes de auditorías de trazabilidad exacta. |

No se detectó bypass de autenticación en `authService`; tampoco un hash. Los usuarios reales del mock existen y están activos. Guía/Read Only están registrados como roles, pero no como usuarios.

## 16. Estado implementado vs pendiente

| Estado | Elementos |
| --- | --- |
| IMPLEMENTADO | Roles RBAC existentes, navegación filtrada, `ProtectedRoute`, CRUD mock por permiso, aislamiento `parkId`, delegación e historial, chat grupal/directo autorizado, dashboard de guía, Tours/visitantes/reportes de guía, vistas READ_ONLY, theme persistido, branding compartido. |
| PARCIALMENTE IMPLEMENTADO | Login email/password mock; las cuentas Guide/Read Only faltan del JSON; E2E no cubre esos dos roles; lista de permisos y UI no reemplazan una política de servidor. |
| MOCK | JSON Server, usuarios, passwords, recorridos/grupos/rutas, tareas, especies, patrimonio, pozo, chat, reportes/export CSV y auditoría/historial almacenada localmente. E2E usa copia temporal de `db.json`. |
| POR VALIDAR | MFA/FIDO2, recordar equipo, recuperar contraseña, protocolos/umbrales/formatos oficiales, información geográfica/horarios, sensores y conectividad institucional. |
| NO IMPLEMENTADO | Backend real de auth/RBAC; IA/proyecciones Pozo/Afluencia/Clima/Mantenimiento/Biodiversidad/Patrimonio; login con código de usuario; usuarios Guide/Read Only seed; E2E de Guide/Read Only. |

Las recomendaciones y `riskLevel` de fichas existentes son campos descriptivos/operativos; no deben presentarse como predicción automática.

## 17. Checklist de QA

### Accesos y roles

- [ ] Login MASTER_ADMIN
- [ ] Login ADMIN
- [ ] Login PARK_RANGER
- [ ] Login TOUR_GUIDE (requiere crear usuario mock; no existe hoy)
- [ ] Login READ_ONLY (requiere crear usuario mock; no existe hoy)
- [ ] Login Supervisor heredado
- [ ] Navegación por rol y opcionales
- [ ] URL protegida rechazada por cada rol
- [ ] Sin sesión → login; sin permiso → Unauthorized; ruta desconocida → 404

### Escrituras y operaciones

- [ ] Crear/editar tarea con rol autorizado
- [ ] Delegar tarea (D-01)
- [ ] Reasignar tarea e historial (D-02)
- [ ] Intento de delegación sin permiso (D-03)
- [ ] Crear/editar mantenimiento
- [ ] Delegar/reasignar mantenimiento según permiso
- [ ] Perfil view-only y acciones de modificación ocultas
- [ ] Exportación solo con `reports.export`

### Guía y consulta

- [ ] Dashboard Guía
- [ ] Recorrido creado/actualizado
- [ ] Grupo agregado sin datos personales
- [ ] Incidencia propia reportada
- [ ] Especie/patrimonio consultados sin edición
- [ ] READ_ONLY ve consultas permitidas sin CTA de escritura
- [ ] Usuarios/mantenimiento/incidencias denegados para READ_ONLY

### Chat, datos y presentación

- [ ] Chat grupal mismo parque
- [ ] Chat directo administrativo
- [ ] Guía sin directo; usuario de otro `parkId` rechazado
- [ ] AI-01 Pozo (no implementada; no marcar aprobada)
- [ ] AI-02 Afluencia (no implementada)
- [ ] AI-03 Clima (no implementada)
- [ ] AI-04 Mantenimiento (no implementada)
- [ ] AI-05 Biodiversidad (no implementada)
- [ ] AI-06 Patrimonio (no implementada)
- [ ] Light/Dark, persistencia, logo y reduced motion
- [ ] Responsive 320/375/390/768/1024/1280/1440
- [ ] `npm test`
- [ ] `npm run test:e2e` (separar resultado de `--list`)
- [ ] `npm run lint`
- [ ] `npm run build`
