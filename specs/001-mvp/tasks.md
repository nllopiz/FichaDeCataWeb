# Tareas 001-mvp: Ficha de Cata Web (MVP)

> Derivado de `specs/001-mvp/spec.md` y `specs/001-mvp/plan.md` (aprobados 2026-10-11).
> Flujo: una tarea por vez, TDD (rojo → verde → refactor), checks de cierre de AGENTS.md
> (`npm test` + `npm run lint` + `npm run test:e2e` en verde), commit `Tn: descripción`,
> y detenerse. Datos ficticios en todos los tests (skill datos-sensibles).

## Tareas

- [x] **T1. Arnés del proyecto.** `package.json` con scripts (`dev`, `test`, `test:e2e`,
  `lint`), `eslint.config.js`, `playwright.config.js`, estructura de carpetas del plan,
  `index.html` mínimo con las tres vistas ocultas/mostradas y `config.js` con placeholders
  públicos (client ID e ID de hoja, sin secretos). RF-17
  - Hecho cuando: `npm test`, `npm run lint` y un E2E smoke (abre `index.html` y ve el
    formulario) pasan en verde; no hay secretos en el repo. ✔ 2026-10-11

- [x] **T2. Catálogos cerrados (datos).** `js/catalogos.js` con RF-9 (todos los campos
  de lista cerrada, incluida la lista de defectos), RF-12 (tono por tipo, con naranjo y
  espumantes), RF-16 (color y método para espumante) y RF-13 (familias → descriptores).
  RF-9, RF-12, RF-13, RF-16
  - Hecho cuando: unitarios verifican que cada campo de RF-9 tiene exactamente sus
    valores (CA-6), que naranjo = blanco + cobre (CA-12) y que espumante ofrece color y
    método (CA-15); rojo primero, verde después. ✔ 2026-10-11 (13 tests)
  - Nota: la lista de cosecha cubre el año actual + 50 hacia atrás + "Sin añada (NV)"
    (la spec no fija el alcance del historial); Dulce y Fortificado quedan sin tono
    definido en la v1 (opcional, RF-4).

- [x] **T3. Normalización de texto.** `js/normalizacion.js`: `normalizarTexto` (minúsculas
  + NFD sin marcas diacríticas) y `coincide` (coincidencia parcial). RF-7
  - Hecho cuando: "ejemp" encuentra "Bodega Ejemplo" y "prueba" encuentra "Línea Prueba
    Malbec" sin distinguir mayúsculas ni acentos (CA-19); tests rojos primero. ✔ 2026-10-11
    (8 tests; además: eñe → n, espacios colapsados, término vacío no coincide)

- [x] **T4. Validaciones de guardado.** `js/validaciones.js`: `validarFicha`,
  `sumarComposicion`, `camposObligatorios`; produce los motivos exactos de RF-11.
  RF-3, RF-4, RF-11, RF-14
  - Hecho cuando: guardar sin un obligatorio se rechaza nombrándolo (CA-2); composición
    que suma 100 pasa y 95 o 105 se rechaza informando la suma (CA-13); guardar con
    obligatorios completos y opcionales vacíos es válido (RF-4). ✔ 2026-10-11 (13 tests;
    además: graduación acepta coma o punto decimal y rechaza no-numéricos)

- [x] **T5. Serialización y saneado.** `js/serializacion.js`: `serializarFila`/`parsearFila`
  con separador ";", `saneado` anti-fórmula (`=`, `+`, `-`, `@` → `'`) y `generarId`
  (timestamp epoch ms monótono). RF-1, RF-14
  - Hecho cuando: el round-trip serialize→parsear devuelve la misma ficha; una nota que
    empieza con "=" se guarda precedida de comilla simple (skill seguridad-gis-sheets);
    dos `generarId()` consecutivos son distintos. ✔ 2026-10-11 (12 tests; 35 columnas
    en el orden del plan §2)

- [x] **T6. Borrador en localStorage.** `js/borrador.js`: persistir por clave (`"nueva"`
  o `id`), recuperar, borrar tras guardado exitoso y al crear formulario nuevo. RF-6
  - Hecho cuando: con jsdom, persistir→recuperar devuelve el mismo contenido; el borrador
    se borra al guardar y al pulsar "Nueva ficha" (grill-me p. 1); no guarda token. ✔
    2026-10-11 (7 tests; además: borradores independientes por ficha, JSON corrupto →
    null, cuota llena → `false` sin lanzar)

- [x] **T7. Identificación con Google (GIS).** `js/auth.js`: token client con scope
  mínimo, token **solo en memoria**, `obtenerToken()` (popup) y `descartarToken()`;
  manejo de cancelación. RF-18, RF-19, RNF-1
  - Hecho cuando: unitarios con doble de GIS verifican que el token nunca se escribe en
    localStorage ni en el DOM; cancelar el popup devuelve "sin token" sin error. ✔
    2026-10-11 (11 tests; además: scope mínimo exacto, no pide token al iniciar,
    reutiliza token en memoria, `revoke` al descartar)

- [x] **T8. Cliente de Sheets con caché.** `js/sheets.js`: `batchGet` único,
  `append`, `batchUpdate` por `id`, caché en memoria invalidada al escribir, y mapeo de
  errores 401/403/429/5xx a estados de la app. RF-2, RNF-1, RNF-2, RNF-3
  - Hecho cuando: con `route` de Playwright y datos ficticios, la lectura cachea (una
    sola llamada por precarga); 403 produce "no tenés acceso" sin datos técnicos (CA-8);
    cada fila escrita incluye `id`, `autor` (mail), `fecha_creacion` y
    `fecha_modificacion` (CA-9). ✔ 2026-10-11 (18 tests unitarios con doble de `fetch`:
    caché y una sola llamada, validación de encabezados sin escribir, fila por id,
    errores mapeados sin datos técnicos; los E2E con `route` de Playwright se hacen en
    T14–T16 donde ya existe la vista cableada)

- [x] **T9. Formulario completo.** `js/formulario.js` + `index.html` + `css/estilos.css`:
  todas las secciones de la ficha (datos del vino, visual, olfativa, gustativa,
  apreciación), selects de RF-9, tono dependiente (RF-12), espumante con color/método
  (RF-16), multiselección dos niveles (RF-13) y filas de cepas con porcentaje (RF-14).
  RF-1, RF-9, RF-12, RF-13, RF-14, RF-16
  - Hecho cuando: E2E carga una ficha completa con todos los campos de la spec
    (CA-1); elegir Tinto acota el tono a sus valores (CA-12); elegir Espumante muestra
    color y método (CA-15); se pueden marcar descriptores de distintas familias (CA-12).
    ✔ 2026-10-12 (4 E2E nuevos + 5 unitarios de `leerFicha`; además: limpieza con
    valores extra de tintos, defecto solo con "Defectuoso", suma de composición en vivo
    con `aria-live`, quitar cepa sin dejar el formulario sin filas)

- [x] **T10. Orquestación del guardado.** `js/guardado.js`: bloqueo de doble toque
  (2 s), flujo guardar → identificar si hace falta → registrar (append o
  batchUpdate por id), auditoría, y borrado de borrador solo en éxito. RF-2, RF-5,
  RF-8, RF-15, RF-17, RF-18, RF-19, RNF-2
  - Hecho cuando: doble toque real en E2E produce exactamente una ficha (CA-3); guardar
    sin identificar abre el popup y, tras identificar, se registra (CA-20); cancelar la
    identificación no registra nada (CA-21); editar y guardar no incrementa el total y
    la búsqueda devuelve la versión corregida (CA-5). ✔ 2026-10-12 (17 unitarios + 4
    E2E nuevos; CA-5 unitario por id con `batchUpdate` — su E2E con búsqueda llega en
    T11; además: 401 descarta y reintenta una vez, fechas dd/mm/aaaa 24 h en Buenos
    Aires, `autor` = `CONFIG.correoDueno` (decisión: mail del dueño en config pública,
    sin scope de perfil))

- [x] **T11. Búsqueda y resultados.** `js/busqueda.js` + `js/ui.js`: búsqueda sobre la
  caché con debounce, mensaje exacto "Sin resultados para ‹término›", vista de
  resultados y apertura para editar. RF-7, RF-10, RF-8
  - Hecho cuando: E2E encuentra fichas por bodega y por línea con texto parcial
    (CA-19); una búsqueda sin coincidencias muestra el mensaje exacto (CA-16) anunciado
    por `aria-live`. ✔ 2026-10-12 (4 E2E nuevos —incluye CA-5 editar sin duplicar y
    "Nueva ficha"— y 16 unitarios; buscar exige identificarse según CL-7; navegación
    entre vistas; fix de `auth.js`: `obtenerToken` devolvía `null` con callback
    síncrono, con test de regresión)

- [x] **T12. Precarga y avance ante corte de conexión.** Precarga de la hoja en segundo
  plano al abrir (con "Cargando…" en búsqueda) y cableo del borrador al formulario:
  recargar o perder la red restaura lo escrito. RF-6, RNF-3
  - Hecho cuando: E2E con `route.abort` a mitad de carga y recarga muestra el avance
    restaurado (CA-4); la primera búsqueda con caché precargada responde < 2 s con 500
    filas ficticias (CA-10). ✔ 2026-10-12 (2 E2E nuevos —CA-4 y CA-10— y 1 unitario;
    precarga concurrente compartida en `sheets.js`, precarga en segundo plano tras
    guardar y aviso "Recuperamos lo que habías cargado." al restaurar; la precarga al
    abrir solo ocurre cuando ya hay token, porque el token vive solo en memoria —RF-19)

- [x] **T13. Uso en móvil.** Ajustes de `css/estilos.css` y del formulario para
  teléfono: todas las secciones visibles y operables sin recortes. RNF-6
  - Hecho cuando: E2E en viewport de teléfono completa cargar → buscar → editar sin
    campos ocultos (CA-7). ✔ 2026-10-13 (2 E2E nuevos: CA-7 a 390 px y a 320 px, con
    verificación de scroll horizontal, controles fuera de pantalla y campos ocultos
    fuera de los bloques condicionales; **no hizo falta cambiar CSS**: la columna única
    de Bootstrap y `.fila-cepa` ya caben — medido, fila de cepas 12..308 dentro de 320
    con `scrollWidth` = 320; el `viewport` meta ya estaba)

- [x] **T14. Accesibilidad AA.** `labels` asociados, `aria-live` para errores y
  resultados, foco visible, contraste y navegación con teclado del flujo completo.
  RNF-5
  - Hecho cuando: E2E recorre carga → guardar → búsqueda solo con teclado y los
    errores se anuncian con roles/estados correctos (CA-11); revisión de contraste de
    los componentes Bootstrap usados. (Opcional `@axe-core/playwright`: instalar solo
    con aprobación expresa.) ✔ 2026-10-13 (4 E2E nuevos + 1 unitario: CA-11 teclado
    puro con `Tab`/flechas y errores por `role="status"`; nombre accesible de todo
    control; foco visible (CSS nuevo con outline ≥3:1, ganándole a `outline: 0` de
    Bootstrap); contraste AA 4.5:1 medido por código sobre los textos y botones.
    `mostrarVista` ahora lleva el foco al título de la vista nueva — WCAG 2.4.3.
    `#suma-composicion` ganó `role="status"`. El contraste de los colores actuales ya
    pasaba; no se instaló `@axe-core/playwright` — pendiente de aprobación expresa)

- [ ] **T15. Concurrencia y gana el último.** E2E con dos contextos de navegador:
  ambos guardan la misma ficha; el último guardado es la versión vigente en la
  búsqueda. RF-15
  - Hecho cuando: CA-14 pasa: guardado desde el segundo contexto, la búsqueda devuelve
    esa versión y el total de fichas no cambia.

- [ ] **T16. Permisos de la hoja privada.** Verificación E2E del tercero: contexto sin
  token (o con cuenta distinta simulada) no ve ni puede editar fichas guardadas; el
  formulario de carga nueva sigue disponible sin identificar. RNF-1, RF-17, RF-7
  - Hecho cuando: CA-8 pasa con el doble sin acceso; CA-21 y CL-7 cubiertos en el mismo
    escenario.

- [ ] **T17. Guías del Solicitante.** `docs/guia-configuracion-hoja.md` (crear hoja con
  encabezados exactos, compartir solo con la cuenta del dueño),
  `docs/guia-despliegue.md` (GitHub Pages paso a paso) y `docs/guia-uso.md` (uso diario,
  re-autorización cada 7 días en modo "Probando", aviso de que el borrador se conserva
  hasta guardar o crear nuevo). RNF-1, RNF-4
  - Hecho cuando: las tres guías existen, usan datos ficticios y la de hoja lista los
    encabezados en el orden exacto del plan (sección 2).

- [ ] **T18. Verificación final del MVP.** Recorrido completo: `npm test` +
  `npm run lint` + `npm run test:e2e` en verde; checklist CA-1 a CA-21 contra la spec;
  revisión de que no hay secretos, que el token no se persiste y que solo hay datos
  ficticios en tests. RNF-1, RNF-2, RNF-3, RNF-4, RNF-5, RNF-6, RNF-7
  - Hecho cuando: los 21 CA están verificados (automáticos o con pasos manuales
    documentados), la trazabilidad de abajo está completa y el Responsable técnico
    acepta el MVP.

## Trazabilidad RF/RNF → tareas

| Requisito | Tarea(s) |
|---|---|
| RF-1 | T5, T9 |
| RF-2 | T8, T10 |
| RF-3 | T4 |
| RF-4 | T4 |
| RF-5 | T10 |
| RF-6 | T6, T12 |
| RF-7 | T3, T11, T16 |
| RF-8 | T10, T11 |
| RF-9 | T2, T9 |
| RF-10 | T11 |
| RF-11 | T4, T11 |
| RF-12 | T2, T9 |
| RF-13 | T2, T9 |
| RF-14 | T4, T5, T9 |
| RF-15 | T8, T10, T15 |
| RF-16 | T2, T9 |
| RF-17 | T1, T9, T10, T16 |
| RF-18 | T7, T10 |
| RF-19 | T7, T10 |
| RNF-1 | T7, T8, T16, T17 |
| RNF-2 | T8, T10 |
| RNF-3 | T8, T12 |
| RNF-4 | T17, T18 |
| RNF-5 | T14, T18 |
| RNF-6 | T13 |
| RNF-7 | T9 (solo campos del vino), T18 |
