# Changelog

## 1.0 (2026-10-14)
- MVP de FichaDeCataWeb aceptado el 2026-10-13 (T1–T18) y cerrado con T19–T20: ficha
  de cata completa con desplegables, búsqueda y edición por bodega y línea, borrador
  ante cortes, uso en móvil y accesibilidad AA (19 RF, 7 RNF, 21 CA).
- Identificación con Google Identity Services al guardar, con el token solo en memoria;
  la planilla `FichaCataWeb` se busca o crea sola en el Drive del dueño y su ID se
  recuerda en el navegador. El correo de la cuenta elegida se registra en `autor`.
- Arnés: 154 unitarios (Vitest), 27 E2E (Playwright con dobles, nunca una planilla
  real) y ESLint + Prettier; guías de uso, configuración y despliegue.
- Puesta al día documental (2026-10-31): AGENTS.md y este changelog actualizados,
  `package.json` alineado a la versión 1.0.0 y checklist de entrega en
  `docs/checklist-entrega.md` (sin cambios de código).
