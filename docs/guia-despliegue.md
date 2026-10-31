# Guía: despliegue en GitHub Pages

FichaDeCataWeb es **estática**: HTML + CSS + JavaScript. No hay servidor propio ni
base de datos; los archivos publicados hablan directo con Google. Cualquier hosting
estático sirve, pero esta guía usa **GitHub Pages** (decisión del plan).

## 1. Desarrollo local

```bash
npm install        # solo la primera vez (herramientas de desarrollo)
npm run dev        # servidor estático en http://localhost:4173
npm test           # pruebas unitarias
npm run test:e2e   # pruebas de navegador (usan dobles, nunca tu planilla real)
npm run lint       # formato y estilo
```

## 2. Publicar en GitHub Pages, paso a paso

1. **Subir el repo a GitHub**: creá un repositorio y subí la rama `main`
   (`git push` lo hacés vos; el asistente no hace push).
2. En el repositorio de GitHub: **Settings → Pages**.
3. En **Source**: elegí **Deploy from a branch**.
4. En **Branch**: `main`, carpeta `/ (root)` → **Save**.
5. Esperá un minuto; en **Settings → Pages** aparece la URL pública:
   `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.
6. Abrila y comprobá que carga el formulario.

No hay build: lo que está en la rama `main` es lo que se publica.

## 3. Después de publicar (importante)

1. Agregá el origen de la página en **Google Cloud → Credenciales → ID de cliente
   OAuth → Orígenes JavaScript autorizados**:
   `https://TU-USUARIO.github.io` (ver `guia-configuracion-hoja.md`, paso 4).
   Sin ese paso, guardar desde la página publicada da error de identificación.
2. Verificá el flujo completo: cargar → guardar (con popup de Google) → buscar →
   editar.
3. Si cambiás de dominio o de nombre de repo, repetí el punto 1.

## 4. Actualizaciones

1. Commiteá los cambios en `main` y subilos (`git push`).
2. GitHub Pages vuelve a publicar solo; esperá unos segundos y recargá con
   `Ctrl+F5`.

## 5. Recordatorios de seguridad

- No existen `.env` ni claves en el repo: `js/config.js` solo lleva el Client ID,
  que es público por diseño. La planilla `FichaCataWeb` la busca o crea la app y su
  ID queda en el navegador.
- Nunca cambies el acceso de la planilla a "cualquiera con el enlace"
  (`guia-configuracion-hoja.md`, paso 3).
- Cualquier duda que implique secretos o backend: escalar al Responsable técnico
  (`docs/decisiones-tecnicas.md`).
