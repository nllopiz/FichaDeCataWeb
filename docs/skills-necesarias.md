# Skills necesarias (Etapa 3 → Etapa 4)

Áreas que necesitan una skill de apoyo según el stack elegido, y qué debe cubrir cada una.
La Etapa 4 exige como mínimo una skill de seguridad y una de testing para el stack.
Stack: HTML + CSS + Bootstrap + JavaScript puro, **sin backend**; Google Identity
Services (OAuth para JS) y Google Sheets API v4 llamados desde el navegador; hosting
estático (GitHub Pages / Netlify / Vercel).

## Selección final (Etapa 4, aprobada 2026-10-11)

| Área | Skill elegida | Origen | Tipo |
|---|---|---|---|
| 1 · Seguridad | `seguridad-gis-sheets` | escrita por el agente | propia |
| 2 · Testing | `vitest` | skills.sh → antfu/skills (MIT) | catálogo |
| 2 · Testing | `playwright-best-practices` | skills.sh → currents-dev (MIT) | catálogo |
| 3 · Sheets | `sheets-api-navegador` | escrita por el agente | propia |
| 4 · Interfaz | `accessibility` | skills.sh → addyosmani/web-quality-skills (MIT, WCAG 2.2 ⊃ 2.1 AA) | catálogo |
| 4 · Interfaz | `web-design-guidelines` | skills.sh → vercel-labs/agent-skills (sin licencia explícita; uso interno de solo lectura) | catálogo |
| 4 · Interfaz | `frontend-design` | skills.sh → anthropics/skills (Apache 2.0) · agregada 2026-10-31 para la mejora UX/UI | catálogo |

Sin skill específica: **Bootstrap** (se cubre con `accessibility` + conocimientos del
Solicitante) y el **TDD loop** (obra/superpowers, descartado por redundante con el
flujo SDD de este proyecto).

## 1. Seguridad (obligatoria)

Stack: Google Identity Services (OAuth 2.0 para JavaScript) + token en el navegador.

Debe cubrir:
- Flujo de Google Identity Services: popup/redirect, obtención del token de acceso,
  expiración y renovación; alcance mínimo (solo hojas de cálculo).
- Manejo correcto del token: solo en memoria, nunca en localStorage/cookies propias,
  nunca en el código; qué hacer al cerrar la sesión de Google.
- Credenciales: el client ID es público por diseño; no debe haber ningún otro secreto
  en el frontend ni en el repositorio (nada de .env con claves en un sitio estático).
- Validación de entradas del formulario (RF-3, RF-14) y saneamiento antes de escribir
  en la hoja (inyección de fórmulas, exceso de tamaño de celda).
- Protección de la planilla: privada de la cuenta del dueño; accesible solo con su
  token; cómo verificar que nadie más pueda leerla con el enlace.
- Riesgos conocidos de esta arquitectura (token en el navegador; caducidad de 7 días
  en modo "Probando") y cómo mitigarlos/documentarlos.

## 2. Testing (obligatoria)

Stack: Vitest (lógica pura) + Playwright (E2E).

Debe cubrir:
- TDD: test rojo → código verde → refactor, una tarea por vez.
- Pruebas de lógica pura con Vitest: validaciones RF-3/RF-14, catálogos RF-9/12/13,
  doble guardado RF-5, gana el último RF-15, normalización de búsqueda RF-7.
- E2E con Playwright: flujo completo carga → login simulado → guardar → buscar en
  viewport móvil y escritorio (RNF-6, CA-7).
- Cómo simular en pruebas el login de Google (stub de GIS) y la API de Sheets (doble
  falso o grabación), sin tocar una planilla real y sin datos reales.
- Datos ficticios obligatorios (skill datos-sensibles).

## 3. Google Sheets desde el navegador

Stack: API v4 REST de Google Sheets.

Debe cubrir:
- Llamadas REST autenticadas desde el navegador (CORS, encabezados, manejo de errores).
- Lectura por lotes eficiente y caché de la hoja en memoria de la página (RNF-3: <2 s
  con 500 filas).
- Escritura por lotes (append/update) y estructura de una fila por ficha con campos
  múltiples separados por ";".
- Cuotas (rate limits) de la API y cómo degradar sin perder datos del usuario.

## 4. Interfaz, Bootstrap y accesibilidad

Stack: HTML + CSS + Bootstrap + JS puro; RNF-5 (WCAG 2.1 AA) y RNF-6 (móvil).

Debe cubrir:
- Formularios Bootstrap accesibles (labels, errores anunciados, foco visible).
- Cumplimiento WCAG 2.1 AA (contraste, teclado, lector de pantalla).
- Formulario largo con secciones en móvil (carga completa sin recortes).
- Desplegables dependientes (RF-12, RF-16) y selección múltiple de dos niveles (RF-13).
