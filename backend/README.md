# API de seguridad inicial

Esta API es una prueba aislada. **Todavía no reemplaza JSON Server, no usa SQLite ni protege los endpoints existentes.**

Requisitos: Python 3.10+.

Desde la carpeta backend, crear un entorno virtual, instalar dependencias con `pip install -r requirements.txt` y ejecutar `uvicorn app.main:app --reload --port 8000`.

Definir dos variables de entorno distintas, `DEV_ADMIN_TOKEN` y `DEV_RANGER_TOKEN`, con valores aleatorios largos. No subir los valores al repositorio.

Ejecutar las pruebas desde backend con `pytest -q`.

La ruta `/api/admin/security-check` devuelve 401 sin token o con token inválido, 403 con token de guardaparque y 200 con token de administrador.

**Advertencia:** Los tokens de entorno son solamente un mecanismo provisional de prueba. Antes de conectar datos reales se necesita autenticación de usuarios, contraseñas con hash, sesiones o tokens con expiración, autorización granular y pruebas de acceso a registros.
