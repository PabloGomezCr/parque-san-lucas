# MASTER_ADMIN — Administrador Maestro

Implementado en el proyecto existente, dentro del parque asignado. Se mantienen las 22 Pages, un AppLayout y una Sidebar compartidos. No hay privilegios nacionales o de múltiples parques.

## Auditoría previa y decisión de compatibilidad

El proyecto tenía un único rol de demostración (`Supervisor`), ninguna matriz RBAC, navegación estática y ProtectedRoute limitado a la existencia de sesión. Las operaciones existentes del Supervisor se trasladaron a un conjunto de permisos para conservar su funcionalidad; no se añadieron otros roles operativos.

`MASTER_ADMIN` recibe los **34 permisos exactos del contrato**, declarados en `src/config/permissions.js`. No recibe permisos de eliminación ni escritura del pozo. `roles.js` centraliza nombres visibles y roles asignables. La ampliación posterior de [ADMIN](admin.md) añadió ese rol y sus opcionales; mantiene sin cambios los 34 permisos del Maestro y los del Supervisor.

## Cambios funcionales

- `useAuth().can(permission)` centraliza las decisiones de UI. Rutas, Sidebar, menú móvil y navegación inferior utilizan permisos.
- ProtectedRoute exige una sesión activa con parque y comprueba el permiso de la ruta, incluidas las URLs create/edit.
- Cada operación de los servicios comprueba nuevamente el usuario persistido: activo, mismo parque que la sesión y permiso vigente. Una cuenta desactivada o degradada después del login no puede seguir realizando operaciones autorizadas por su sesión antigua.
- Los repositorios de módulos filtran listados por parkId y rechazan lectura/edición de IDs ajenos. Creación y modificación usan el parque y actor de la sesión; la edición genérica no puede modificar campos protegidos de delegación ni borrar el historial.
- Usuarios permite crear, editar y activar/desactivar cuentas propias del parque, y asignar los roles permitidos. No devuelve contraseñas. La edición de perfil/credenciales se restringe al propio usuario.
- Delegación en detalles de tareas y mantenimiento selecciona usuarios activos del mismo parque. La creación del administrador selecciona un responsable real. Reasignar conserva eventos anteriores.
- Cada evento incluye responsable, actor, nombres históricos, parque y fecha. El registro conserva `assignedToUserId`, `assignedByUserId`, `delegatedAt` y un array acumulativo `delegationHistory`.
- DashboardPage muestra Asignadas a mí, Delegadas por mí y el historial del parque. Los contadores incluyen tareas y mantenimiento; Delegadas por mí refleja el autor de la asignación vigente. El historial conserva todas las asignaciones anteriores.
- Chat incluye canal grupal del parque y conversación directa administrativa con un usuario activo de ese parque. Los mensajes incluyen emisor, parque y fecha; los directos se filtran por ambos participantes.

## Rutas y navegación

| Ruta | Permiso | Implementación |
| --- | --- | --- |
| /dashboard | dashboard.view | DashboardPage existente + resumen de delegaciones |
| /tasks, /tasks/:id | task.view | Pages existentes; panel de delegación en detalle |
| /tasks/new, /tasks/:id/edit | task.create / task.edit | FormPage existente |
| /maintenance, /maintenance/:id | maintenance.view | Pages existentes; panel de delegación en detalle |
| /maintenance/new, /maintenance/:id/edit | maintenance.create / maintenance.edit | FormPage existente |
| /tourists y detalle/create/edit | tourist.view / tourist.create / tourist.edit | Pages existentes |
| /heritage y detalle/create/edit | heritage.view / heritage.create / heritage.edit | Pages existentes |
| /species y detalle/create/edit | species.view / species.create / species.edit | Pages existentes |
| /well-monitoring | well.view | Page existente, consulta para MASTER_ADMIN |
| /reports | reports.view | Exportación condicionada a reports.export |
| /users | users.view | DashboardPage section="users" → UserManagement |
| /chat | chat.group | DashboardPage section="chat" → ChatPanel (infraestructura compartida) |
| /profile | profile.view | Page existente, nombre visible del rol |

MASTER_ADMIN ve Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Pozo de Agua, Reportes, Usuarios, Chat y Perfil. El Supervisor conserva sus nueve entradas anteriores. El menú completo móvil también usa la misma configuración; la barra inferior conserva su selección compacta de módulos permitidos.

## Archivos de implementación

| Grupo | Archivos nuevos/modificados |
| --- | --- |
| RBAC | `src/config/roles.js` (nuevo), `permissions.js` (nuevo), `navigation.js`, `modules.js` |
| Sesión/hooks | `src/context/AuthContext.jsx`, `src/hooks/useAuth.js`, `useRecordEditor.js` |
| Rutas | `src/routes/ProtectedRoute.jsx`, `AppRoutes.jsx` |
| Layout compartido | `src/components/layout/Sidebar.jsx`, `AppLayout.jsx`, `BottomNavigation.jsx` |
| CRUD | `src/components/records/RecordList.jsx`, `RecordForm.jsx`, `RecordDetail.jsx` |
| Componentes nuevos | `src/components/admin/AssigneeSelect.jsx`, `DelegationPanel.jsx`, `DelegationSummary.jsx`, `UserManagement.jsx`, `ChatPanel` (extraído posteriormente a `src/components/chat/`; ver [chat compartido](chat.md)) |
| Especies | `src/components/species/SpeciesObservations.jsx` |
| Pages existentes | `src/pages/dashboard/DashboardPage.jsx`, `well/WellMonitoringPage.jsx`, `reports/ReportsPage.jsx`, `profile/ProfilePage.jsx` |
| Servicios existentes | `src/services/authService.js`, `taskService.js`, `maintenanceService.js`, `touristService.js`, `heritageService.js`, `speciesService.js`, `wellService.js` |
| Servicios nuevos | `src/services/sessionAccess.js`, `userService.js`, `delegationService.js`, `chatService.js` |
| Repositorio nuevo | `src/repositories/createScopedRepository.js` |
| Mock/configuración | `db.json`, `vitest.config.js` |
| Documentación | `README.md`, `docs/master-admin.md`, `docs/page-tests.md` |

La base conserva al Supervisor original y sus datos, añade parkId a las colecciones del parque, actividad de los usuarios, un administrador de prueba y chatMessages. App.jsx, main.jsx, index.html y los estilos no necesitan cambios.

## Tests

Nuevas suites:

- `src/config/permissions.test.js`: matriz, once módulos, compatibilidad Supervisor, actividad y parque.
- `src/services/delegationService.test.js`: tarea/mantenimiento, reasignación, historial acumulativo, actor, usuario ajeno/inactivo, sesión desactivada, resumen y serialización en este cliente.
- `src/services/userService.test.js`: usuarios propios, creación/edición, rol permitido, historial de roles, correos duplicados y rechazo de IDs ajenos.
- `src/services/chatService.test.js`: grupal, directo, contactos propios activos y aislamiento de conversaciones/parques.
- `src/services/authService.test.js`: login activo, ausencia de contraseña en sesión, perfil propio y rechazo de credenciales ajenas.
- `src/repositories/createScopedRepository.test.js`: aislamiento de datos, asignación inicial, campos protegidos y restricciones del MASTER_ADMIN; compatibilidad del Supervisor.
- `src/components/admin/AdminFeatures.test.jsx`: flujos completos con Pages/componentes reales y servicios/repositorios reales sobre un transporte JSON Server en memoria.
- `tests/master-admin.spec.js`: login real, delegación/reasignación de tarea y mantenimiento, gestión y rol de usuario, ambos chats y persistencia tras recarga.

Se amplió `ProtectedRoute.test.jsx` para permisos y actividad. `LoginPage.test.jsx` y `src/test/renderWithProviders.jsx` usan ahora sesiones con parkId y actividad válidos. Nuevos fixtures y transporte: `src/test/fixtures/admin.js` y `src/test/mocks/jsonServer.js`.

## Uso del mock

Acceso de prueba: `master.admin@mock.gov` / `secret123`. El acceso original `sofia.arias@mock.gov` / `secret123` sigue disponible.

Las sesiones antiguas sin parkId/active necesitan iniciar sesión de nuevo. Playwright usa una copia temporal de db.json; sus cambios no alteran la base de trabajo. El chat se actualiza al enviar o con Actualizar mensajes; no introduce WebSockets.

La seguridad es Front-End mock: JSON Server no protege sus endpoints. El historial se agrega en un único PATCH del registro y las operaciones concurrentes del mismo registro se serializan en este cliente. JSON Server no ofrece transacciones ni protección contra escrituras simultáneas de clientes distintos; esas garantías corresponden al futuro backend.

## Validación final

- `npm test`: **30 suites, 186 tests aprobados** (139 de la base + 47 agregados/ampliados).
- `npm run test:coverage`: aprobado. Alcance ampliado a RBAC, administración y servicios nuevos: **89,90% líneas**, 88,71% statements, 81,75% branches y 86,25% functions.
- `npm run lint`: aprobado, sin advertencias.
- `npm run build`: aprobado.
- `npm run test:e2e`: las **14 pruebas previas aprobaron**. La prueba nueva llegó a la gestión de usuarios y falló por una consulta exacta de label; se corrigió a una consulta por rol accesible.
- `npm run test:e2e -- tests/master-admin.spec.js`: **1 prueba aprobada** tras la corrección, incluyendo login, ambas delegaciones/reasignaciones, gestión/asignación de rol y ambos chats contra JSON Server real temporal.

Los dos fallos de consultas de tests detectados durante la implementación (label de correo en E2E y consulta de Mensaje que incluía el log en RTL) se resolvieron en los tests. No requirieron cambios productivos ni relajaron comprobaciones de seguridad.
