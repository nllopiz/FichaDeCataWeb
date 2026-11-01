# MEMORY

Plantilla: 1.0
Etapa: 6
Proyecto: FichaDeCataWeb (ficha de cata web, MVP en specs/001-mvp)

## Etapas
0 Base · 1 Requisitos · 2 Clarificación · 3 Entrevista técnica · 4 Búsqueda de skills · 5 Arnés completo · 6 Listo

## Aprobaciones
(fecha · etapa · quién aprobó)
- 2026-10-10 · Etapa 1 (Requisitos) · Solicitante ("terminada"); se generó specs/001-mvp/spec.md
- 2026-10-11 · Etapa 2 (Clarificación) · Solicitante (aprobaciones sucesivas); spec final tras nueve pasadas de spec-lint, sin hallazgos en las tres últimas: 16 RF + 7 RNF + 19 CA + 8 CL; P-1..P-7 resueltas

- 2026-10-11 · Etapa 3 (Entrevista técnica) · Responsable técnico ("apruebo"): stack final HTML+CSS+Bootstrap+JS puro sin backend; Google Identity Services (OAuth, token en memoria) y Google Sheets API v4 desde el navegador; hosting estático (GitHub Pages/Netlify/Vercel); Vitest+Playwright, ESLint+Prettier; fechas Buenos Aires dd/mm/aaaa 24h español. Detalle en docs/decisiones-tecnicas.md.
- 2026-10-11 · Etapa 4 (Búsqueda de skills) · Responsable técnico ("apruebo"): selección de 4 skills de skills.sh (vitest, playwright-best-practices, accessibility, web-design-guidelines) + 2 propias (seguridad-gis-sheets, sheets-api-navegador); todas revisadas y copiadas a .agents/skills/.
- 2026-10-11 · Etapa 5 (Arnés completo) · Responsable técnico ("apruebo" + agrega el opcional): AGENTS.md sección Proyecto completada; 6 principios del proyecto en docs/constitution.md; opencode.json con allows para `npm test*`, `npm run lint*` y `npx vitest run*` (git push, rm y .env siguen denegados; bash por defecto "ask").
- 2026-10-11 · Spec 001-mvp · Fase Plan · Responsable técnico ("apruebo"): plan.md con las 9 secciones de la plantilla SDD; grill-me aplicado con 5 preguntas (borrador conservado; columna id con timestamp; precarga en segundo plano; autor = mail de la cuenta; CA-17 sin medición formal); hosting GitHub Pages elegido y justificado; verificado sin contradicciones con docs/decisiones-tecnicas.md.
- 2026-10-11 · Spec 001-mvp · Fase Tareas · Responsable técnico ("aprobado"): tasks.md con 18 tareas (T1-T18) en orden de dependencia y trazabilidad completa RF/RNF → tareas; se inicia implementación con TDD (una tarea por vez).
- 2026-10-11 a 2026-10-13 · Spec 001-mvp · Fase Implementación (T1-T18) · Responsable técnico (aprobación explícita por commit, sin push): 18 commits `32279f7`…`39b099d` + T18; TDD una tarea por vez; checks de cierre en verde (`npm test` + `npm run lint` + `npm run test:e2e`).
- 2026-10-13 · Spec 001-mvp · Cierre del MVP · Responsable técnico ("si a todo"): T18 verificada (checklist CA-1…CA-21 completo en tasks.md, 20 automáticos y CA-17 manual documentado; revisiones de seguridad sin secretos, token solo en memoria y solo datos ficticios) y **MVP aceptado**: 134 unitarios + 24 E2E + lint en verde, trazabilidad 19 RF + 7 RNF completa. Pendiente único: prueba de guardado real con la planilla del dueño (diferida a la entrega; pasos en `docs/checklist-entrega.md`).
- 2026-10-31 · Mantenimiento documental post-MVP · Solicitante (eligió "Docs + checklist de entrega"): AGENTS.md y CHANGELOG.md puestos al día, `package.json` alineado a la versión 1.0.0 y `docs/checklist-entrega.md` nuevo; sin cambios de código ni de spec.
- 2026-10-31 · Spec 001-mvp · T22 (selector de cuenta) · Solicitante ("ok"): `prompt: "select_account"` en el token client para que Google muestre siempre el selector de cuentas al identificarse (dentro de RF-18, sin cambio de spec); 155 unitarios + 27 E2E + lint en verde.
- 2026-10-31 · Entrega · T23 (Client ID real) · Solicitante ("si"): Client ID público configurado en `js/config.js` con orígenes `http://localhost:4173` y `https://nllopiz.github.io`; test de seguridad ajustado (Client ID público ≠ secreto); falta el push y la prueba de guardado real.
- 2026-10-31 · Skills · Solicitante (eligió "Solo frontend-design"): instalada `frontend-design` (anthropics/skills, Apache 2.0); revisada (solo `SKILL.md` + `LICENSE.txt`, sin scripts) y registrada en AGENTS.md y docs/skills-necesarias.md.
- 2026-11-01 · UX/UI · T25 (Fase 1: identidad y estructura) · Solicitante ("ok" tras la revisión del mockup "Bitácora de cata"): implementados barra superior, riel vertical y tira móvil con scroll spy, chips, composición con obligatorio y barra, barra de guardado, `#estado-guardado` global visible en búsqueda, skip link y tarjetas de resultados. Sin cambio de RF/RNF ni de mensajes; 156 unitarios + 32 E2E + lint en verde. Pendientes: Fase 2 (errores inline, autenticación y estados de carga) y Fase 3 (pulido de búsqueda), más la confirmación de "Nueva ficha".
- 2026-11-01 · Entrega · Push de T23/T24/T25 · Solicitante ("listo el push"): `origin/main` y `HEAD` en `9c5ed67`; publicados T23 (Client ID), T24 (skill frontend-design) y T25 (Fase 1 UX/UI). Pendientes: publicación, prueba de guardado real y Fases 2–3.
- 2026-11-01 · UX/UI · Fase 2 (T26/T27) · Solicitante ("Aprobar la enmienda"): RF-11 exige resumen del motivo junto al guardado, marca por campo y foco en el primer control inválido; RNF-5 incluye errores asociados a su campo y estados de carga/autenticación anunciados; CA-2 y CA-11 ajustados. Implementados `js/errores.js`, `aria-busy` en guardado/búsqueda y avisos en `role="status"`; **167 unitarios + 39 E2E + lint** en verde. Pendiente Fase 3 (pulido de búsqueda).

## Decisiones
(resumen; el detalle está en docs/decisiones-tecnicas.md)
- 2026-10-11 · Stack: frontend puro (HTML/CSS/Bootstrap/JS) sin backend; Sheets como almacén (una fila por ficha); Google Identity Services al guardar; hosting estático; Vitest+Playwright+ESLint; Buenos Aires, dd/mm/aaaa, 24 h, español; respaldo = Google Drive.

## Skills instaladas
(nombre · origen · fecha · quién la revisó)
- vitest · skills.sh → github.com/antfu/skills (MIT, Vitest 5.0.1) · 2026-10-11 · agente, aprobada por Responsable técnico
- playwright-best-practices · skills.sh → github.com/currents-dev/playwright-best-practices-skill (MIT) · 2026-10-11 · agente, aprobada por Responsable técnico
- accessibility · skills.sh → github.com/addyosmani/web-quality-skills (MIT, WCAG 2.2) · 2026-10-11 · agente, aprobada por Responsable técnico
- web-design-guidelines · skills.sh → github.com/vercel-labs/agent-skills (sin licencia explícita; uso interno solo lectura) · 2026-10-11 · agente, aprobada por Responsable técnico
- seguridad-gis-sheets · escrita por el agente (área 1 de docs/skills-necesarias.md) · 2026-10-11 · agente, aprobada por Responsable técnico
- sheets-api-navegador · escrita por el agente (área 3 de docs/skills-necesarias.md) · 2026-10-11 · agente, aprobada por Responsable técnico
- frontend-design · skills.sh → github.com/anthropics/skills (Apache 2.0) · 2026-10-31 · agente, aprobada por Solicitante ("Solo frontend-design")

## Sin skill
(áreas sin skill de apoyo; rige solo la constitución)
- Bootstrap: sin skill específica en skills.sh; se cubre con accessibility + conocimientos del Solicitante (HTML/CSS/Bootstrap/JS puro).
- ESLint + Prettier: configuración estándar del stack; no requiere skill de apoyo.

## Cambios de requisitos
(fecha · spec · qué cambió)
- 2026-11-01 · 001-mvp · Aprobado por el Solicitante ("Aprobar la enmienda"): RF-11 ahora pide resumen del motivo junto a la acción de guardar, marca de cada campo faltante y foco en el primero; RNF-5 amplía la accesibilidad AA a errores asociados a su campo y estados de carga/autenticación anunciados; CA-2 y CA-11 actualizados. No cambiaron los mensajes exactos de RF-10/RF-11.
- 2026-10-13 · 001-mvp · Aprobado por el Responsable técnico ("si"): T19 — `autor` = correo de la cuenta elegida en el selector de Google (scope `openid email`, desde el `id_token`); se elimina `CONFIG.correoDueno`; sin correo no se registra y se avisa. T20 — planilla `FichaCataWeb` autogestionada (buscar en Drive → crear con los 35 encabezados → recordar ID en localStorage; scope `drive.file`); `config.js` queda solo con Client ID; se revierte la decisión §7 "configuración manual de la hoja" y se actualizan guías y skill.
- 2026-10-11 · 001-mvp · Ajustes post-entrevista técnica: RNF-1 sin la frase que duplicaba RF-17; P-6 marcada resuelta (datos en Google Sheets). Spec: 19 RF + 7 RNF + 9 CL + 21 CA.
- 2026-10-11 · 001-mvp · Flujo de identificación: carga sin login previo, identificación con cuenta de Google al guardar, sin identificación no se registra la ficha (RF-17/18/19); RNF-1, CL-7, CA-8 ajustadas; CL-9 y CA-20/CA-21 nuevas.
