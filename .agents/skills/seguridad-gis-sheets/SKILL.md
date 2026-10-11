---
name: seguridad-gis-sheets
description: Seguridad del frontend con Google Identity Services y Google Sheets API. Úsala al implementar el login con Google, manejar el token de acceso, escribir validaciones de entradas o revisar que no haya secretos ni datos expuestos en la app de FichaDeCataWeb.
---

# Seguridad con Google Identity Services y Google Sheets

App estática (sin backend): el único servidor es Google. La seguridad depende de dos
cosas: un token bien tratado y entradas bien validadas. Nada de esto se delega.

## 1. Flujo de identificación (RF-18)

- Google Identity Services (GIS) se inicializa con el **client ID** público y se
  solicita el token **solo al guardar**, nunca al cargar la página.
- Scope mínimo: `https://www.googleapis.com/auth/spreadsheets`. No pedir scopes de
  Drive ni de perfil que no se usen.
- El popup de Google es de Google: no replicar, no rediseñar, no interponer pantallas
  propias antes del popup.

## 2. Tratamiento del token (RNF-1, CL-7)

- El token de acceso vive **solo en memoria**: una variable de módulo en el navegador.
- **Prohibido**: persistirlo en localStorage, sessionStorage, cookies propias, URLs,
  logs o archivos del repositorio.
- Al expirar o recibir 401: descartarlo de memoria, pedir re-identificación y
  reintentar la operación; nunca reintentar con el token viejo en loop.
- Al cerrar la sesión de Google desde la app: borrar la variable y el estado de
  identificación en memoria. Los borradores de ficha (localStorage) NO se borran:
  son datos del usuario, no de la sesión (RF-6).

## 3. Credenciales (RNF-1)

- El client ID de Google **es público por diseño**; va en un archivo de configuración
  visible (por ejemplo `config.js`). Eso no es un leak.
- **No puede existir ningún otro secreto** en el frontend: sin .env con claves, sin
  service-account JSON, sin tokens de API de Google embebidos. Un sitio estático lo
  publica todo.
- Si alguna vez se necesita un secreto, eso significa que hizo falta un backend:
  parar y escalar la decisión al Responsable técnico (docs/decisiones-tecnicas.md).

## 4. Modo "Probando" del consentimiento OAuth

- Mientras la pantalla de consentimiento esté en **Probando**, Google caduca la
  autorización cada **7 días**: el usuario debe identificarse de nuevo (un clic).
- La app no debe fallar por eso: es un caso normal, documentado en la guía de uso.
- Los errores 401 se tratan igual: re-identificar, nunca mostrar error técnico.

## 5. Validación de entradas (RF-3, RF-14)

- Numérico: graduación y porcentajes deben ser **números finitos**; rechazar texto que
  no se pueda convertir antes de guardar (la graduación es obligatoria: RF-3).
- Composición: sumar los porcentajes de cepas y exigir **100** exacto (RF-14, CL-8;
  criterio de aceptación CA-13).
- Texto libre (varietal, ubicación, notas): limitar longitud y **no interpretarlo
  nunca como fórmula ni como HTML** (ver punto 6).
- Duplicados: normalizar (ver skill sheets-api-navegador) antes de comparar;
  RF-5 prohíbe registrar dos veces la misma ficha por doble toque.

## 6. Inyección al escribir en la hoja

- Un texto que empieza con `=`, `+`, `-` o `@` interpretado por Sheets se
  convierte en **fórmula**: anteponer `'` (comilla simple) al saneado previo a la
  escritura (ver skill sheets-api-navegador, punto 4).
- En el HTML: **nunca** insertar contenido del usuario con `innerHTML`; usar
  `textContent` para bodega, línea, notas, etc. (XSS).
- Fechas y horas: formatear en la app (America/Argentina/Buenos_Aires, dd/mm/aaaa,
  24 h) y no delegar formatos a la hoja.

## 7. Acceso a la hoja

- La planilla se comparte **solo con la cuenta del dueño**; verificar periódicamente
  que el enlace no da acceso a terceros (los enlaces de Sheets por defecto son
  restrictivos; no cambiarlos a "cualquier persona con el enlace").
- Respuesta 403 de la API = la cuenta identificada no es la dueña: mostrar un mensaje
  claro ("no tenés acceso a esta planilla"), nunca datos ni stack traces.
- CA-8 es la prueba de fuego: una persona distinta no ve ni edita fichas ni con el
  enlace directo.

## 8. Datos sensibles (skill datos-sensibles)

- Specs, tests, seeds y ejemplos usan **solo datos ficticios** ("Bodega Ejemplo",
  "Línea Prueba Malbec"). Nombres, teléfonos o datos reales de personas no aparecen
  en el código ni en las pruebas.
