# Plan 001-mvp: Ficha de Cata Web (MVP)

> Derivado de `specs/001-mvp/spec.md` (19 RF · 7 RNF · 9 CL · 21 CA).
> Stack y comandos: `docs/decisiones-tecnicas.md` y sección Proyecto de `AGENTS.md`.
> Constitución: 6 principios del proyecto + principios base.
> Sin código en este documento; solo diseño. Datos de ejemplo ficticios
> ("Bodega Ejemplo", "Línea Prueba Malbec").

Verificación previa: este plan **no contradice** `docs/decisiones-tecnicas.md`. La elección
de hosting está delegada en el plan por esa misma nota ("el plan elige uno de los tres y
justifica la elección"): se elige **GitHub Pages** (sección 7).

## 1. Componentes y archivos con su responsabilidad

App estática **sin build en producción**: HTML + CSS + Bootstrap (CDN) + JavaScript puro
en módulos ES. Node solo como herramienta de desarrollo (devDependencies).

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Shell de la app: vista carga, vista búsqueda, vista edición; cambio de vista mostrando/ocultando secciones (sin framework) |
| `css/estilos.css` | Ajustes propios sobre Bootstrap: contraste AA, foco visible, formulario largo por secciones en móvil |
| `js/config.js` | Valores **públicos**: client ID de Google e ID de la planilla. Sin secretos |
| `js/catalogos.js` | Catálogos cerrados: campos de RF-9, tono por tipo (RF-12), espumante (RF-16), descriptores dos niveles (RF-13) |
| `js/validaciones.js` | Reglas de guardado: obligatorios (RF-3), opcionales (RF-4), suma 100 (RF-14), motivos exactos (RF-11) |
| `js/normalizacion.js` | Normalización de texto (minúsculas, sin acentos) para búsqueda (RF-7) y saneado anti-fórmula para escritura |
| `js/borrador.js` | Borrador en localStorage: persistir, recuperar, borrar; claves `"nueva"` o `id` de la ficha (RF-6) |
| `js/auth.js` | Google Identity Services: token client, scope mínimo, token **solo en memoria** (RF-18/19, RNF-1) |
| `js/sheets.js` | Cliente REST Sheets v4: `batchGet`, `append`, `batchUpdate`; caché de la hoja en memoria; errores 401/403/429/5xx (RF-2/8/15, RNF-2/3) |
| `js/formulario.js` | Formulario: desplegables dependientes (RF-12/16), multiselección dos niveles (RF-13), composición de cepas (RF-14) |
| `js/guardado.js` | Orquestación del guardado: bloqueo de doble toque (RF-5), flujo de identificación (RF-17/18/19), auditoría (RNF-2) |
| `js/busqueda.js` | Búsqueda sobre la caché (RF-7), mensaje sin resultados (RF-10), apertura para editar (RF-8) |
| `js/ui.js` | Mensajes exactos de la spec, avisos de conexión, anuncio de errores con `aria-live` (RF-10/11, RNF-5) |
| `js/app.js` | Arranque: inicializar GIS, **precargar la hoja en segundo plano**, cablear vistas |
| `tests/*.test.js` | Unitarios Vitest (sección 8) |
| `e2e/*.spec.js` | E2E Playwright (sección 8) |
| `docs/guia-configuracion-hoja.md` | Crear la planilla con sus encabezados y compartirla **solo** con la cuenta del dueño (RNF-1) |
| `docs/guia-despliegue.md` | Publicar en GitHub Pages paso a paso, para una persona no técnica |
| `docs/guia-uso.md` | Uso diario + caveat: en modo "Probando" Google pide re-autorizarse cada 7 días |
| `package.json`, `eslint.config.js`, `playwright.config.js` | Herramientas de desarrollo (`npm test`, `npm run test:e2e`, `npm run lint`, `npm run dev`); no forman parte de la app publicada |

## 2. Modelo de datos y cambios de esquema

Almacén: **Google Sheets**, hoja `Fichas`, privada de la cuenta del dueño. **Una fila por
ficha** (decisión del Solicitante). Columnas (fila 1 = encabezados, en orden):

`id`, `bodega`, `linea`, `pais`, `provincia`, `zona`, `tipo`, `tono_matiz`,
`intensidad_color`, `vivacidad_brillo`, `limpieza_transparencia`, `evolucion_color`,
`limpieza_franqueza`, `defecto`, `expresion_intensidad`, `equilibrio`,
`notas_aromaticas`, `dulzor`, `acidez`, `taninos_cantidad`, `taninos_calidad`,
`alcohol_percepcion`, `cuerpo`, `entrada`, `evolucion_boca`, `aromas_boca`,
`impresion_final`, `postgusto`, `apreciacion`, `composicion`, `cosecha`, `graduacion`,
`autor`, `fecha_creacion`, `fecha_modificacion`.

- **`id`**: timestamp de creación en epoch milisegundos, generado por la app
  (`generarId()`), único por ficha. La edición localiza la fila **por id** en la caché
  (número de fila), inmune a que el dueño ordene o filtre la hoja a mano.
- `autor` = **mail de la cuenta identificada** (confirmado por el Responsable técnico:
  es su propia planilla privada; CA-9).

- Valores múltiples en **una celda separados por ";"**: descriptores (RF-13) y
  composición en formato `varietal:porcentaje; ...` (RF-1/RF-14).
- Auditoría (RNF-2): `autor` = mail de la cuenta identificada; `fecha_creacion` y
  `fecha_modificacion` escritas por la app en `dd/mm/aaaa HH:mm` (Buenos Aires).
- **Sin migraciones de esquema**: la guía de configuración crea la hoja con los
  encabezados; la app valida el encabezado en el primer `batchGet` y, si no coincide,
  informa con mensaje claro **sin escribir**.
- Ficha identificada por su **`id`** (timestamp de creación); la caché conoce también el
  número de fila para escribir. Borrar fichas: fuera de alcance v1 (no hay endpoint de
  borrado en el plan).

## 3. Lógica de negocio en funciones puras, testeables sin infraestructura

- `validarFicha(datos)` → `{ valido, faltantes[], sumaComposicion }` (RF-3, RF-4, RF-14;
  alimenta el mensaje exacto de RF-11).
- `sumarComposicion(cepas)` → número (RF-14, CA-13: 95 y 105 se rechazan).
- `normalizarTexto(texto)` → minúsculas + NFD sin marcas diacríticas (RF-7, CA-19).
- `coincide(buscado, valor)` → parcial sobre texto normalizado (RF-7).
- `tonoPermitido(tipo, colorEspumante)` → lista cerrada de tonos (RF-12, RF-16, CA-15).
- `catalogoDescriptores()` → familias → descriptores (RF-13, CA-12).
- `esDobleToque(t1, t2)` → `|t2 - t1| < 2000 ms` (RF-5, CA-3).
- `generarId()` → timestamp de creación en epoch ms, único por ficha (modelo de datos).
- `serializarFila(ficha)` / `parsearFila(fila)` ↔ celdas con ";" (formato de la hoja).
- `saneado(valor)` → anteponer `'` si el texto empieza con `=`, `+`, `-` o `@`
  (skill `seguridad-gis-sheets`).
- `camposObligatorios()` → lista canónica de obligatorios (RF-3).

## 4. Algoritmo principal en pseudocódigo

### Guardar (RF-2, RF-5, RF-11, RF-14, RF-17, RF-18, RF-19)

```
al pulsar Guardar:
    si guardado_en_progreso: salir                    # RF-5: el segundo toque no hace nada
    v = validarFicha(datos del formulario)
    si no v.valido:
        mostrar motivos exactos (aria-live)           # RF-11, CL-3, CL-8
        salir
    si no hay token en memoria:                        # RF-17: el formulario ya estaba abierto
        abrir popup de identificación Google           # RF-18
        si el usuario cancela: conservar borrador, salir SIN registrar  # RF-19
    guardado_en_progreso = true                        # RF-5
    fila = serializarFila(id + datos + autor + fechas)   # RNF-2, saneado incluido
    si es edición (id conocido → fila en la caché):
        sheets.batchUpdate(fila, numero_de_fila)        # RF-8: una sola ficha corregida
    si no:
        sheets.append(fila)                            # RF-2
    si ok:
        borrar_borrador(); invalidar_caché(); vista de resultados   # CA-20
    si error:
        informar; conservar_borrador()                 # 401→re-identificar una vez;
                                                       # 403→"no tenés acceso";
                                                       # 429/5xx→esperar y reintentar
    guardado_en_progreso = false
```

### Buscar (RF-7, RF-10, RNF-3)

```
al iniciar la app: batchGet único de toda la hoja en segundo plano; cachear
                    (no bloquea el formulario; la búsqueda muestra "Cargando…" hasta
                     tener caché; CA-10 se verifica con caché cargada)
al escribir en el campo de búsqueda (con debounce):
    si no hay caché todavía: mostrar "Cargando…" y reintentar al estar lista
    termino = normalizarTexto(entrada)
    resultados = caché filtrada por coincide(termino, bodega) O coincide(termino, linea)
    si vacío: "Sin resultados para ‹término›"          # RF-10, CA-16 (texto exacto)
```

### Borrador (RF-6)

Comportamiento confirmado por el Responsable técnico (grill-me p. 1): el borrador se
conserva hasta guardar con éxito o crear un formulario nuevo deliberado.

```
en cada cambio del formulario: guardar_borrador(clave = "nueva" o numero_de_fila)
al recargar / perder conexión: si existe borrador → restaurarlo y avisar   # CL-2, CA-4
al guardado exitoso: borrar_borrador(clave)
al crear un formulario nuevo deliberado ("Nueva ficha"): borrar_borrador("nueva")
```

## 5. Interfaz y flujos

- **Vista carga** (por defecto, sin identificación — RF-17): formulario completo por
  secciones (datos del vino, fase visual, olfativa, gustativa, apreciación). En móvil se
  muestran todas las secciones sin recortes (RNF-6).
- **Vista búsqueda**: campo de búsqueda + lista de resultados (bodega, línea, cosecha);
  elegir uno → vista edición.
- **Edición**: mismo formulario precargado; los desplegables muestran el valor guardado
  (aunque el catálogo haya cambiado); guardar sobrescribe la fila sin duplicar (RF-8).
- Navegación entre vistas por mostrar/ocultar secciones + hash del navegador (volver
  desde edición a búsqueda sin perder el formulario: el borrador cubre ese caso).
- Componentes nativos + Bootstrap: `select` simples (RF-9), `select` dependientes
  (RF-12/RF-16), checkboxes agrupados por familia (RF-13), filas de cepas
  agregar/quitar (RF-14).
- Accesibilidad (RNF-5, CA-11): `label` asociado a cada campo, errores anunciados con
  `aria-live="assertive"`, foco visible, contraste AA, todo navegable con teclado.
- Estados: aviso "sin conexión — conservamos tu avance" (RF-6, CL-2); mensajes exactos
  de RF-10 y RF-11 textualmente; "Cargando…" durante la primera lectura de la hoja.

## 6. Seguridad, permisos y auditoría

(fuente: skills `seguridad-gis-sheets` y `sheets-api-navegador`; RNF-1, RNF-2, RNF-7)

- **Identidad**: GIS solo al guardar (RF-18); scope mínimo `spreadsheets`; el token vive
  **solo en memoria** (nunca localStorage/URL/logs); 401 → borrar token, re-identificar,
  reintentar una vez; cancelar → RF-19 (no se registra).
- **Credenciales**: client ID e ID de hoja en `config.js` (públicos por diseño); **cero
  secretos** en el repo ni en el frontend; sin .env en la app.
- **Hoja privada**: compartida solo con el dueño (guía); 403 → mensaje claro "no tenés
  acceso a esta planilla", sin stack traces (CA-8); un tercero con el enlace no accede.
- **Inyección y XSS**: saneado anti-fórmula en toda escritura; datos del usuario solo
  con `textContent`, jamás `innerHTML`.
- **Auditoría** (RNF-2, CA-9): cada fila lleva autor, fecha de creación y de
  modificación; la modificación se actualiza en todo guardado posterior.
- **RNF-7** (CA-18): el formulario no solicita datos de terceros; el único dato personal
  es la cuenta del dueño (columna autor).
- **Borrador**: solo datos del vino; se borra tras el guardado exitoso; no guarda token
  ni datos de sesión.
- **Pruebas**: siempre datos ficticios (skill `datos-sensibles`; CA-19 usa "Bodega
  Ejemplo" y "Línea Prueba Malbec").

## 7. Decisiones con su alternativa descartada

Además de las registradas en `docs/decisiones-tecnicas.md` (verificadas: sin
contradicciones), el plan decide:

| Decisión | Alternativa descartada | Por qué |
|---|---|---|
| Hosting: **GitHub Pages** | Netlify, Vercel | El repo ya vive en GitHub: habilitar Pages no exige cuentas nuevas ni build; Netlify/Vercel sumarían una cuenta y pasos para un despliegue manual por una persona no técnica |
| Módulos ES **sin build** para la app | Vite (u otro bundler) como parte del stack | Principio 5 (simplicidad): el usuario mantiene JS puro; herramientas de desarrollo sí, build en producción no |
| Bootstrap por **CDN** | npm + build de assets | Mismo motivo: cero build publicado |
| Fichas cacheadas **solo en memoria** | Copiar fichas guardadas a localStorage | Privacidad: no dejar fichas en el disco del navegador; localStorage es solo para borradores (RF-6) |
| Ficha identificada por **columna `id`** (timestamp de creación) | Número de fila como identificador | El número de fila cambia si el dueño ordena o filtra la hoja a mano y editar podría sobrescribir la ficha equivocada; con `id` la edición es inmune (confirmado por el Responsable técnico, grill-me p. 2) |
| **Precarga** de la hoja en segundo plano al abrir | Lectura perezosa al primer buscar; refresco periódico | Primera experiencia sin espera en la búsqueda; sin llamadas extra periódicas (grill-me p. 3) |
| CA-17 (disponibilidad 99%) **sin medición formal** en la v1 | Monitoreo externo gratuito (p. ej. UptimeRobot) | Aceptado por el Responsable técnico (grill-me p. 5): no hay backend propio que monitorear y sumaría una cuenta; la disponibilidad es la de GitHub Pages + Google |
| Configuración de la hoja **por guía manual** | App que crea la planilla | Crear hojas exigiría scope de Drive: más permisos de los necesarios (scope mínimo) |
| GIS en **popup** | Redirect de página completa | No interrumpe la carga del formulario (RF-17) |

## 8. Estrategia de tests

**Unitarios (Vitest)** — lógica pura, sin infraestructura:
- `validaciones`: obligatorios faltantes (CA-2), suma 100 → 95 y 105 rechazados (CA-13),
  motivos exactos (RF-11).
- `normalizacion`: "ejemp" encuentra "Bodega Ejemplo"; "prueba" encuentra "Línea Prueba
  Malbec"; acentos y mayúsculas (CA-19, RF-7).
- `catalogos`: tono por tipo (CA-12), espumante con color/método (CA-15), descriptores
  dos niveles (RF-13).
- `guardado` (con dobles): `esDobleToque` (CA-3), cancelar identificación no registra
  (CA-21), saneado anti-fórmula, serialización ";" round-trip.

**E2E (Playwright, con stubs)** — GIS simulado y `sheets.googleapis.com` interceptado
con `route` y datos ficticios; **nunca** la planilla real:
- Flujo completo: carga → guardar (login simulado) → buscar → editar → guardar
  (CA-1, CA-5, CA-20); doble toque real en la UI → una sola ficha (CA-3).
- Red caída simulada (`route.abort`) a mitad de carga → el borrador sobrevive (CA-4).
- Dos contextos de navegador guardando la misma ficha → gana el último (CA-14).
- Sin identificar → nada registrado (CA-21); tercero sin token no ve fichas (CA-8 con
  doble sin acceso).
- Viewports de teléfono y escritorio (CA-7); teclado y roles/aria (CA-11).
- RNF-3/CA-10: 500 filas ficticias → búsqueda < 2 s con caché cargada.
- Opcional: `@axe-core/playwright` para a11y automatizado — **dependencia nueva, requiere
  aprobación** del Responsable técnico antes de instalarla.

**Check de cierre de tarea**: `npm test` + `npm run lint` + `npm run test:e2e` en verde.

## 9. Trazabilidad RF/RNF → componente

| Requisito | Componente(s) | Test principal |
|---|---|---|
| RF-1 | formulario.js, index.html | E2E carga completa (CA-1) |
| RF-2 | guardado.js, sheets.js | E2E guardar (CA-20) |
| RF-3 | validaciones.js | unit validaciones |
| RF-4 | validaciones.js | unit validaciones |
| RF-5 | guardado.js (`esDobleToque`) | unit + E2E doble toque (CA-3) |
| RF-6 | borrador.js, ui.js | unit borrador + E2E red caída (CA-4) |
| RF-7 | normalizacion.js, busqueda.js | unit + E2E búsqueda (CA-19) |
| RF-8 | guardado.js, sheets.js (`batchUpdate`) | E2E editar (CA-5) |
| RF-9 | catalogos.js, formulario.js | unit catálogos (CA-6) |
| RF-10 | busqueda.js, ui.js | E2E sin resultados (CA-16) |
| RF-11 | validaciones.js, ui.js | unit validaciones |
| RF-12 | catalogos.js, formulario.js | unit catálogos (CA-12) |
| RF-13 | catalogos.js, formulario.js | unit catálogos (CA-12) |
| RF-14 | validaciones.js | unit validaciones (CA-13) |
| RF-15 | sheets.js (fila única), guardado.js | E2E dos contextos (CA-14) |
| RF-16 | catalogos.js, formulario.js | unit catálogos (CA-15) |
| RF-17 | index.html (vista carga sin GIS) | E2E sin login |
| RF-18 | auth.js, guardado.js | E2E guardar sin identificar (CA-20) |
| RF-19 | guardado.js (cancelar) | E2E cancelar (CA-21) |
| RNF-1 | auth.js, sheets.js, guía de hoja | E2E sin token (CA-8) + verificación manual del enlace |
| RNF-2 | sheets.js (auditoría) | E2E fechas y autor (CA-9) |
| RNF-3 | sheets.js (caché), busqueda.js | CA-10: 500 filas ficticias < 2 s |
| RNF-4 | GitHub Pages + Sheets (sin monitoreo propio) | CA-17: sin medición formal en la v1, aceptado por el Responsable técnico (grill-me p. 5); sin mantenimiento programado |
| RNF-5 | css, ui.js, formulario.js | E2E teclado/aria (CA-11) |
| RNF-6 | formulario.js, css | E2E viewport móvil (CA-7) |
| RNF-7 | formulario.js | revisión de campos del formulario (CA-18) |
