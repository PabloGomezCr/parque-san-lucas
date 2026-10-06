# Sistema de color y branding

La instrucción del usuario del 2 de octubre de 2026 reemplaza la paleta azul anterior de las pantallas operativas. Stitch sigue siendo referencia de estructura, tipografía, espaciado y componentes. El documento de auditoría adjunto se usa como criterio de revisión; no prevalece sobre esta actualización cromática explícita.

## Auditoría y migración

Inventario completo previo: [color-audit-before.md](color-audit-before.md).

| Uso anterior | Colores anteriores | Nuevo token / responsabilidad |
|---|---|---|
| CTA azul | `#5A7092`, `#425878` | `--brand-primary`, `--brand-primary-hover`: naranja |
| Fondo azul claro | `#F7F9FF` | `--background`: neutral `#F7F7F4` |
| Inputs, filtros y capas | `#EDF4FF`, `#E1E9F4` | `--surface-subtle`, `--surface-high`: neutrales |
| Texto principal | `#141C24` | `--text-primary`: navy `#111729` |
| Texto secundario/muted | `#44474E`, `#74777E` | `--text-secondary`, `--text-muted`, ajustados a contraste AA |
| Links/info | `#316190`, `#D4E3FF` | `--module-ocean`, `--module-ocean-subtle` |
| Éxito | `#216148`, `#AFF1D0` | `--color-success`, `--success-bg`: naturaleza |
| Warning | `#986419`, `#FFF0DA` | `--color-warning`, `--warning-bg`: naranja/ámbar semántico |
| Error | `#BA1A1A`, `#FFDAD6` | `--color-error`, `--error-bg`: rojo, distinto de marca |
| Dark azul antiguo | `#0B111A`, `#141E2D`, `#1C283C`, `#24334B` | fondo `#0D1220`, superficies navy `#111729`, `#171E32`, `#1B2338` |
| Sombras y scrim hardcodeados | Variantes de `#141C24`, negro y `#0B111A` | `--shadow-*`, `--overlay-backdrop` |
| Glows azul/verde | `#9DCAFE26`, `#94D4B426` | `--glow-brand`, `--glow-ocean`, baja opacidad |
| Miniaturas de tema | `#F4F7FA`, `#D4E3FF`, `#141E2D` | `--preview-light`, `--preview-dark`, `--preview-neutral` |
| CSS inicial de Vite sin importar | Violeta y grises de `src/index.css` | Eliminado junto a `src/App.css` y assets del starter sin uso |

Los alias `--primary`, `--secondary`, `--surface-alt`, etc. resuelven a los nuevos tokens semánticos para conservar las interfaces de los componentes. No mantienen una segunda paleta.

## Roles por tema

| Concepto | Base oficial | Light UI | Dark UI |
|---|---|---|---|
| Marca / CTA | `#D05E27` | `#D05E27` | `#E66A2B` |
| Monitoreo | `#111729` | `#111729` | `#C3C7D1` como acento; navy en superficies |
| Océano / turistas / agua | `#1C2656` | `#1C2656` | `#AAB8F0` |
| Naturaleza / éxito | `#0F2B23` | `#0F2B23` | `#83BDAC` |
| Patrimonio | `#401D09` | `#401D09` | `#D9AA8C` |
| Tecnología / conectividad | `#1D1B48` | `#1D1B48` | `#B2AFE7` |
| Superficies | `#FFFFFF` | Blancas/neutrales | Navy en distintos niveles |

`_components.scss` asigna los acentos mediante `data-module` en AppLayout. Se aplican a iconos/métricas y no al fondo completo del módulo. `chartColors.js` centraliza las series. Los badges mantienen labels y colores semánticos; éxito y error tienen iconos distintos en sus estados completos.

## Contraste

Blanco sobre naranja `#D05E27` resulta aproximadamente **3.95:1**, insuficiente para texto pequeño. Los CTA usan navy `#111729` (**4.51:1**). Hover y active aumentan luminosidad y conservan texto navy. Focus naranja es independiente del enlace azul océano. `--brand-text` es más oscuro en light para acentos de texto pequeños.

`--text-muted` se ajusta a `#666B78` en light y `#A3A9B7` en dark. La prueba de contraste evalúa textos sobre cuatro superficies, CTA normal/hover/active y badges semánticos. Los resultados medidos se guardan en `qa/contrast.json`.

## Logo global

`BrandLogo.jsx` admite `full`, `compact`, `symbol` y `theme="auto" | "light" | "dark"`. Usa SVG locales con la geometría original de la lámina horizontal de Stitch, sin filtros CSS ni redibujo. La presentación autónoma y el naranja se adaptaron a la paleta solicitada; el archivo de procedencia explica la extracción.

Sidebar y Navbar lo incorporan para las páginas internas. Login y SystemLayout cubren los casos sin shell. En móvil el isotipo permanece visible; el texto redundante del parque se oculta a 420 px o menos para evitar solapamiento con acciones.

No se añadieron páginas ni se cambió la capa de datos para esta actualización cromática.

## Actualización posterior del logo

La petición de logo animado reemplaza la selección del símbolo por tema: ahora el pelícano es blanco sobre `--brand-primary` en claro y oscuro. Login usa un símbolo protagonista de 88–120 px vinculado a la solicitud de autenticación. Ver [procedencia y animación](../public/assets/branding/README.md).

## Referencia maestra definitiva

El PNG aportado posteriormente por el usuario sustituye las referencias de Stitch del logo. Su naranja y textura originales se conservan sin recolorear en ambos temas; `--brand-primary` sigue gobernando la interfaz y el fondo de reserva del componente. La única fuente del SVG de alas es ese PNG. Véase [branding vigente](../public/assets/branding/README.md).
