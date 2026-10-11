# Constitución

## Principios base (no modificar)
1. Privacidad primero. Ningún dato real de personas (pacientes, personal, visitantes, proveedores) ni información sensible de la institución en prompts, specs, tests, fixtures ni capturas. Credenciales fuera del repositorio y del contexto del agente.
2. La spec manda. Los cambios se hacen primero en la spec, luego en el plan y las tareas, y al final en el código.
3. Tests primero. Ninguna tarea se da por hecha sin pruebas en verde.
4. Trazabilidad y auditoría. Todo requisito tiene tareas y tests, y las acciones sensibles quedan registradas (quién, qué y cuándo).
5. Simplicidad. Usar lo que ya trae el stack antes de escribir código propio. Ninguna dependencia nueva sin aprobación.
6. Aprobación humana. Una persona aprueba cada etapa y cada commit. El agente no despliega ni toca producción.

## Principios del proyecto
(1 a 6; no pueden contradecir los principios base)
1. **Un solo usuario, fichas privadas.** Todo lo guardado vive en la cuenta de Google del
   Propietario; la v1 no comparte, no administra ni muestra fichas de terceros.
2. **Sin backend propio.** La app es un sitio estático; Google (Identity Services y Sheets)
   es el único servidor. El token de acceso vive solo en memoria del navegador; el
   repositorio no contiene ningún secreto.
3. **Nada se pierde.** Ante corte de red, fallo de la API o rechazo de guardado, el
   borrador del usuario sobrevive (localStorage) y la interfaz informa sin perder lo
   cargado (RF-6, RF-11).
4. **Datos del vino, no de personas.** La ficha solo pide datos del vino y apreciaciones
   del propio usuario (RNF-7); specs, tests y ejemplos siempre con datos ficticios.
5. **Español y formatos de Buenos Aires.** Interfaz en español, fechas dd/mm/aaaa, hora
   24 h, zona America/Argentina/Buenos_Aires; los mensajes exactos de la spec se respetan
   textualmente.
6. **Rinde con 500 fichas o no sirve.** La búsqueda y la apertura responden en menos de
   2 s con 500 fichas (RNF-3): buscar sobre caché local, nunca una llamada por ficha.
