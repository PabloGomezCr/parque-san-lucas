# Pruebas de Pages

Cada una de las 22 Pages tiene un archivo `.test.jsx` adyacente. Las pruebas usan Vitest, React Testing Library, user-event y jsdom. Los servicios son el límite mock; los hooks, componentes de formularios, diálogos y router se ejecutan realmente.

## Ejecutar

```sh
npm test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run build
```

`npm test` ejecuta Vitest una vez. La suite Playwright existente queda en `npm run test:e2e`. La cobertura HTML se genera en `coverage/index.html`.

## Organización

- `vitest.config.js`: entorno y cobertura; excluye los specs E2E mediante `include`.
- `src/test/setup.js`: jest-dom, limpieza, reset de mocks y adaptaciones de APIs de navegador ausentes en jsdom (dialog, matchMedia y ResizeObserver).
- `src/test/renderWithProviders.jsx`: MemoryRouter con rutas parametrizadas, contexto de sesión configurable, ThemeProvider real y destinos observables después de navegar.
- `src/test/fixtures/`: registros ficticios pequeños y factories reutilizables de tareas, especies y lecturas.
- `src/test/mocks/`: colecciones de servicios y promesas controladas para loading sin delays.
- `src/test/recordPageSuites.jsx`: contratos compartidos de CRUD. Las suites adyacentes seleccionan su Page real, módulo y contrato; no mockean RecordList, RecordForm ni RecordDetail.

## Pages cubiertas

| Módulo | Pages |
| --- | --- |
| Auth | LoginPage |
| Dashboard | DashboardPage |
| Tareas | TasksPage, TaskFormPage, TaskDetailPage |
| Turistas | TouristAttentionPage, TouristAttentionFormPage, TouristAttentionDetailPage |
| Mantenimiento | MaintenancePage, MaintenanceFormPage, MaintenanceDetailPage |
| Patrimonio | HeritagePage, HeritageFormPage, HeritageDetailPage |
| Especies | SpeciesPage, SpeciesFormPage, SpeciesDetailPage |
| Pozo | WellMonitoringPage |
| Reportes | ReportsPage |
| Perfil | ProfilePage |
| Sistema | UnauthorizedPage, NotFoundPage |

ProtectedRoute tiene además su suite adyacente.

Los contratos CRUD cubren carga, rechazo de servicio, empty, búsqueda sin coincidencias, filtros combinados, navegación real, create/edit, validación actual, bloqueo durante guardado, error de guardado, descarte de cambios, registro inexistente, cambio de estado y eliminación con confirmación. Las Pages específicas cubren autenticación, señal loading del logo, métricas derivadas de colecciones reales, Kanban, avistamientos y recarga, última lectura/tendencia/histórico, registro manual del pozo, filtros y CSV mock de reportes, tema/preferencias, perfil y logout.

## Alcance y límites

- La implementación inicial de esta suite no necesitó refactorizar producción para testabilidad. La ampliación posterior de RBAC modifica componentes y servicios y amplía sus tests; conserva los estilos y las 22 Pages.
- ProtectedRoute valida sesión activa, parque y permisos centralizados. Las pruebas también cubren permiso denegado e inactividad. La ampliación MASTER_ADMIN está documentada en [master-admin.md](master-admin.md).
- Las validaciones de formularios son las existentes en `modules`. Estos tests no definen requisitos institucionales ni convierten campos pendientes de validación en requisitos nuevos.
- El login usa el AuthProvider real en su flujo exitoso. Solo se sustituye BrandLogo por un indicador de su prop `loading`, evitando su ciclo de animación temporal.
- Recharts no se mockea ni se prueba internamente: se comprueban resúmenes accesibles, el contenedor del gráfico y los datos visibles de la tabla.
- Exportación verifica contenido/destino CSV generado; la descarga nativa del navegador queda en el alcance E2E.
- Cobertura incluye Pages, ProtectedRoute y componentes/hooks compartidos de CRUD, especies y pozo. El porcentaje no representa todo el frontend ni reemplaza la cobertura de flujos.

## Validación

La primera ejecución detectó cinco consultas ambiguas en tests de validación: el formulario muestra tanto una alerta general como errores por campo. Se corrigió la consulta compartida sin modificar producción.

Resultado inicial de la implementación de tests: 23 suites y 139 tests aprobados. Cobertura del alcance configurado: 86,37% statements, 80,41% branches, 81,72% functions y 87,44% lines. Build y lint aprobados. No se ejecutó Playwright en esta tarea.
