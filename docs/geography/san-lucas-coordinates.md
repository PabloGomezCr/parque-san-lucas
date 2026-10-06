# Verificación de coordenadas — 6 de octubre de 2026

Se realizó una consulta deliberada a Nominatim con `Parque Nacional Isla San Lucas, Costa Rica`, `format=jsonv2`, `addressdetails=1` y `limit=5`. Se identificó la aplicación mediante User-Agent y se guardó la [respuesta completa](san-lucas-nominatim.json). No hubo consultas periódicas ni variantes sucesivas.

El único resultado tiene:

| Campo | Valor |
| --- | --- |
| name | Parque Nacional Isla San Lucas |
| display_name | Parque Nacional Isla San Lucas, Puntarenas, 60101, Costa Rica |
| category/class | boundary |
| type | national_park |
| country_code | cr |
| OSM | relation 11814893 |
| latitude | 9.9404316 |
| longitude | -84.9060651 |
| boundingbox | sur 9.9225454; norte 9.9548833; oeste -84.9253073; este -84.8866370 |

El nombre, clasificación, país y boundingbox corresponden al parque solicitado. El punto se encuentra dentro de esos límites. Se usa como punto representativo para el modelo meteorológico; no representa una estación, un acceso al parque ni una delimitación topográfica oficial.

La verificación consiste en comprobar la identidad del resultado geográfico y su coherencia espacial. No constituye validación de campo. Se registraron las coordenadas y su procedencia en el registro Park de `db.json`. La fecha registrada corresponde al día de la verificación.

Referencia: [relación en OpenStreetMap](https://www.openstreetmap.org/relation/11814893). Coordenadas: © OpenStreetMap contributors, [ODbL/atribución](https://www.openstreetmap.org/copyright).

[Política Nominatim](https://operations.osmfoundation.org/policies/nominatim/): máximo una consulta por segundo, identificación de la aplicación, atribución y caché; sin autocomplete ni consultas sistemáticas. El script `node scripts/resolveParkCoordinates.mjs` reutiliza el archivo existente. Si se elimina ese archivo hace una única consulta y guarda la respuesta; no tiene un bucle de reintentos. No ejecutar múltiples instancias simultáneas. Los resultados ambiguos o fuera del área esperada requieren revisión humana; el script no escribe automáticamente en parks.
