---
name: django-security-review
description: Úsala al planificar (plan.md) y al validar apps Django de este proyecto para revisar seguridad (permisos, CSRF, SQL, archivos subidos, configuración y logs).
---

# Revisión de seguridad Django

Reporta cada punto como OK, FALLA o NO APLICA, con archivo y línea. No corrijas sin aprobación.

1. Permisos: toda vista exige autenticación y un permiso o rol explícito. Ninguna vista queda pública por omisión.
2. Autorización por objeto: un usuario no accede a registros de otra área o de otra persona cambiando el id en la URL.
3. CSRF: todos los formularios POST llevan token; no hay @csrf_exempt sin justificación escrita.
4. SQL: nada de SQL armado con f-strings o concatenación. Si hay raw(), con parámetros.
5. Plantillas: sin |safe ni mark_safe sobre datos de usuario.
6. Archivos subidos: validar tipo y tamaño, y no servirlos desde una ruta pública sin control.
7. Configuración: DEBUG en False fuera de desarrollo, ALLOWED_HOSTS acotado, SECRET_KEY y credenciales de la base por variables de entorno, cookies Secure y HttpOnly, y python manage.py check --deploy sin avisos graves.
8. Auditoría: las acciones sensibles (crear, modificar, borrar y consultar datos de personas) registran quién, qué y cuándo.
9. Logs y errores: sin datos personales en logs ni en mensajes de error al usuario.
10. Dependencias: ningún paquete nuevo que no esté aprobado en el plan.
