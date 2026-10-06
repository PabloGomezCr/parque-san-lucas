# Pelícano · referencia maestra única

La referencia vigente es **`pelicano-logo-san-lucas.png`**, suministrada por el usuario, 1254 × 1254 px. SHA-256: `c91087b33371c578d6fdd1f7dad722843b94211bf22d4b6f33de06f5889c8912`. El archivo se conserva sin modificaciones. Reemplaza expresamente las referencias de Stitch empleadas anteriormente.

## Recursos derivados

- `pelicano-logo-san-lucas.svg`: contornos trazados del PNG; grupos independientes `wing-left`, `body`, `wing-right`. El fondo naranja rasterizado se deriva exclusivamente del PNG maestro; la geometría del pelícano sí está vectorizada.
- `src/components/branding/pelicanPaths.json`: los mismos paths y los puntos de giro, para SVG inline controlado por React/CSS. Se genera junto al SVG, no se edita como otro logo.
- `pelicano-loading-background.png`: reconstrucción del naranja que queda detrás del ave cuando se desplazan las alas; extraída por inpainting de los píxeles vecinos del PNG. No contiene otra versión del símbolo y no se muestra como logo independiente.

El PNG original se muestra en reposo, en navegación y como favicon, incluidos ambos temas. Esto conserva sus contornos, matices y textura sin afirmar que una vectorización reproduzca cada píxel de antialiasing. Solo durante la carga se descubre el SVG sobre el fondo reconstruido. La comparación de siluetas a resolución nativa queda en `docs/qa/branding/fidelity.json`, con una imagen de diferencias. No es una certificación de igualdad raster 1:1 del SVG.

## Reproducción del trazado

Desde la raíz, con Python, NumPy y OpenCV disponibles:

```sh
python3 scripts/branding/vectorize_pelican.py
```

Se aísla el blanco por su canal azul y se trazan contornos a resolución 4×, con tolerancia subpíxel de 0.15 px originales. Un borde de 0.25 px originales compensa el medio píxel de la cuadrícula 4× al convertir centros de píxel en contornos. No se añaden plumas, alas, pico ni detalles; no se emplean los SVG de Stitch. La división técnica de la zona continua se hace en el hombro izquierdo. Las piezas blancas separadas del ala derecha se agrupan conservando sus coordenadas. Los pivotes se sitúan en (625,733) y (755,746), dentro del viewBox original. Una pequeña diferencia de borde es inherente al trazado de raster y a la unión de grupos; el original intacto cubre el SVG en reposo.

## Componente y movimiento

`BrandLogo.jsx` mantiene `size="sm|md|lg"`, `variant="mark|full"`, `animated` y `loading`; también conserva aliases de variantes previas. Sidebar/Navbar/SystemLayout y Login comparten el componente. AppLayout hereda las instancias de navegación, sin agregar otra copia en cada página.

Solo las alas rotan: ±1.3°, ciclos de **1.1 s ease-in-out**. El conjunto se eleva hasta **2 px**, sin escala ni deformación del cuerpo. El estado de la Promise de autenticación activa el movimiento. Tras un fallo, el ciclo en curso termina en posición cero y deja de repetirse; tras un ingreso exitoso, la autenticación se resuelve y el botón muestra «Acceso verificado» hasta que las alas llegan a reposo. Entonces se navega al destino mediante el evento de fin de ciclo, sin temporizadores ni prolongar `isLoading`. Si se activa reduced motion durante ese cierre, se cancela el movimiento y se navega inmediatamente. No se usan temporizadores. Reduced motion mantiene el PNG original estático.

Los antiguos `pelican-*.svg`, `l_mina_09_logo_principal.svg` y `emblema_oficial_parques_nacionales.svg` son archivos históricos: no se importan ni se usan como referencia del logo vigente.
