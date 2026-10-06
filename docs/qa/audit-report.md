# Auditoría final · Parque Nacional Isla San Lucas

Fecha: 2 de octubre de 2026.

## Alcance y prioridad

Se inventariaron las 101 carpetas de Stitch, se consolidaron los estados en 22 páginas JSX y se revisó la aplicación funcional. La petición explícita posterior de paleta institucional reemplaza los colores operativos originales; no pretende reproducir esos colores. El documento adjunto de auditoría aportó criterios de revisión, subordinados a esa petición.

## Hallazgos y correcciones

| Severidad | Hallazgo / causa | Corrección | Archivos principales |
|---|---|---|---|
| Alta | Flujos mock incompletos y acceso sin comprobar contraseña | Autenticación mock comprobada, destino protegido, CRUD persistente, errores recuperables | `src/context/AuthContext.jsx`, `src/hooks/`, `src/services/`, `src/repositories/` |
| Alta | Componentes anchos podían propagar su tamaño al documento | Contenedores flex/grid contraíbles, tablas y kanban con scroll local, adaptación de columnas | `src/styles/_responsive.scss`, `src/styles/_layout.scss`, `src/components/common/common.scss`, `src/components/records/` |
| Media | Colores literales dispersos mantenían la paleta azul anterior | Tokens semánticos únicos, superficies neutrales, CTA/selección naranja y acentos de dominio | `src/styles/_tokens.scss`, `src/styles/_components.scss`, `src/config/chartColors.js` |
| Media | Blanco sobre naranja institucional no alcanza AA en texto pequeño (3.95:1) | Texto navy en CTA (4.51:1); estados hover/active compatibles; muted ajustado | `src/styles/_tokens.scss` |
| Media | Identidad no cubierta de forma uniforme por todos los layouts | `BrandLogo` compartido, variantes por tema y geometría SVG original | `src/components/branding/BrandLogo.jsx`, `src/components/layout/`, `public/assets/branding/` |
| Media | Logo, nombre del parque y acciones compiten por ancho en móvil | Isotipo visible y etiqueta redundante oculta hasta 420 px | `src/components/layout/layout.scss` |
| Media | Alternar tema requería consistencia de superficies, series y overlays | Variables por tema, preferencia persistente y seguimiento del sistema | `src/context/ThemeContext.jsx`, `src/styles/_tokens.scss`, componentes de gráficos |

La actualización final de color y branding no modificó la base de datos ni la lógica de negocio. El detalle de archivos de esa actualización está en [branding-changed-files.md](../branding-changed-files.md).

## Verificación

- `npm test`: **9 pruebas aprobadas** (1.2 minutos), Chromium.
- `npm run lint`: aprobado.
- `npm run build`: aprobado, sin advertencias de compilación.
- 22 páginas visitadas y capturadas; sin errores JavaScript en ese recorrido.
- Diez rutas representativas comprobadas a 320, 375, 390, 768, 1024, 1280 y 1440 px: sin desbordamiento horizontal del documento. Tablas y kanban conservan desplazamiento local.
- Nueve módulos revisados en claro/oscuro: branding presente y geometría de encabezado, métricas y sidebar estable al alternar tema.
- 42 combinaciones de contraste de texto, superficies, CTA y estados: todas alcanzan 4.5:1. Valores en [contrast.json](contrast.json). Esto verifica las combinaciones medidas, no constituye una certificación integral de accesibilidad.
- Pruebas funcionales de autenticación, CRUD, errores/reintento, evidencia con ID alfanumérico, CSV filtrado, pozo, preferencias y sesión.
- Las pruebas usan una copia temporal de `db.json`, sin modificar los registros de trabajo.

## Fidelidad y límites

Se conservaron la familia Inter, jerarquías, shell y patrones de cards, formularios, tablas y navegación tomados de Stitch, consolidando pantallas de estado en componentes. La comparación visual es cualitativa: no se afirma igualdad píxel a píxel. Datos variables, textos mock, formularios compartidos y nueva paleta producen diferencias deliberadas. Se recuperaron 24 imágenes enlazadas; cinco enlaces originales respondieron 403 (procedencia en `public/assets/references/sources.json`).

Sensores, conectividad, formatos institucionales y autenticación siguen siendo demostraciones locales; no hay integración con hardware ni backend de producción.

## Evidencia visual

- [dashboard-dark](screenshots/dashboard-dark.png)
- [dashboard](screenshots/dashboard.png)
- [heritage-1](screenshots/heritage-1.png)
- [heritage-dark](screenshots/heritage-dark.png)
- [heritage-new](screenshots/heritage-new.png)
- [heritage](screenshots/heritage.png)
- [login](screenshots/login.png)
- [maintenance-1](screenshots/maintenance-1.png)
- [maintenance-dark](screenshots/maintenance-dark.png)
- [maintenance-new](screenshots/maintenance-new.png)
- [maintenance](screenshots/maintenance.png)
- [mobile-brand-dark](screenshots/mobile-brand-dark.png)
- [no-existe](screenshots/no-existe.png)
- [profile-1024](screenshots/profile-1024.png)
- [profile-1280](screenshots/profile-1280.png)
- [profile-1440](screenshots/profile-1440.png)
- [profile-320](screenshots/profile-320.png)
- [profile-375](screenshots/profile-375.png)
- [profile-390](screenshots/profile-390.png)
- [profile-768](screenshots/profile-768.png)
- [profile-dark](screenshots/profile-dark.png)
- [profile](screenshots/profile.png)
- [reports-dark](screenshots/reports-dark.png)
- [reports](screenshots/reports.png)
- [species-1](screenshots/species-1.png)
- [species-dark](screenshots/species-dark.png)
- [species-new](screenshots/species-new.png)
- [species](screenshots/species.png)
- [tasks-1](screenshots/tasks-1.png)
- [tasks-dark](screenshots/tasks-dark.png)
- [tasks-new](screenshots/tasks-new.png)
- [tasks](screenshots/tasks.png)
- [tourists-1](screenshots/tourists-1.png)
- [tourists-dark](screenshots/tourists-dark.png)
- [tourists-new](screenshots/tourists-new.png)
- [tourists](screenshots/tourists.png)
- [unauthorized](screenshots/unauthorized.png)
- [well-monitoring-dark](screenshots/well-monitoring-dark.png)
- [well-monitoring](screenshots/well-monitoring.png)

## Validación del logo animado

Suite ampliada: 10 pruebas aprobadas. La nueva prueba mantiene pendiente la petición de autenticación para verificar el botón deshabilitado y la animación, devuelve un error y comprueba el reposo. También verifica reduced motion y tamaños del logo a 320/375/390/768/1024/1440 px. Se comprobó explícitamente que el SVG del header móvil sea visible. Build y lint aprobados. No se añadieron páginas ni se modificó authService. Capturas: [carga](screenshots/login-loading.png) y [oscuro estático](screenshots/login-dark-static.png).

## Referencia maestra PNG y aleteo definitivo

La petición posterior reemplaza los SVG anteriores de Stitch por `pelicano-logo-san-lucas.png`. Se conserva el PNG sin modificar, comprobado por SHA-256, para todos los logos estáticos y el favicon. La capa SVG animada se genera exclusivamente de sus contornos; no se dibujan alas nuevas. Grupos: `wing-left`, `body`, `wing-right`. Ciclo: 1.1 s ease-in-out, alas ±1.3°, elevación del conjunto 2 px. No hay escalado del símbolo.

Suite: **11 pruebas aprobadas**. Tras la compensación subpíxel del borde se repitieron las dos pruebas afectadas: aprobadas. Build y lint finales correctos. Se conservan las 22 páginas y el acceso por Promise sin demoras artificiales.

La comparación de siluetas a 1254 × 1254 arroja **99.083% de intersección sobre unión** (1042 píxeles diferentes, principalmente bordes, de 113346 píxeles de primer plano originales). Es una aproximación vectorial medida, no identidad raster absoluta; el estado normal sí usa el archivo original intacto. El fondo naranja durante movimiento se reconstruyó de los píxeles de fondo del mismo PNG para no dejar otra silueta debajo de las alas.

Evidencia: [métrica](branding/fidelity.json), [SVG renderizado](branding/preview.png), [superposición de diferencias](branding/diff.png), [login en carga](screenshots/login-loading.png). En la superposición: gris = coincidencia, rojo = solo PNG y verde = solo SVG. Procedencia y reproducción: [README de branding](../../public/assets/branding/README.md).

## Revisión posterior de las indicaciones

Se comprobó el uso exclusivo del PNG maestro y sus derivados, la ausencia de referencias activas a los pelícanos anteriores y de temporizadores en el login. `isLoading` gobierna la animación y el botón mientras se espera `authService`; `aria-busy` comunica la carga. Se mantienen los 22 archivos de páginas.

Se corrigió un estado retenido al activar reduced motion durante una solicitud: como CSS cancela el ciclo sin emitir su evento final, ahora el componente limpia ese estado al cambiar la preferencia. Una prueba reproduce carga → reduced motion → error de autenticación → movimiento permitido y comprueba que las alas no vuelven a animarse. La comprobación de fidelidad exige ahora más del 99% de intersección sobre unión; la medición sigue siendo 99.083%. La salvedad de identidad raster absoluta del SVG permanece: en reposo se presenta el PNG intacto.

Resultado de esta revisión: **12 pruebas aprobadas**, lint y build correctos. Después del ajuste final de `aria-busy`, se repitieron las tres pruebas afectadas de autenticación, animación y cambio de preferencia: aprobadas.

## Cierre de alas tras autenticación exitosa

Se corrigió el desmontaje prematuro de Login al resolverse la autenticación. `isLoading` ahora termina con la Promise; si hay un ciclo activo, el formulario permanece deshabilitado mostrando «Acceso verificado» hasta el regreso de las alas a posición cero. `BrandLogo` comunica ese momento con `onMotionChange`; no se añade un temporizador ni una espera artificial al servicio. Reduced motion cancela el cierre y permite navegar de inmediato.

Se añadieron dos pruebas que detienen la animación a mitad de ciclo, resuelven una autenticación válida y comprueban que el cambio de página espera al reposo, o se produce al activar reduced motion. También se revisan error de credenciales, destino protegido y recuperación del estado estático.
