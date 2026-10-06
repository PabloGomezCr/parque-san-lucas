# Parque Nacional Isla San Lucas

Aplicación React + Vite para tareas, atención a turistas, mantenimiento, patrimonio, especies, pozo y reportes. Reconstruye las referencias Stitch con SCSS y la paleta institucional indicada por el usuario.

## Ejecutar

Requiere Node.js **22.12+** (verificado con Node 24).

```bash
npm install
npm run server
```

En otra terminal:

```bash
npm run dev
```

JSON Server usa el puerto 3001; Vite muestra su URL al iniciar. `.env.example` permite configurar `VITE_API_URL`.

**Guardaparque mock:** `guardaparque@mock.gov` / `secret123`, sin delegación por defecto. [Implementación PARK_RANGER](docs/park-ranger.md).

**Administrador mock:** `admin@mock.gov` / `secret123`, sin opcionales por defecto. [Permisos configurables de ADMIN](docs/admin.md).

**Administrador Maestro mock:** `master.admin@mock.gov` / `secret123`. RBAC, delegación, usuarios y chat: [implementación MASTER_ADMIN](docs/master-admin.md).

**Acceso mock:** `sofia.arias@mock.gov` / `secret123`. El perfil permite cambiar la contraseña de demostración.

## Organización

- `src/pages`: 22 páginas; crear/editar comparten formulario y ruta parametrizada.
- `src/components`: navegación, formularios, listados, diálogos y estados compartidos.
- Datos: Page → Hook → Service → Repository → Fetch API → JSON Server.
- `db.json`: colecciones locales del parque y chat; métricas calculadas, sin contadores persistidos. Los registros son mock.
- `src/styles/_tokens.scss`: colores semánticos light/dark; tema automático mediante Context.
- `src/components/branding/BrandLogo.jsx`: branding global. Assets y procedencia en `public/assets/branding/`; imágenes Stitch en `public/assets/references/`; Inter local en `public/assets/fonts/`.

Autenticación, roles, coordenadas, sensores, umbrales y formatos institucionales son **mock / por validar**. No hay comunicaciones de hardware. La exportación genera CSV de demostración.

## Validación

```bash
npm run lint
npm run build
npm test
npm run test:coverage
npx playwright install chromium
npm run test:e2e
```

Los tests de Vitest usan jsdom, servicios mock y no requieren servidores. Cada Page tiene su `.test.jsx` al lado; los providers, fixtures y contratos CRUD se comparten en `src/test/`. Detalles y alcance: [pruebas de Pages](docs/page-tests.md).

Las pruebas E2E levantan servidores en 3101/5175 con una copia temporal de `db.json`. No modifican la base de trabajo. Capturas y contraste: `docs/qa/`. Auditoría de pantallas: `docs/stitch-audit.md`; migración cromática: `docs/color-system.md`.

Chat interno compartido: [modelo de datos, componentes, permisos y pruebas](docs/chat.md).

Documento maestro oficial: [contrato de arquitectura y matriz resumida de roles](docs/prompt-maestro.md).

La [integración meteorológica](docs/weather.md) documenta estados visibles, configuración Open-Meteo/mock, caché local en memoria/localStorage, permisos y comprobación manual.
