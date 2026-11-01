# AGENTS.md

## Reglas fijas (no modificar)
- Lee MEMORY.md y docs/constitution.md antes de cualquier tarea.
- Sigue el flujo de la skill sdd. No pases de etapa sin aprobación explícita de una persona.
- La spec manda: si algo no está en la spec, no se implementa. Si falta una decisión, para y pregunta.
- Nunca uses datos reales de personas ni información sensible de la institución. Aplica la skill datos-sensibles.
- No leas ni escribas .env, credenciales ni claves.
- No hagas push, no despliegues y no toques bases de producción.
- No instales dependencias ni skills sin aprobación.
- Una tarea por vez. Tests primero. Detente al terminar.
- Responde en español.

## Proyecto (MVP completo · Etapa 6 · aceptado 2026-10-13)
- Nombre y propósito: **FichaDeCataWeb** — reemplazar las fichas de cata en papel de un
  curso de asesor en vinos por una ficha web: carga rápida con desplegables, edición,
  búsqueda por bodega y por línea, y acceso privado. Spec: `specs/001-mvp/spec.md` (19 RF,
  7 RNF, 9 CL, 21 CA).
- Stack (detalle en docs/decisiones-tecnicas.md): HTML + CSS + Bootstrap + JavaScript
  puro, **sin backend**; Google Sheets API v4 como almacén (una fila por ficha, campos
  múltiples con ";"); Google Identity Services (OAuth, token solo en memoria) al guardar;
  hosting estático (GitHub Pages / Netlify / Vercel); Vitest + Playwright + ESLint/Prettier.
- Estado y comandos (T1–T25 completas; los tres checks en verde):
  - `npm run dev` — servidor estático de desarrollo en http://localhost:4173.
  - `npm test` — 156 unitarios con Vitest (validaciones, catálogos, serialización,
    borrador, auth, Sheets, planilla, búsqueda y documentación).
  - `npm run test:e2e` — 32 E2E con Playwright; GIS y Sheets simulados (route stub),
    nunca una planilla real.
  - `npm run lint` — ESLint + Prettier.
  - Check de cierre de tarea: `npm test` + `npm run lint` + `npm run test:e2e` en verde,
    sin tests pendientes ni skipped.
- UX/UI: Fase 1 (T25) implementada con la dirección “Bitácora de cata” (riel de fases,
  tira móvil, chips, composición y aviso global de guardado). No se alteraron RF/RNF ni
  mensajes. Fase 2 (errores inline, autenticación y estados de carga) y Fase 3 (pulido de
  búsqueda) quedan pendientes de aprobación; “Nueva ficha” aún no pide confirmación.
- Entrega: pendientes el push de T23/T24/T25, la publicación y la prueba de guardado real
  con la planilla del dueño; pasos en `docs/checklist-entrega.md`. `js/config.js` ya tiene
  el Client ID público (T23). No se agregan requisitos fuera de la spec sin aprobación.
- Roles y autenticación, y categorías de datos (ver skill datos-sensibles): un único rol
  **Propietario** (el usuario del curso), identificado con su cuenta de Google **al
  guardar** (RF-17/18/19); sin identificar se carga pero no se registra. Datos manejados:
  solo datos del vino y apreciaciones del propio usuario (RNF-7); **no** hay datos
  personales de terceros ni datos sensibles de instituciones. La planilla es privada de la
  cuenta del dueño. Specs, tests y ejemplos usan datos ficticios ("Bodega Ejemplo").
- Límites del agente (permitido sin preguntar / prohibido): **Permitido:** leer el repo,
  crear y modificar archivos del proyecto, correr tests y lint (bash pedirá permiso según
  opencode.json), escribir docs, specs, planes y tareas. **Prohibido:** leer o escribir
  .env/credenciales, instalar dependencias o skills sin aprobación, hacer push o
  despliegues, tocar una planilla real o credenciales de Google, implementar algo que no
  esté en la spec.
- Zona horaria y formato de fechas: **America/Argentina/Buenos_Aires**; fechas **dd/mm/aaaa**;
  hora **24 h**; interfaz en español; mensajes exactos de la spec (RF-10, RF-11).
- Skills instaladas: previas (sdd, sdd-init, spec-lint, grill-me, systematic-debugging,
  datos-sensibles); de catálogo 2026-10-11 (vitest, playwright-best-practices,
  accessibility, web-design-guidelines); propias 2026-10-11 (seguridad-gis-sheets,
  sheets-api-navegador); de catálogo 2026-10-31 (frontend-design). Detalle y origen en
  MEMORY.md.
