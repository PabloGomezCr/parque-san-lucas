# Chat interno compartido

El chat usa la ruta `/chat` y `DashboardPage section="chat"`, con la Sidebar y AppLayout existentes. No se cambia ninguna definición de roles ni se agrega una Page.

## Permisos, rutas y navegación

No hay permisos nuevos. Se reutilizan `chat.group` y `chat.direct_admin`. `/chat` y el elemento Chat de la navegación aceptan cualquiera de los dos; los tabs se filtran por `can()`. El canal grupal se llama **Parque Nacional Isla San Lucas**.

Cada operación del servicio verifica el usuario activo persistido y su `parkId`. Los directos exigen `chat.direct_admin` al usuario que consulta o envía y un destinatario activo del mismo parque. Tener una conversación o membresía no concede permisos. Los contactos excluyen al usuario actual, inactivos y usuarios externos. Los directos entre terceros no se devuelven.

## Datos

- `chatChannels`: canal grupal activo con nombre y `parkId`.
- `chatChannelMembers`: relación canal/usuario/parque, estado activo, fecha de ingreso y último mensaje leído. La incorporación inicial ocurre solo después de verificar el permiso; una membresía revocada bloquea el acceso.
- `chatMessages`: texto, `senderUserId`, fecha, parque y referencia a canal o conversación. No almacena `senderName` ni `senderRole`, ni copia identidades.
- `directConversations`: dos IDs de participantes del parque, actor/fecha de creación y último mensaje leído por usuario.

El servicio resuelve nombre y rol actuales desde `senderUserId`; los presenta como datos derivados, sin contraseñas. Un remitente eliminado se muestra como Usuario no disponible. Un remitente histórico inactivo conserva su atribución, aunque no figure entre destinatarios.

Las lecturas y las creaciones de membresías/conversaciones se serializan dentro del cliente. Las lecturas no retroceden y los mensajes propios no aumentan el contador de no leídos. El panel marca como leído el último mensaje mostrado; Actualizar mensajes consulta JSON Server nuevamente. No hay WebSocket ni realtime. JSON Server no garantiza transacciones entre clientes ni constituye seguridad backend.

## Componentes y desacoplamiento

`ChatPanel`, `ChatHeader`, `ConversationList`, `MessageList`, `MessageBubble`, `MessageComposer` y `UnreadBadge` están en `src/components/chat/`. Reutilizan Tabs, Card, FormField, Button y feedback existentes. El borrador se puede escribir durante la carga, pero el envío permanece bloqueado hasta completar una carga válida. Los tabs admiten teclado.

El diseño presenta contactos y mensajes en columnas en escritorio y los apila en móvil, con texto largo ajustado al ancho y desplazamiento vertical de mensajes. Usa la navegación móvil existente.

Los componentes llaman únicamente a `chatService`: `getContacts`, `getConversations`, `getMessages`, `sendMessage` y `markRead`. `src/repositories/chatRepository.js` concentra el adaptador JSON Server, para sustituir el transporte posteriormente.

## Archivos modificados o agregados

- `db.json`: cuatro colecciones del chat y mensajes normalizados.
- `src/services/chatService.js`, `src/repositories/chatRepository.js`: servicio y adaptador.
- `src/components/chat/`: siete componentes, `chat.scss` y pruebas del panel.
- `src/components/admin/AdminChat.jsx`: retirado al extraer su funcionalidad a los componentes compartidos; no queda una interfaz duplicada.
- `src/pages/dashboard/DashboardPage.jsx`: reutiliza ChatPanel.
- `src/config/navigation.js`, `src/routes/AppRoutes.jsx`: acceso al chat por cualquiera de sus permisos existentes, reutilizando ProtectedRoute.
- `src/test/mocks/jsonServer.js`, `src/test/fixtures/chat.js`: colecciones y fixtures compartidos.
- `src/services/chatService.test.js`, `src/services/parkRangerRole.test.js`: actualizan expectativas al modelo normalizado.
- `src/services/chatInfrastructure.test.js`, `src/components/chat/ChatPanel.test.jsx`, `tests/chat.spec.js`: nuevas pruebas.
- `src/pages/dashboard/GuideDashboardPage.test.jsx`: corrige mocks y selectores de integración para verificar las pantallas reales; no cambia comportamiento ni permisos.
- `tests/app.spec.js`: espera la observación en la tabla y la evidencia guardada antes de recargar, evitando que el test interrumpa su guardado.
- `vitest.config.js`: cobertura del panel y adaptador.
- `README.md`, `docs/chat.md`, `docs/master-admin.md`, `docs/park-ranger.md`: documentación y referencias actuales.

## Validación

Pruebas del servicio: aislamiento entre parques, sesiones falsificadas, inactivos, membresía revocada, directos entre terceros, permiso directo, remitente resuelto, conversaciones en ambos sentidos, creaciones concurrentes dentro del cliente, contadores/lecturas por participante y fallos de red.

Pruebas del panel: remitente y rol correctos, lectura persistida, contactos filtrados, mensajes directos/no leídos, chat solo grupal, navegación con teclado y reintento.

E2E: menú móvil existente, chat grupal del Guardaparque, texto largo sin desbordamiento, remitente correcto y directos entre Maestro y Administrador con conteo/lectura. También se ejecutan los E2E anteriores para verificar compatibilidad.

Resultados: 255 pruebas en 38 suites y cobertura de líneas 90,16 %. El E2E de chat y los tres E2E de roles pasan. La regresión amplia completó otros casos existentes; el test de avistamiento se ajustó para esperar persistencia y se verificó por separado. `npm run build` exitoso. `npm run lint` termina sin errores; informa tres imports sin uso en `GuideDashboardPage.jsx`, fuera de la infraestructura de chat.
