# Changelog

## Sin publicar (2026-11-01)
- T26/T27 (Fase 2 UX/UI): errores de validación inline con `aria-invalid` y foco en
  el primer control inválido, resumen del motivo junto al guardado, y estados de
  carga/autenticación con `aria-busy` y anuncios en `role="status"`. Enmienda
  aprobada de RF-11/RNF-5 (CA-2 y CA-11 actualizados); mensajes exactos sin cambios.
- T25 (Fase 1 UX/UI): rediseño visual “Bitácora de cata” con barra superior,
  riel vertical y tira móvil de fases, chips de descriptores, composición con
  obligatorio/barra, barra de guardado fija y tarjetas de búsqueda. El estado de
  guardado pasa a un aviso global visible también en búsqueda; se agrega enlace
  para saltar al contenido. Sin cambios de RF/RNF, mensajes ni comportamiento.
- T22: al identificarse, Google muestra siempre el selector de cuentas (`prompt:
  select_account`), para elegir con qué cuenta se guarda y se define `autor` (RF-18).
- T23: Client ID público configurado en `js/config.js` (sin secretos en el repo).
- Skill `frontend-design` instalada (anthropics/skills, Apache 2.0) para la mejora
  UX/UI; revisada: solo `SKILL.md` + `LICENSE.txt`, sin scripts.
- T21: `AGENTS.md` y este changelog actualizados, `package.json` alineado a la versión
  1.0.0 y checklist de entrega en `docs/checklist-entrega.md`. Sin cambios de código.
- Checks: 167 unitarios + 39 E2E + lint en verde.

## 1.0 (2026-10-14)
- MVP de FichaDeCataWeb aceptado el 2026-10-13 (T1–T18) y cerrado con T19–T20: ficha
  de cata completa con desplegables, búsqueda y edición por bodega y línea, borrador
  ante cortes, uso en móvil y accesibilidad AA (19 RF, 7 RNF, 21 CA).
- Identificación con Google Identity Services al guardar, con el token solo en memoria;
  la planilla `FichaCataWeb` se busca o crea sola en el Drive del dueño y su ID se
  recuerda en el navegador. El correo de la cuenta elegida se registra en `autor`.
- Arnés: 150 unitarios (Vitest), 27 E2E (Playwright con dobles, nunca una planilla
  real) y ESLint + Prettier; guías de uso, configuración y despliegue.
