# Guardaparque — PARK_RANGER

Implementación sobre las Pages, Sidebar y AppLayout existentes. Cada decisión de acceso usa permisos centralizados; ADMIN, MASTER_ADMIN y los roles anteriores conservan sus matrices.

Cuenta ficticia: `guardaparque@mock.gov` / `secret123`, parque `1`, usuario activo, sin permisos opcionales iniciales.

## Permisos

23 permisos base: `dashboard.view`; `task.view`, `task.create`, `task.edit`, `task.complete`; `maintenance.view`, `maintenance.create`, `maintenance.edit`; `tourist.view`, `tourist.create`; `heritage.view`, `heritage.create`; `species.view`, `species.create`, `species.edit`, `species.observation.create`; `well.view`; `reports.view`; `incident.view`, `incident.manage`; `chat.group`; `profile.view`, `profile.edit`.

Opcionales asignables desde Usuarios por quien tenga `users.assign_role`: `task.delegate`, `maintenance.delegate`, `chat.direct_admin`. No incluye administración de usuarios, reasignación, exportación ni aprobación patrimonial. La asignación de opcionales reutiliza el historial existente.

## Rutas y navegación

Nueva ruta protegida `/incidents`, renderizada mediante `DashboardPage` con sección de incidencias. Un parámetro `?incident=<id>` abre el reporte en un modal. Las rutas existentes de tareas, mantenimiento, turistas, patrimonio, especies, pozo, reportes, chat y perfil usan los nuevos permisos sin crear Pages.

La navegación compartida muestra Inicio, Tareas, Turistas, Mantenimiento, Patrimonio, Especies, Pozo de Agua, Reportes, Incidencias, Chat y Perfil. Usuarios queda oculto y su URL directa se rechaza. El chat grupal no solicita contactos administrativos; el tab directo aparece solo al conceder su permiso.

## Incidencias y patrimonio

JSON Server contiene un reporte ficticio enviado por un guía, sin incorporar un rol nuevo. La bandeja filtra por `parkId`. Revisar y convertir verifican el usuario persistido activo, permisos y parque; agregan eventos al historial con actor y fecha.

Convertir crea una tarea o mantenimiento relacionado mediante `sourceIncidentId` y guarda `convertedRecord` en el reporte. La descripción, ubicación y evidencia permanecen en el original y se consultan desde el detalle operativo. La atención queda inicialmente asignada al propio Guardaparque; no concede delegación.

Las conversiones se serializan por incidencia dentro del cliente. Un reintento recupera el registro si el POST tuvo éxito y el PATCH del reporte falló. No se permite convertir la misma incidencia nuevamente a otro módulo. JSON Server sigue siendo temporal: no aporta autorización backend ni transacciones entre clientes distintos.

El formulario patrimonial aclara que registrar no significa autorizar, deshabilita Aprobada y el servicio rechaza crear registros aprobados sin `heritage.edit`.

## Archivos de implementación modificados o agregados

- `src/config/roles.js`, `permissions.js`, `navigation.js`: rol, permisos y menú compartido.
- `src/routes/AppRoutes.jsx`, `src/pages/dashboard/DashboardPage.jsx`: ruta y sección de incidencias.
- `src/components/chat/ChatPanel.jsx`: acceso grupal independiente de contactos administrativos; ver [chat compartido](chat.md).
- `src/components/records/RecordForm.jsx`, `RecordDetail.jsx`: distinción patrimonial y referencia al reporte original.
- `src/repositories/createScopedRepository.js`: protege el vínculo de origen y rechaza aprobación patrimonial al crear sin permiso.
- `src/services/incidentService.js`: recepción, revisión y conversión trazable.
- `src/components/incidents/IncidentInbox.jsx`, `IncidentDetails.jsx`, `IncidentReference.jsx`: bandeja y presentación reutilizada del original.
- `db.json`: Guardaparque y reporte ficticios.
- `README.md`, `docs/park-ranger.md`: cuenta y alcance.

## Pruebas

- `src/config/permissions.test.js`: matriz exacta, opcionales y navegación.
- `src/services/parkRangerRole.test.js`: registro/finalización de tarea, especies/observaciones, patrimonio, bloqueo de usuarios, delegación opcional y ambos accesos al chat.
- `src/services/incidentService.test.js`: filtrado de parque, revisión/historial, conversiones a ambos módulos, concurrencia dentro del cliente, recuperación de fallos, rechazo de otro parque y usuario inactivo.
- `src/components/incidents/ParkRangerRole.test.jsx`: rutas reales, revisión/conversión/origen, chat grupal, navegación, acceso a Usuarios rechazado y distinción patrimonial.
- `tests/park-ranger.spec.js`: navegador con login real, creación/finalización de tarea, registro de especie y patrimonio, incidencia a mantenimiento y chat grupal.
- `src/test/fixtures/admin.js`, `src/test/fixtures/incidents.js`, `src/test/mocks/jsonServer.js`: fixtures y servidor mock centralizados.
- `vitest.config.js`: cobertura de los nuevos componentes y servicio.

Validación: `npm test` (234 pruebas), `npm run lint`, `npm run build` y E2E de Guardaparque, ADMIN y MASTER_ADMIN. Los E2E usan una copia temporal de la base.
