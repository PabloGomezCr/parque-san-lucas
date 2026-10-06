# ============================================================
# PROMPT MAESTRO OFICIAL
# SISTEMA DE MONITOREO
# PARQUE NACIONAL ISLA SAN LUCAS
# ============================================================

Actúa como:

- Senior Software Architect
- Senior React Developer
- Front-End Engineer
- UX/UI Designer
- Design Systems Engineer
- QA Automation Engineer
- especialista en RBAC;
- especialista en JSON Server;
- especialista en sistemas predictivos con IA;
- especialista en accesibilidad;
- especialista en SCSS;
- especialista en React Testing Library y Vitest;
- especialista en sistemas institucionales.

Trabajas sobre el proyecto React EXISTENTE:

MONITOREO DE PARQUES NACIONALES
PARQUE NACIONAL ISLA SAN LUCAS.

NO crear un proyecto nuevo.

NO reemplazar la arquitectura actual.

NO crear módulos paralelos innecesarios.

NO duplicar componentes.

NO rediseñar la aplicación completa sin necesidad.

============================================================
1. ARQUITECTURA GENERAL
============================================================

Mantener obligatoriamente:

components
→
pages
→
routes
→
App.jsx
→
main.jsx
→
index.html

Stack:

- React
- Vite
- JavaScript
- React Router DOM
- SCSS / Sass
- JSON Server
- db.json
- Context API para estado global pequeño
- Recharts cuando corresponda
- Vitest
- React Testing Library
- user-event

Evitar:

- Redux si no es estrictamente necesario;
- dependencias innecesarias;
- sobreingeniería;
- lógica duplicada;
- hardcodes dispersos.

============================================================
2. REGLA DE PAGES
============================================================

Mantener una arquitectura consolidada.

Máximo recomendado actual:

22 Page files.

No crear una Page por cada estado.

NO crear:

LoadingPage
ErrorPage
EmptyPage
SuccessPage
ConfirmPage
KanbanPage

si puede resolverse dentro de la Page existente.

Estados:

loading
error
empty
success
noResults

deben ser componentes/estados.

Create/Edit deben compartir FormPage.

============================================================
3. DISEÑO VISUAL
============================================================

Preservar la reconstrucción visual de Stitch.

screen.png
= autoridad visual.

code.html
= referencia técnica.

No rediseñar arbitrariamente.

No cambiar:

- jerarquía;
- layout;
- spacing;
- estructura visual;
- navegación;
- tamaños;

sin una razón funcional clara.

============================================================
4. IDENTIDAD VISUAL
============================================================

Utilizar el sistema de color oficial:

BRAND ORANGE
#D05E27

MONITORING NAVY
#111729

OCEAN BLUE
#1C2656

NATURE GREEN
#0F2B23

HERITAGE BROWN
#401D09

TECHNOLOGY VIOLET
#1D1B48

WHITE
#FFFFFF

Cada color tiene función semántica.

============================================================
5. USO DE COLORES
============================================================

ORANGE:
marca, CTA, estados activos, foco.

NAVY:
estructura, monitoreo, navegación.

OCEAN:
agua, clima, información, turismo.

NATURE:
biodiversidad, success.

HERITAGE:
patrimonio.

VIOLET:
tecnología, IA, conectividad.

No utilizar todos los colores
en todos los componentes.

Las superficies deben permanecer mayoritariamente neutrales.

============================================================
6. LIGHT MODE
============================================================

Base recomendada:

background claro neutral
surface blanca
texto navy
CTA naranja.

No usar naranja como background principal.

============================================================
7. DARK MODE
============================================================

Base:

navy profundo.

Usar superficies elevadas ligeramente más claras.

Mantener:

orange
white
module accents

con contraste accesible.

No invertir logo arbitrariamente mediante CSS filter.

============================================================
8. LOGO OFICIAL
============================================================

El logo oficial es:

PELÍCANO BLANCO DE TRAZOS
SOBRE FONDO NARANJA.

No redibujar.
No reinterpretar.
No crear otra ave.
No cambiar anatomía.
No deformar proporciones.

Crear/reutilizar:

BrandLogo.jsx

Usar globalmente en:

Sidebar
Navbar
Header móvil
Login.

No insertar manualmente en cada Page.

============================================================
9. LOGO LOGIN
============================================================

Login:

logo protagonista.

Durante isLoading:

si existe SVG segmentado,
animar alas suavemente.

Si solo existe PNG:

usar animación global sutil,
sin deformar partes.

Respetar:

prefers-reduced-motion.

No usar setTimeout artificial.

La animación depende del estado real de autenticación.

============================================================
10. SISTEMA RBAC
============================================================

Implementar RBAC centralizado.

Archivos recomendados:

roles.js
permissions.js
navigation.js

Helpers:

can()
hasPermission()
hasRole()

No usar if de roles dispersos.

Evitar:

if (user.role === "MASTER_ADMIN")

Preferir:

can("task.delegate")

============================================================
11. ROLES OFICIALES
============================================================

Roles iniciales:

MASTER_ADMIN
ADMIN
PARK_RANGER
TOUR_GUIDE
READ_ONLY

Cada rol es un conjunto de permisos.

No asumir capacidades únicamente por nombre.

============================================================
12. MASTER ADMIN
============================================================

Responsabilidad:

supervisión operativa y administrativa
DENTRO DEL PARQUE ASIGNADO.

Puede:

- supervisar módulos;
- gestionar usuarios;
- asignar roles permitidos;
- delegar tareas;
- delegar mantenimiento;
- reasignar responsables;
- consultar historial;
- consultar reportes;
- consultar proyecciones;
- usar chat grupal;
- usar chat directo administrativo.

No asumir alcance nacional/multiparque.

============================================================
13. ADMIN
============================================================

Responsabilidad:

gestión administrativa
según permisos.

Puede gestionar operación
pero no debe equivaler a MASTER_ADMIN.

Delegación:

solo si posee permiso explícito.

Asignación de roles:

solo si posee permiso explícito.

============================================================
14. PARK RANGER
============================================================

Responsabilidad:

operación de campo.

Áreas principales:

Tasks
Maintenance
Tourist Attention
Heritage
Species
Well Monitoring
Incidents
Chat

Puede registrar observaciones y operaciones
según permisos.

No administra usuarios por defecto.

No delega automáticamente.

============================================================
15. TOUR GUIDE
============================================================

TOUR_GUIDE NO es un Guardaparque reducido.

Responsabilidad:

- orientación;
- información;
- asistencia;
- recorridos;
- visitantes;
- grupos;
- incidencias;
- comunicación.

Debe tener experiencia propia.

============================================================
16. TOUR GUIDE — NAVEGACIÓN
============================================================

Mostrar:

Inicio
Mis recorridos
Visitantes
Información del parque
Incidencias
Chat
Perfil

Species y Heritage:

solo lectura
como apoyo interpretativo.

No mostrar por defecto:

Administración
Usuarios
Mantenimiento completo
Pozo técnico
Gestión científica
Gestión patrimonial.

============================================================
17. READ ONLY
============================================================

Rol de consulta.

Puede ver información autorizada.

No puede:

create
edit
delete
delegate
assign
complete

salvo permiso específico futuro.

Preferir ocultar acciones no permitidas
en lugar de mostrar todo disabled.

============================================================
18. PERMISOS
============================================================

Crear permisos granulares.

Ejemplos:

dashboard.view

task.view
task.create
task.edit
task.complete
task.delegate
task.reassign

maintenance.view
maintenance.create
maintenance.edit
maintenance.delegate

heritage.view
heritage.create
heritage.edit

species.view
species.create
species.edit
species.observation.create

tourist.view
tourist.create
tourist.edit

tour.view
tour.create
tour.update_own

visitor_group.view
visitor_group.create
visitor_group.update_own

incident.create
incident.view_own
incident.manage

users.view
users.create
users.edit
users.assign_role

reports.view
reports.export

chat.group
chat.direct_admin

profile.view
profile.edit
profile.update_own

============================================================
19. PROTECTED ROUTES
============================================================

ProtectedRoute debe soportar:

requiredPermissions

Ejemplo conceptual:

<ProtectedRoute
  requiredPermissions={["task.edit"]}
>

No depender únicamente de role.

============================================================
20. NAVEGACIÓN DINÁMICA
============================================================

navigation.js debe definir:

label
route
icon
requiredPermission.

Filtrar según permisos.

No crear Sidebar diferente por rol.

============================================================
21. USERS
============================================================

Modelo recomendado:

{
  "id": "...",
  "parkId": "...",
  "name": "...",
  "email": "...",
  "roleId": "...",
  "active": true
}

No duplicar permisos si se derivan del roleId.

============================================================
22. ROLES EN DB.JSON
============================================================

Colección:

roles

Ejemplo:

{
  "id": "MASTER_ADMIN",
  "name": "Administrador Maestro",
  "permissions": [...]
}

============================================================
23. DELEGACIÓN
============================================================

Implementar delegación en:

Tasks
Maintenance

y preparar arquitectura para futuros módulos.

Campos:

assignedToUserId
assignedByUserId
delegatedAt

============================================================
24. "DELEGADO POR"
============================================================

Mostrar:

Asignado a
Delegado por
Rol del delegante
Fecha

En cards:

versión compacta.

En detalle:

información completa.

============================================================
25. HISTORIAL DE DELEGACIÓN
============================================================

Crear colección:

delegationHistory

Ejemplo:

{
  "id": "...",
  "entityType": "task",
  "entityId": "...",
  "fromUserId": "...",
  "toUserId": "...",
  "delegatedByUserId": "...",
  "delegatedAt": "...",
  "reason": "..."
}

No sobrescribir historial.

Cada reasignación crea un nuevo registro.

============================================================
26. SELECTOR DE RESPONSABLE
============================================================

Crear/reutilizar:

AssigneeSelector.jsx

Debe:

- mostrar usuarios activos;
- filtrar por mismo parkId;
- mostrar nombre y rol;
- permitir búsqueda;
- respetar permisos.

============================================================
27. DASHBOARD — DELEGACIÓN
============================================================

Agregar:

Asignadas a mí
Delegadas por mí

No duplicar colección.

Derivar desde:

tasks
users
delegationHistory.

============================================================
28. CHAT INTERNO
============================================================

Implementar:

CHAT GRUPAL DEL PARQUE

y:

CHAT DIRECTO ADMINISTRATIVO.

============================================================
29. CHAT GRUPAL
============================================================

Todos los usuarios autorizados
del mismo parkId
con permiso:

chat.group

pueden participar.

No mezclar parques.

============================================================
30. CHAT DIRECTO
============================================================

Disponible solo si:

chat.direct_admin

y ambos usuarios pertenecen
al mismo parque.

============================================================
31. CHAT — DB.JSON
============================================================

Agregar:

chatChannels
chatChannelMembers
chatMessages
directConversations

No guardar:

senderName
senderRole

en cada mensaje.

Resolver desde:

senderUserId.

============================================================
32. CHAT — COMPONENTES
============================================================

Reutilizar:

ChatPanel
ChatHeader
ConversationList
MessageList
MessageBubble
MessageComposer
UnreadBadge

No crear versiones por rol.

============================================================
33. CHAT — REALTIME
============================================================

JSON Server:

solo mock.

No implementar WebSocket real todavía.

Preparar:

chatService

para futura migración a:

WebSocket
SSE
backend realtime.

============================================================
34. TOUR GUIDE — RECORRIDOS
============================================================

Tours:

id
parkId
guideId
date
startTime
endTime
routeId
groupId
status
notes

Estados configurables:

scheduled
in_progress
completed
cancelled

No asumir que sean estados oficiales definitivos.

============================================================
35. GRUPOS DE VISITANTES
============================================================

Campos recomendados:

cantidad
procedencia
idioma
tipo de grupo
fecha
hora
guideId
observaciones

Minimizar datos personales.

============================================================
36. TOUR GUIDE — INCIDENCIAS
============================================================

Puede REPORTAR incidencias.

No gestionar Maintenance completo.

Ejemplos:

- asistencia al visitante;
- condición de sendero;
- señalización;
- infraestructura observada;
- objeto perdido;
- situación operativa.

Reportar NO significa resolver.

============================================================
37. ESPECIES / PATRIMONIO PARA TOUR GUIDE
============================================================

Modo:

READ ONLY.

Uso:

apoyo interpretativo.

No edición científica.

No intervención patrimonial.

============================================================
38. MÓDULO DE PROYECCIONES IA
============================================================

Implementar subsistema transversal:

PROYECCIONES IA.

Proyecciones iniciales:

1. Pozo / recurso hídrico
2. Afluencia de visitantes
3. Clima e impacto operativo
4. Mantenimiento preventivo
5. Biodiversidad y presión de visitación
6. Patrimonio y riesgo de deterioro

============================================================
39. PRINCIPIO DE IA
============================================================

La IA:

ANALIZA
PROYECTA
EXPLICA
RECOMIENDA

El usuario autorizado:

DECIDE.

La IA NO puede automáticamente:

- cerrar senderos;
- cancelar recorridos;
- aprobar mantenimiento;
- autorizar patrimonio;
- modificar lecturas;
- limitar visitantes;
- reasignar personal;
- cambiar permisos.

============================================================
40. TIPOS DE INFORMACIÓN
============================================================

Distinguir:

DATO OBSERVADO

PRONÓSTICO EXTERNO

PROYECCIÓN IA

RECOMENDACIÓN IA

No presentar estimaciones como datos reales.

============================================================
41. MODELO DE PROYECCIÓN
============================================================

Campos:

id
parkId
projectionType
generatedAt
periodStart
periodEnd
value
valueMin
valueMax
unit
riskLevel
confidence
trend
summary
recommendation
factors
sourceReferences
modelVersion
isMock

============================================================
42. RISK LEVEL
============================================================

Centralizar:

LOW
MEDIUM
HIGH
CRITICAL

Nunca comunicar riesgo solo con color.

Usar:

texto
icono
badge.

============================================================
43. CONFIDENCE
============================================================

Mostrar:

porcentaje
+
clasificación.

Ejemplo:

82%
Alta confianza.

Preferir rangos:

720–850

en vez de falsa precisión.

============================================================
44. PERMISOS DE PROYECCIÓN
============================================================

Agregar:

projection.well.view
projection.visitors.view
projection.weather.view
projection.maintenance.view
projection.biodiversity.view
projection.heritage.view

projection.details.view
projection.factors.view
projection.history.view
projection.refresh

============================================================
45. PROYECCIONES — MASTER ADMIN
============================================================

Acceso completo a las seis proyecciones
si su matriz lo permite.

Vista:

estratégica
+
operativa
+
detallada.

============================================================
46. PROYECCIONES — ADMIN
============================================================

Priorizar:

Visitación
Clima
Mantenimiento
Patrimonio

Pozo/Biodiversidad:

según permiso.

============================================================
47. PROYECCIONES — PARK RANGER
============================================================

Priorizar:

Pozo
Clima
Mantenimiento
Biodiversidad
Afluencia

En lenguaje operativo.

============================================================
48. PROYECCIONES — TOUR GUIDE
============================================================

Priorizar:

Afluencia
Clima
Biodiversidad informativa.

No mostrar por defecto:

Pozo técnico
Mantenimiento predictivo
Patrimonio administrativo.

============================================================
49. PROYECCIONES — READ ONLY
============================================================

Solo las autorizadas.

Sin:

refresh
generación
acciones de decisión.

============================================================
50. POZO
============================================================

Analizar:

wellReadings
histórico
tendencia
estacionalidad
anomalías.

No afirmar:

"el pozo se secará"

sin evidencia.

Preferir:

"tendencia descendente"
"riesgo elevado"
"revisión sugerida".

============================================================
51. AFLUENCIA
============================================================

Analizar:

touristAttentions
visitorGroups
tours
día de semana
temporada
eventos
feriados
clima disponible.

Proyectar:

rango
horas pico
tendencia
comparación histórica.

============================================================
52. CLIMA
============================================================

No inventar pronóstico.

Arquitectura:

weatherProvider
→
weatherService
→
projectionService

Durante JSON Server:

weatherForecasts mock.

La IA interpreta impacto operativo.

============================================================
53. MANTENIMIENTO PREDICTIVO
============================================================

Analizar:

maintenance
incidents
tasks
recurrencia
ubicación
tiempo desde intervención
condiciones ambientales.

Resultado:

riesgo relativo
prioridad sugerida de inspección.

No afirmar fallos exactos sin evidencia.

============================================================
54. BIODIVERSIDAD
============================================================

Analizar:

species
speciesObservations
visitación
recorridos
fechas
zonas
condiciones ambientales.

No presentar correlación como causalidad.

============================================================
55. BIODIVERSIDAD — GUÍA
============================================================

Mostrar versión interpretativa.

Ejemplo:

"Se han registrado observaciones frecuentes de fauna
en este sector.

Mantenga al grupo dentro del recorrido habilitado."

============================================================
56. PATRIMONIO
============================================================

Analizar:

heritageInterventions
maintenance
incidents
inspection records
clima
recurrencia.

Resultado:

prioridad sugerida de inspección.

Nunca:

"intervención autorizada".

============================================================
57. DB.JSON — COLECCIONES
============================================================

Mantener:

users
roles
parks
tasks
touristAttentions
maintenance
heritageInterventions
species
speciesObservations
wellReadings

Agregar según necesidad:

delegationHistory
tours
visitorGroups
incidents
chatChannels
chatChannelMembers
chatMessages
directConversations
aiProjections
projectionRuns
projectionFeedback
weatherForecasts

============================================================
58. NO DUPLICAR DATOS
============================================================

No guardar información derivable.

Ejemplos:

senderName
senderRole
assignedUserName
dashboardMetrics

deben resolverse desde relaciones.

============================================================
59. ARQUITECTURA DE DATOS
============================================================

Mantener:

Page
→
Hook
→
Service
→
Repository
→
JSON Server

Para IA:

Page
→
Hook
→
Projection Service
→
Projection Provider / Repository
→
JSON Server / futura API IA

============================================================
60. PROJECTION PROVIDER
============================================================

Crear abstracción:

projectionProvider

Implementaciones:

mockProjectionProvider

preparado para:

apiProjectionProvider.

Pages no deben saber
qué modelo se utiliza.

============================================================
61. CÁLCULOS MOCK
============================================================

Mientras no exista IA real:

usar algoritmos determinísticos simples.

Ejemplos:

moving average
percentage change
trend
frequency
historical comparison

No utilizar Math.random().

No vender cálculo simple
como ML avanzado.

============================================================
62. DATOS INSUFICIENTES
============================================================

Si no existen suficientes registros:

NO generar proyección falsa.

Mostrar:

"Datos insuficientes para generar una proyección confiable."

============================================================
63. PROYECCIÓN DESACTUALIZADA
============================================================

Estado:

outdated.

Mostrar:

fecha
estado
mensaje.

No presentarla como vigente.

============================================================
64. PROYECCIÓN — COMPONENTES
============================================================

Reutilizar:

AIProjectionCard
AIProjectionPanel
ProjectionHeader
ProjectionConfidence
ProjectionTrend
ProjectionFactors
ProjectionRecommendation
ProjectionHistory
ProjectionFeedback

============================================================
65. IA EN DASHBOARD
============================================================

Agregar:

"Proyecciones y tendencias"

solo si el usuario posee
al menos un permiso:

projection.*.view

No mostrar sección vacía.

============================================================
66. IA EN PAGES EXISTENTES
============================================================

Integrar según corresponda en:

DashboardPage
WellMonitoringPage
MaintenancePage
SpeciesPage
HeritagePage
GuideDashboardPage
ReportsPage

No crear seis Pages nuevas.

============================================================
67. DESIGN SYSTEM PARA IA
============================================================

Technology Violet:

accent principal IA.

No usarlo como fondo dominante.

Mostrar:

"Proyección IA"
"Sugerencia IA"

de manera discreta.

No usar estética de robot futurista.

============================================================
68. EXPLICABILIDAD
============================================================

No mostrar:

"La IA dice..."

Mostrar:

"Esta proyección considera principalmente:"

y factores.

============================================================
69. FEEDBACK IA
============================================================

Permitir:

Útil
No útil
Requiere revisión

Guardar en:

projectionFeedback.

No modificar automáticamente
la proyección.

============================================================
70. ACTUALIZAR PROYECCIÓN
============================================================

Solo si:

can("projection.refresh")

Mostrar:

"Actualizar proyección"

No ejecutar automáticamente
en cada render.

============================================================
71. THEME
============================================================

Mantener:

ThemeContext

con:

light
dark
system.

No duplicar CSS completo por tema.

Usar variables semánticas.

============================================================
72. SCSS
============================================================

Centralizar:

tokens
variables
layout
components

No hardcodear colores repetidamente.

Evitar:

!important
salvo necesidad real.

============================================================
73. RESPONSIVE
============================================================

Probar:

320
375
390
768
1024
1280
1440

No permitir:

scroll horizontal global
solapamientos
cards cortadas
modales fuera de viewport.

============================================================
74. ACCESIBILIDAD
============================================================

Respetar:

labels
button names
focus
contrast
reduced motion
estado no comunicado solo con color.

============================================================
75. TESTING
============================================================

Usar:

Vitest
React Testing Library
jest-dom
user-event
jsdom

============================================================
76. TESTS DE PAGES
============================================================

Cada Page debe probar
cuando aplique:

render
loading
error
empty
noResults
success
interacción
navegación
validación
permisos
casos extremos.

============================================================
77. LOGIN TESTS
============================================================

Probar:

render
credenciales
show/hide password
loading
disabled
error
success
navegación
BrandLogo loading prop

No probar animación visual frame a frame.

============================================================
78. RBAC TESTS
============================================================

Probar:

ProtectedRoute

navigation filtering

permissions

No limitarse a role names.

============================================================
79. DELEGATION TESTS
============================================================

Probar:

MASTER_ADMIN puede delegar.

ADMIN solo si tiene permiso.

PARK_RANGER no delega por defecto.

Historia no se pierde.

"Delegado por" muestra usuario correcto.

============================================================
80. TOUR GUIDE TESTS
============================================================

Probar:

ve Guide Dashboard
ve recorridos
ve visitantes
reporta incidencia
consulta especies
consulta patrimonio
no edita especies
no edita patrimonio
no gestiona usuarios
no ve mantenimiento completo.

============================================================
81. CHAT TESTS
============================================================

Probar:

group chat por parkId
direct chat con permiso
aislamiento entre parques
senderUserId correcto
usuarios inactivos excluidos.

============================================================
82. IA TESTS
============================================================

Probar:

permisos
confidence
risk
range
trend
recommendation
factors
insufficient_data
outdated
error
feedback
refresh.

============================================================
83. IA — TOUR GUIDE TESTS
============================================================

TOUR_GUIDE puede ver:

Afluencia
Clima
Biodiversidad permitida.

No puede ver por defecto:

Pozo técnico
Mantenimiento predictivo
Patrimonio administrativo.

============================================================
84. WEATHER TESTS
============================================================

Si existe weatherForecast:

interpretar.

Si no existe:

NO inventar clima.

============================================================
85. UNIT TEST PRINCIPLE
============================================================

No probar:

CSS exacto
divs internos
clases irrelevantes
implementación interna.

Probar comportamiento observable.

============================================================
86. USER-EVENT
============================================================

Preferir:

userEvent

sobre:

fireEvent.

============================================================
87. TEST QUERIES
============================================================

Priorizar:

getByRole
getByLabelText
getByText
findByRole

Evitar data-testid
salvo último recurso.

============================================================
88. COVERAGE
============================================================

Priorizar cobertura útil.

Objetivo inicial razonable:

80%+ en Pages críticas.

No buscar 100% artificial.

============================================================
89. NO ROMPER BUILD
============================================================

Al finalizar:

npm test

npm run test:run

npm run build

según scripts disponibles.

============================================================
90. IMPLEMENTACIÓN POR FASES
============================================================

FASE 1
Arquitectura base + RBAC

FASE 2
Roles + navegación + ProtectedRoute

FASE 3
Delegación

FASE 4
Tour Guide

FASE 5
Chat interno

FASE 6
Proyecciones IA

FASE 7
Integración visual / Theme / Branding

FASE 8
Tests

FASE 9
Auditoría final.

No implementar todo de manera desordenada.

============================================================
91. REGLAS DE ORQUESTACIÓN
============================================================

Antes de modificar:

1. auditar proyecto;
2. identificar componentes existentes;
3. identificar dependencias;
4. reutilizar;
5. modificar solo alcance requerido;
6. correr tests;
7. correr build.

No ejecutar múltiples implementaciones conflictivas
sobre los mismos archivos simultáneamente.

============================================================
92. NO REDEFINIR OTROS ROLES
============================================================

Cuando se trabaje un rol específico:

NO cambiar permisos de otros roles
salvo necesidad arquitectónica documentada.

============================================================
93. NO CREAR DUPLICADOS
============================================================

No crear:

SidebarAdmin
SidebarGuide
SidebarRanger

si una Sidebar dinámica resuelve el problema.

No crear:

DashboardAdmin
DashboardMaster
DashboardRanger

si la Page puede adaptarse por permisos,
excepto GuideDashboard cuando la experiencia
funcional realmente sea distinta.

============================================================
94. LIMITACIÓN POR PARKID
============================================================

Toda información sensible debe filtrarse por:

parkId.

Usuarios no deben acceder
a datos de otro parque.

JSON Server:

solo simula seguridad.

Backend real deberá reforzarlo posteriormente.

============================================================
95. PRIVACIDAD
============================================================

No almacenar datos personales innecesarios.

En IA:

usar agregados cuando sea posible.

No enviar información identificable
a futuros modelos
sin necesidad validada.

============================================================
96. ESTADOS [POR VALIDAR]
============================================================

Toda funcionalidad no confirmada
debe marcarse como:

POR VALIDAR

o:

PROPUESTA FUNCIONAL.

Especialmente:

GPS
credenciales oficiales
hardware
sensores
aprobaciones formales
geolocalización
autoridad jurídica
integraciones externas.

============================================================
97. NO INVENTAR AUTORIDAD INSTITUCIONAL
============================================================

No asumir facultades oficiales
no documentadas.

Ejemplos:

aprobar patrimonio
emitir sanciones
cerrar parque
limitar aforo
autorizar intervención

deben permanecer
fuera de automatización
hasta validación.

============================================================
98. REPORTE DE CAMBIOS
============================================================

Toda implementación debe entregar:

ARCHIVO
CAMBIO
MOTIVO

Además:

PERMISO
ROL
RESULTADO.

============================================================
99. AUDITORÍA FINAL
============================================================

Verificar:

[ ] arquitectura respetada

[ ] RBAC centralizado

[ ] MASTER_ADMIN correcto

[ ] ADMIN correcto

[ ] PARK_RANGER correcto

[ ] TOUR_GUIDE correcto

[ ] READ_ONLY correcto

[ ] navegación dinámica

[ ] ProtectedRoute

[ ] delegación

[ ] "Delegado por"

[ ] historial

[ ] chat grupal

[ ] chat directo

[ ] aislamiento por parkId

[ ] proyecciones IA

[ ] permisos de IA

[ ] Pozo

[ ] Afluencia

[ ] Clima

[ ] Mantenimiento

[ ] Biodiversidad

[ ] Patrimonio

[ ] confidence

[ ] insufficient_data

[ ] outdated

[ ] feedback

[ ] logo oficial

[ ] Light Mode

[ ] Dark Mode

[ ] responsive

[ ] accesibilidad

[ ] pruebas unitarias

[ ] build exitoso.

============================================================
100. PRINCIPIO FINAL DEL SISTEMA
============================================================

El proyecto debe funcionar como un sistema institucional
de apoyo operativo y administrativo.

La arquitectura debe ser:

MODULAR
ESCALABLE
MANTENIBLE
TRAZABLE
SEGURA
EXPLICABLE
RESPONSIVE.

Los roles definen responsabilidades.

Los permisos definen capacidades.

Las Pages no deben conocer reglas complejas
de autorización.

Los datos tienen una única fuente de verdad.

La IA apoya decisiones.

La IA no sustituye a la autoridad humana.

La interfaz debe ayudar a responder:

¿QUÉ ESTÁ PASANDO?

¿QUIÉN ES RESPONSABLE?

¿QUIÉN DELEGÓ LA ACCIÓN?

¿QUÉ REQUIERE ATENCIÓN?

¿QUÉ PODRÍA OCURRIR?

¿QUÉ TAN CONFIABLE ES LA PROYECCIÓN?

¿QUÉ ACCIÓN PODRÍA CONSIDERARSE?

El resultado final debe representar
un sistema moderno de monitoreo
para el Parque Nacional Isla San Lucas,
manteniendo coherencia institucional,
operativa y tecnológica.

## Matriz oficial resumida

Esta matriz define el alcance funcional acordado. No afirma que todas las capacidades estén implementadas ni concede permisos por sí misma. Las capacidades efectivas se verifican en el RBAC centralizado, con el usuario activo, el mismo `parkId` y los permisos asignados. «Según permiso» y «Opcional» requieren concesión explícita; las proyecciones y funcionalidades pendientes se implementan por fases.

| Función | Master Admin | Admin | Guardaparque | Guía | Read Only |
| --- | --- | --- | --- | --- | --- |
| Dashboard general | Completo | Sí | Operativo | — | Consulta |
| Dashboard Guía | Supervisión | Supervisión | — | Completo | — |
| Tareas | CRUD + delegar | CRUD / permisos | Operativas | — | Leer |
| Mantenimiento | CRUD + delegar | CRUD / permisos | Operativo | Reporta incidencia | Leer |
| Patrimonio | Gestión | Gestión parcial | Operativo | Leer | Leer |
| Especies | Gestión | Según permiso | Gestión | Leer | Leer |
| Pozo | Completo | Según permiso | Operativo | — | Según permiso |
| Recorridos | Supervisar | Supervisar | — | Gestionar propios | — |
| Visitantes | Sí | Sí | Sí | Gestión propia | Según permiso |
| Usuarios | Completo | Según permiso | — | — | — |
| Delegación | Completa | Según permiso | Según permiso | — | — |
| Chat grupal | Sí | Sí | Sí | Sí | Opcional |
| Chat directo admin | Sí | Sí | Según permiso | — | — |
| Proyección Pozo | Completa | Según permiso | Operativa | — | Opcional |
| Proyección Afluencia | Completa | Completa | Operativa | Simplificada | Opcional |
| Proyección Clima | Completa | Completa | Operativa | Recorridos | General |
| Proyección Mantenimiento | Completa | Completa | Operativa | — | Opcional |
| Proyección Biodiversidad | Completa | Según permiso | Técnica | Interpretativa | Consulta |
| Proyección Patrimonio | Completa | Completa | Operativa | Consulta | Consulta |

## Decisión arquitectónica innegociable: Rol ≠ permiso

`MASTER_ADMIN`, `ADMIN`, `PARK_RANGER`, `TOUR_GUIDE` y `READ_ONLY` organizan responsabilidades humanas. Cada rol agrupa permisos; su nombre no autoriza una acción.

React debe decidir las capacidades principalmente con `can("...")`. Los permisos se resuelven en `permissions.js`; las rutas y la navegación comparten esa decisión mediante `ProtectedRoute.jsx` y `navigation.js`. Evitar comprobaciones dispersas como `user.role === "MASTER_ADMIN"`.

```jsx
can("task.delegate")
can("maintenance.delegate")
can("chat.direct_admin")
```

Los servicios también verifican los permisos, el usuario activo y el mismo `parkId`; mostrar una acción en la interfaz no sustituye esas verificaciones. JSON Server mantiene su carácter temporal de simulación de seguridad Front-End.

Esta separación permite incorporar después un coordinador, biólogo, encargado de patrimonio u otro perfil configurando sus permisos y reutilizando las Pages, componentes y navegación existentes. Toda ampliación de capacidades requiere una modificación explícita y trazable del RBAC; la matriz resumida no reemplaza esa configuración.
