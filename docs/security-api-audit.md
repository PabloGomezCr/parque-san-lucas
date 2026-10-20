# Auditoría inicial de seguridad de API — 2026-10-19

## Alcance y evidencia revisada
Se inspeccionaron `README.md`, `package.json`, `src/services/apiClient.js` y `docs/master-admin.md`, `docs/admin.md`, `docs/park-ranger.md` desde GitHub. **No se ejecutaron solicitudes HTTP, pruebas de penetración, escáneres de dependencias ni tests automatizados.** Este informe no certifica seguridad de producción.

## Hallazgos confirmados

### CRÍTICO — La API de desarrollo no aplica autenticación/autorización
`npm run server` inicia `json-server db.json --port 3001`. La documentación del proyecto reconoce que JSON Server no protege endpoints, y que RBAC, autenticación y aislamiento entre parques se aplican en el cliente. Un consumidor HTTP directo no está obligado a ejecutar comprobaciones del frontend. **No desplegar JSON Server públicamente ni introducir datos reales.**

### ALTO — El cliente HTTP no adjunta credenciales de sesión
`src/services/apiClient.js` usa `fetch` con método, cuerpo y cabecera Content-Type, sin token ni mecanismo de sesión para una API protegida. Para migrar a producción se necesita un esquema de sesión seguro, preferiblemente cookies HttpOnly/Secure/SameSite y protección CSRF cuando corresponda, o un mecanismo de tokens diseñado correctamente.

### ALTO — Riesgo de acceso y modificaciones entre roles/parques
La matriz de permisos en `docs/park-ranger.md`, `docs/admin.md` y `docs/master-admin.md` se verifica en servicios frontend. La protección de rutas React no impide peticiones directas a JSON Server. El futuro backend debe autorizar cada operación y cada objeto por usuario, rol, parque y campos editables.

### ALTO — Falta de atomicidad en operaciones de múltiples registros
`docs/park-ranger.md` y `docs/master-admin.md` reconocen que las conversiones/delegaciones y la serialización en cliente no proporcionan transacciones ni seguridad ante concurrencia entre clientes. El backend debe implementar transacciones, restricciones y control de concurrencia.

### CONTEXTO — Credenciales ficticias documentadas
El README publica cuentas de demostración con contraseña `secret123`. Son explícitamente mock. No reutilizarlas en producción ni asumir que son secretos de producción comprometidos.

## Criterios de aceptación para el backend seguro
- Toda ruta protegida sin sesión válida devuelve **401** y no modifica datos.
- Un usuario autenticado sin permiso devuelve **403** (o 404 si la política oculta la existencia del recurso) y no modifica datos.
- PARK_RANGER no puede administrar usuarios, conceder permisos ni asignarse MASTER_ADMIN.
- ADMIN no puede asignar roles ni acceder al pozo sin permisos definidos.
- El aislamiento por `parkId` se verifica **en el servidor** para GET, POST, PATCH, PUT y DELETE; no se confía en el `parkId` del cuerpo.
- Los campos `role`, `optionalPermissions`, `parkId`, `active`, historiales y actor solo se cambian mediante operaciones autorizadas y validadas.
- Las entradas se validan por esquema y las consultas usan parámetros; respuestas de error no revelan secretos.
- Los cambios de estado se registran con actor y fecha; operaciones relacionadas son atómicas.
- Hay pruebas de integración negativas para 401/403, IDOR/BOLA, BFLA, elevación de privilegios, mass assignment y concurrencia, ejecutadas sobre una base temporal aislada.
- No se usa una contraseña o clave real en archivos públicos, variables `VITE_*` ni datos de prueba.

## Siguiente implementación recomendada
1. Definir backend de producción y persistencia (no sustituir JSON Server sin acordar stack y migración de datos).
2. Implementar autenticación real, middleware de autorización y acceso a registros filtrado por identidad del servidor.
3. Agregar pruebas HTTP automatizadas en entorno aislado que verifiquen **estado y ausencia de efectos secundarios**.
4. Integrar análisis de dependencias y secretos en CI y documentar resultados.

**Estado:** auditoría documental inicial y criterios de pruebas; **no hay correcciones de backend implementadas ni pruebas ejecutadas**.
