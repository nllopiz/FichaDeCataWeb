# Guía: configuración de la hoja de fichas

Esta guía prepara **una sola vez** la planilla de Google y los datos de la app.
Usá siempre tus propios datos; los ejemplos de este documento son ficticios
("Bodega Ejemplo", `dueno@ejemplo.test`).

## 1. Crear la planilla

1. Andá a [Google Drive](https://drive.google.com) con **tu cuenta** (la del dueño).
2. **Nuevo → Google Sheets** y ponele un título, por ejemplo `Fichas de Cata Ejemplo`.
3. Renombrá la hoja (pestaña abajo a la izquierda) a exactamente: `Fichas`.

## 2. Encabezados (fila 1, en este orden exacto)

Tipeá en la celda **A1** la siguiente fila completa (una sola línea, tal cual).
La app verifica estos encabezados antes de leer y, si no coinciden, informa el error
**sin escribir nada** en la hoja:

```
id, bodega, linea, pais, provincia, zona, tipo, tono_matiz, intensidad_color, vivacidad_brillo, limpieza_transparencia, evolucion_color, limpieza_franqueza, defecto, expresion_intensidad, equilibrio, notas_aromaticas, dulzor, acidez, taninos_cantidad, taninos_calidad, alcohol_percepcion, cuerpo, entrada, evolucion_boca, aromas_boca, impresion_final, postgusto, apreciacion, composicion, cosecha, graduacion, autor, fecha_creacion, fecha_modificacion
```

- Dejá las celdas de la fila 1 **tal cual**: sin mayúsculas de más, sin espacios
  al final y sin filas encima.
- Cada ficha ocupa **una fila** desde la fila 2; la app escribe sola.

## 3. Compartirla solo con tu cuenta

1. **Compartir → Agregar personas**: no agregues a nadie.
2. En **Configuración de acceso** (engranaje), dejá **Restringido**: solo las
   personas que agregaste (es decir, solo vos) pueden abrir la planilla.
3. **Nunca** actives "Cualquier persona con el enlace": eso abriría las fichas a
   terceros (RNF-1).

Si un día detectás que otra cuenta tiene acceso, sacala de inmediato.

## 4. Configurar la app (`js/config.js`)

Abrí `js/config.js` y reemplazá los tres placeholders:

| Placeholder | Qué va | Cómo se consigue |
| --- | --- | --- |
| `REEMPLAZAR_ID_PLANILLA` | El ID de tu planilla | En la URL: `docs.google.com/spreadsheets/d/`**ESTE_TEXTO**`/edit` |
| `REEMPLAZAR_CORREO_DUENO` | Tu correo de Google | El mismo con el que identificás al guardar (queda en la columna `autor`) |
| `REEMPLAZAR_CLIENT_ID` | El Client ID de Google | Se crea en el paso 5 |

La hoja (`hoja: "Fichas"`) ya está bien por defecto.

> Estos dos valores (Client ID e ID de planilla) son **públicos por diseño**: la
> app no tiene secretos ni archivos `.env`. La protección real es que la planilla
> esté compartida solo con vos y que Google pida identificarse al guardar.

## 5. Google Cloud: habilitar las APIs y crear el Client ID

1. Andá a [Google Cloud Console](https://console.cloud.google.com) con tu cuenta.
2. **Crear proyecto** (por ejemplo `ficha-de-cata-ejemplo`).
3. **APIs y servicios → Biblioteca**: habilitá **Google Sheets API** y
   **Google Identity Services**.
4. **APIs y servicios → Pantalla de consentimiento OAuth**:
   - Usuario tipo: **Externo**; rellená nombre y correo de contacto (cualquier
     correo propio, por ejemplo `dueno@ejemplo.test` en pruebas).
   - Dejalo en modo **Probando** (ver la guía de uso: en Probando hay que
     re-identificarse cada 7 días; no afecta el funcionamiento).
5. **APIs y servicios → Credenciales → Crear credenciales → ID de cliente OAuth**:
   - Tipo: **Aplicación web**.
   - **Orígenes JavaScript autorizados**: agregá los que uses:
     - `http://localhost:4173` (desarrollo local),
     - `https://TU-USUARIO.github.io` (cuando publiques en GitHub Pages).
6. Copiá el Client ID generado y pegalo en `js/config.js`
   (`REEMPLAZAR_CLIENT_ID`).

No hace falta configurar la **URL de redirección**: la app usa el popup de Google
y no tiene backend.

## 6. Verificación

1. Abrí la app (ver `guia-despliegue.md`), andá a **Buscar fichas** y escribí
   cualquier término.
2. Si todo está bien, te pide identificarte y después responde con tus fichas
   (o "Sin resultados para …" si todavía no hay ninguna).
3. Si la fila 1 no coincide con la del paso 2, verás:
   **"La planilla no tiene los encabezados esperados. Revisá la guía de
   configuración."** — corregí la fila 1 y recargá.
4. Guardá una ficha de prueba (por ejemplo `Bodega Ejemplo`, `Línea Prueba
   Malbec`) y comprobá que aparece como fila nueva en la hoja con tu correo en la
   columna `autor`.
