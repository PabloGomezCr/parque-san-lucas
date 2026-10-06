# ADMIN — Administrador

Se añadió únicamente ADMIN al sistema RBAC existente. Se reutilizan las 22 Pages, ProtectedRoute, navigation.js, Sidebar, AppLayout y los componentes existentes de usuarios, delegación y chat. Los conjuntos de permisos de MASTER_ADMIN y Supervisor no se modificaron.

## Permisos

ADMIN recibe exactamente estos **17 permisos base**:

```text
dashboard.view
task.view, task.create, task.edit
maintenance.view, maintenance.create, maintenance.edit
heritage.view, heritage.create
species.view
tourist.view, tourist.create
reports.view
chat.group, chat.direct_admin
profile.view, profile.edit
```

Los cinco opcionales asignables son `task.delegate`, `maintenance.delegate`, `reports.export`, `users.view` y `users.edit`. Se guardan como `optionalPermissions` en el usuario y empiezan vacíos en la cuenta de prueba.

`permissions.js` calcula la unión de permisos base y opcionales expresamente permitidos para el rol. Ignora permisos arbitrarios o ajenos a esa lista, aunque se incluyan manualmente en el usuario. ADMIN no recibe `users.assign_role`, `users.create`, reasignación, historial de delegación, finalización de tareas ni acceso al pozo.

## Asignar y retirar opcionales

Un usuario con `users.assign_role` puede conceder o retirar opcionales desde **Usuarios → Permisos opcionales → Guardar permisos**. También puede seleccionarlos al crear un usuario ADMIN. Se reutiliza esta autorización del Maestro, sin añadirle permisos nuevos.

El servicio comprueba actor activo, parque y autorización, valida la lista y agrega un evento a `permissionHistory` con permisos anteriores/nuevos, actor y fecha. Un cambio de rol limpia los opcionales si cambia el rol. La edición ordinaria con `users.edit` no cambia roles ni opcionales y no permite elevar privilegios.

Para editar desde la pantalla Usuarios hacen falta tanto `users.view` como `users.edit`; solo consultar necesita `users.view`. Los opcionales permanecen independientes, sin conceder permisos adicionales automáticamente.

La navegación usa los permisos de la sesión cargada al entrar; tras una concesión externa se debe iniciar sesión de nuevo para actualizar sus controles. Los servicios consultan al usuario persistido antes de operar: retirar un permiso bloquea la operación aunque una sesión antigua todavía muestre el control.

## Delegación y consultas

La delegación se autoriza exclusivamente con `can("task.delegate")` o `can("maintenance.delegate")` y con la comprobación equivalente del servicio. Se mantienen los requisitos de usuario activo y mismo parkId, los campos de trazabilidad y el historial acumulativo.

ADMIN con el opcional puede efectuar una delegación inicial. No recibe `task.reassign` ni `maintenance.reassign`; una asignación ya delegada necesita esos permisos para cambiarla, conservando la distinción existente del Maestro.

Dashboard y reportes ahora consultan únicamente colecciones cuyo permiso de lectura tiene el usuario. ADMIN puede utilizarlos sin `well.view`: no se consulta el pozo ni se muestran su tarjeta/catálogo. Dashboard oculta además el acceso rápido de registrar especies. Las opciones de finalizar una tarea se deshabilitan sin `task.complete`, y el servicio impide crear una tarea ya finalizada para eludir ese permiso.

El chat existente permite canal grupal y directo administrativo del parque, sin necesitar opciones nuevas.

## Rutas y navegación afectadas

No se añadieron rutas ni Pages. ProtectedRoute y navigation.js se reutilizan sin cambios.

| Área | ADMIN base |
| --- | --- |
| /dashboard | Consulta del resumen permitido |
| /tasks y detalle/create/edit | Consulta, creación y edición; delegación solo con opcional |
| /maintenance y detalle/create/edit | Consulta, creación y edición; delegación solo con opcional |
| /heritage y /heritage/new | Consulta y creación; edit denegado |
| /species y detalle | Consulta; create/edit/observaciones denegados |
| /tourists y /tourists/new | Consulta y registro; edit denegado |
| /reports | Consulta; exportación solo con opcional |
| /users | Acceso solo con users.view; edición solo con users.edit; sin crear usuarios, asignar roles o conceder permisos |
| /chat | Grupal y directo administrativo |
| /profile | Consulta y edición propia |
| /well-monitoring | Denegado |

Navegación base: Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Reportes, Chat y Perfil. Usuarios aparece solo con `users.view`. No hay Sidebar o layout propios de ADMIN.

## Archivos nuevos y modificados

| Archivo | Cambio |
| --- | --- |
| src/config/roles.js | Rol ADMIN, nombre Administrador y opción asignable |
| src/config/permissions.js | Base/opcionales, cálculo efectivo, validación y labels |
| src/services/userService.js | Concesión/revocación auditada, creación con opcionales y limpieza al cambiar rol |
| src/components/admin/UserManagement.jsx | Selección reutilizable de opcionales al crear y gestionar ADMIN |
| src/services/reportService.js | Lecturas filtradas por permiso |
| src/pages/dashboard/DashboardPage.jsx | Usuario como contexto de consulta; pozo y CTA de especies condicionados |
| src/pages/reports/ReportsPage.jsx | Consulta/catálogo limitados a módulos permitidos |
| src/components/records/RecordDetail.jsx | Opción de finalización condicionada a permiso |
| src/components/records/RecordForm.jsx | Opción de finalización condicionada a permiso |
| src/repositories/createScopedRepository.js | Comprobación task.complete durante creación |
| db.json | Nueva cuenta ADMIN activa del parque, sin opcionales |
| src/test/fixtures/admin.js | Fixture ADMIN independiente del Maestro |
| src/config/permissions.test.js | Tests ampliados de base, opcionales y navegación |
| src/services/adminRole.test.js | Nueva suite con servicios reales y transporte en memoria |
| src/components/admin/AdminRole.test.jsx | Nueva suite con Pages, rutas y componentes reales |
| tests/admin-role.spec.js | Nuevo E2E de base y concesión de opcionales con JSON Server temporal |
| README.md, docs/admin.md, docs/master-admin.md | Acceso mock, alcance y documentación actualizada |

## Pruebas y validación

- **212 tests en 32 suites aprobados**: 186 anteriores y 26 adicionales.
- Casos nuevos: base distinta del Maestro, opcionales permitidos, ausencia/presencia de delegación en tareas y mantenimiento, revocación real, ausencia de reasignación, actor/parque, prevención de autoelevación, historial de permisos, creación ADMIN con opcionales, limpieza al cambiar rol, dashboard/reportes sin pozo, exportación condicional, Usuarios sin asignación de roles, URLs denegadas, chat y navegación.
- **2 E2E aprobados**: ADMIN y regresión MASTER_ADMIN. Usan la copia temporal de JSON Server existente; no modifican db.json de trabajo.
- `npm run test:coverage`: aprobado. Cobertura del alcance configurado: 90,47% líneas, 89,42% statements, 82,41% branches y 87,21% functions.
- `npm run lint`: aprobado, sin advertencias.
- `npm run build`: aprobado.

Acceso mock: **admin@mock.gov / secret123**. La seguridad sigue siendo Front-End mock; no se añadió backend real.
