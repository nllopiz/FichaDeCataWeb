# Guía: configuración de la app y tu planilla

Esta guía se hace **una sola vez**. Usá siempre tus propios datos; los ejemplos de
este documento son ficticios ("Bodega Ejemplo", `dueno@ejemplo.test`).

## 1. Tu planilla `FichaCataWeb`: la crea la app sola

No tenés que crear nada a mano. En tu **primer guardado**, la app:

1. busca en tu Google Drive una planilla llamada exactamente **`FichaCataWeb`**;
2. si no existe, **la crea** y escribe sola los encabezados de la fila 1;
3. recuerda el ID de esa planilla en ese navegador para las próximas veces.

Si usás otra computadora o navegador, con identificarte basta: la app vuelve a
encontrar tu `FichaCataWeb` por nombre en tu Drive (por eso el permiso de Google
pide "administrar archivos de Google Drive": solo alcanza a ver los archivos que
crea esta app).

La fila 1 que la app escribe es esta (la dejamos como referencia; si algún día la
editás a mano y se rompe, la app avisa **sin escribir nada**):

```
id, bodega, linea, pais, provincia, zona, tipo, tono_matiz, intensidad_color, vivacidad_brillo, limpieza_transparencia, evolucion_color, limpieza_franqueza, defecto, expresion_intensidad, equilibrio, notas_aromaticas, dulzor, acidez, taninos_cantidad, taninos_calidad, alcohol_percepcion, cuerpo, entrada, evolucion_boca, aromas_boca, impresion_final, postgusto, apreciacion, composicion, cosecha, graduacion, autor, fecha_creacion, fecha_modificacion
```

- Cada ficha ocupa **una fila** desde la fila 2; la app escribe sola.
- Cada fila queda firmada con **la cuenta con la que te identificaste** (columna
  `autor`) — no hay que configurar ningún correo.

## 2. Compartirla solo con tu cuenta

1. Cuando la app cree la planilla, abrila en tu Drive y revisá **Configuración de
   acceso** (engranaje): debe decir **Restringido** (solo vos).
2. **Nunca** actives "Cualquier persona con el enlace": eso abriría las fichas a
   terceros (RNF-1).
3. Si un día detectás que otra cuenta tiene acceso, sacala de inmediato.

## 3. La configuración de la app (`js/config.js`)

Este repositorio **ya trae configurado el Client ID público** en `js/config.js`
(propiedad `clientIdGoogle`): no hace falta pegar nada para usar la app tal como
está.

Solo si armás tu propia copia con **otro** proyecto de Google Cloud, reemplazá ese
valor por el Client ID que crees en el paso 4. Es un valor **público por diseño**:
la app no tiene secretos ni archivos `.env`. La protección real es que la planilla
esté compartida solo con vos y que Google pida identificarse al guardar.

## 4. Google Cloud: habilitar las APIs y crear el Client ID

1. Andá a [Google Cloud Console](https://console.cloud.google.com) con tu cuenta.
2. **Crear proyecto** (por ejemplo `ficha-de-cata-ejemplo`).
3. **APIs y servicios → Biblioteca**: habilitá **Google Sheets API**,
   **Google Drive API** e **Google Identity Services**.
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
6. Copiá el Client ID generado. Si usás tu propio proyecto, pegalo en `js/config.js`
   (propiedad `clientIdGoogle`) en lugar del Client ID incluido.

No hace falta configurar la **URL de redirección**: la app usa el popup de Google
y no tiene backend.

## 5. Verificación

1. Abrí la app (ver `guia-despliegue.md`), completá los campos obligatorios de una
   ficha de prueba (por ejemplo `Bodega Ejemplo`, `Línea Prueba Malbec`) y
   **Guardá**.
2. Te pide identificarte con tu cuenta de Google y, tras el primer guardado,
   aparece `FichaCataWeb` en tu Drive con la ficha como fila nueva y tu correo en
   la columna `autor`.
3. Andá a **Buscar fichas** y escribí `ejemp`: debe encontrar la ficha creada.
4. Si algún día la fila 1 de la planilla no coincide con la referencia del paso 1,
   verás: **"La planilla no tiene los encabezados esperados. Revisá la guía de
   configuración."** — corregí la fila 1 (o borrá la planilla para que la app cree
   una nueva) y recargá.
