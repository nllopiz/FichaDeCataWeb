---
name: sheets-api-navegador
description: Google Sheets API v4 REST llamada desde el navegador (fetch + token GIS). Úsala al leer o escribir fichas en la planilla, cachear la hoja, manejar cuotas y errores 401/403/429, o sanear valores antes de guardarlos.
---

# Google Sheets API v4 desde el navegador

Sin backend: las llamadas REST salen del navegador con el token del usuario
(ver skill seguridad-gis-sheets). Todas las respuestas son JSON; se usan con `fetch`.

## 1. Endpoints

Base: `https://sheets.googleapis.com/v4/spreadsheets/{ID_DE_LA_PLANILLA}`

| Operación | Endpoint | Método |
|---|---|---|
| Leer varias cosas de una vez | `/values:batchGet?ranges=A1:AZ&ranges=...` | GET |
| Escribir rangos existentes | `/values:batchUpdate` | POST |
| Agregar una fila al final | `/values/{RANGO}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS` | POST |

- Encabezado: `Authorization: Bearer {token}` en toda llamada.
- CORS: la API de Sheets **permite** llamadas desde el navegador; no hace falta proxy.
- `valueInputOption=USER_ENTERED` aplica el saneado del punto 4; `RAW` no sanea.

## 2. Estructura de la planilla

- Fila 1: encabezados (una columna por campo de la ficha).
- Una fila por ficha (RF-1).
- Además de los campos de la ficha, cada fila registra **autor, fecha de creación y
  fecha de última modificación** (RNF-2, CA-9), formateadas en la app
  (America/Argentina/Buenos_Aires, dd/mm/aaaa, 24 h); la fecha de modificación se
  actualiza en todo guardado posterior.
- Campos de varios valores: descriptores de notas aromáticas y aromas de boca
  (selección múltiple de dos niveles, RF-13) y composición (una fila por cepa:
  varietal + porcentaje, RF-1/RF-14): **un solo string con valores separados por
  ";"**.
- La normalización al leer es responsabilidad de la app: split por ";" + trim.

## 3. Lectura eficiente y caché (RNF-3: <2 s con 500 filas)

- Leer **toda** la hoja de una sola llamada con `batchGet` (un solo rango
  `A1:AZ1000`), no una llamada por ficha.
- Cachear el resultado en una **variable de memoria de la página** (no localStorage:
  los datos guardados no son borradores). Invalidar la caché al guardar o editar.
- La búsqueda (RF-7, parcial sin mayúsculas ni acentos) se hace **sobre la caché**,
  nunca contra la API: normalizar con `toLowerCase()` + `normalize("NFD")` y quitar
  marcas diacríticas (`/\p{M}/gu`).
- Si la caché está vacía y no hay red: informar y ofrecer reintentar; no borrar el
  borrador del usuario (RF-6).

## 4. Saneado antes de escribir

- Texto que empieza con `=`, `+`, `-`, `@` → anteponer `'` (evita inyección de
  fórmula). Aplica a bodega, línea, varietal, ubicación, notas, apreciación personal.
- Largo máximo razonable por celda: 50.000 caracteres (Sheets corta más allá de eso).
- Números: enviar como número, no como texto; fechas/horas ya formateadas en la app
  (America/Argentina/Buenos_Aires, dd/mm/aaaa, 24 h).

## 5. Escritura

- Guardar ficha nueva: `append` de **un solo array** con todos los campos (una fila).
- Editar ficha (RF-8): `batchUpdate` sobre el rango `A{n}:AZ{n}` de esa fila; la fila
  se identifica con la caché de lectura (número de fila), no con la bodega.
- RF-5 (doble toque = una sola ficha): bloquear el botón en la UI **y** normalizar
  antes de comparar; la API no tiene idempotencia.

## 6. Cuotas y errores

| Código | Causa | Acción |
|---|---|---|
| 401 | Token vencido/inválido | Borrar token de memoria, re-identificar (RF-18), reintentar una vez |
| 403 | La cuenta no accede a la hoja | Mensaje claro "no tenés acceso"; verificar que la hoja esté compartida con el dueño |
| 429 | Cuota de la API agotada (por defecto ~100 lecturas y ~100 escrituras / 100 s por usuario) | Espera con reintento (backoff); decirle al usuario que espere, sin perder lo cargado |
| 5xx | Error de Google | Reintentar con backoff; si persiste, conservar el borrador (localStorage) y avisar |

- **Nunca perder datos del usuario**: antes de una llamada de guardado, el borrador ya
  está en localStorage (RF-6); si la llamada falla, el usuario reintenta sin recargar.

## 7. Pruebas

- En Vitest: probar la lógica pura (normalización, saneado, parseo de la hoja) con
  dobles de la API; en Playwright: interceptar `sheets.googleapis.com` (route stub)
  con datos ficticios (skill datos-sensibles). No tocar una planilla real en pruebas.
