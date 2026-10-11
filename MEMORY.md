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

## Sin skill
(áreas sin skill de apoyo; rige solo la constitución)
- Bootstrap: sin skill específica en skills.sh; se cubre con accessibility + conocimientos del Solicitante (HTML/CSS/Bootstrap/JS puro).
- ESLint + Prettier: configuración estándar del stack; no requiere skill de apoyo.

## Cambios de requisitos
(fecha · spec · qué cambió)
- 2026-10-11 · 001-mvp · Ajustes post-entrevista técnica: RNF-1 sin la frase que duplicaba RF-17; P-6 marcada resuelta (datos en Google Sheets). Spec: 19 RF + 7 RNF + 9 CL + 21 CA.
- 2026-10-11 · 001-mvp · Flujo de identificación: carga sin login previo, identificación con cuenta de Google al guardar, sin identificación no se registra la ficha (RF-17/18/19); RNF-1, CL-7, CA-8 ajustadas; CL-9 y CA-20/CA-21 nuevas.
