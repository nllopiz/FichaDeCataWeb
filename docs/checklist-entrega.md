# Checklist de entrega (post-MVP)

> Para el dueño y el Responsable técnico. Todos los ejemplos son ficticios
> (`dueno@ejemplo.test`, `TU-USUARIO`, `NOMBRE-DEL-REPO`); no hay datos reales ni
> credenciales en el repo. La prueba de guardado real se hace con la cuenta del dueño
> y no forma parte de los tests automáticos.

## 0. Antes de empezar

- [ ] `npm test` en verde (167 unitarios).
- [ ] `npm run lint` en verde.
- [ ] `npm run test:e2e` en verde (39 E2E con dobles, nunca una planilla real).
- [ ] `js/config.js` contiene solo el Client ID público; no hay `client_secret`,
      claves ni `.env`.

## 1. Client ID real (ya configurado)

- [x] Proyecto en Google Cloud con Sheets API, Drive API e Identity Services
      (`guia-configuracion-hoja.md`, paso 4).
- [x] ID de cliente OAuth de tipo **Aplicación web**.
- [x] Orígenes autorizados: `http://localhost:4173` y el de GitHub Pages del dueño.
- [x] Client ID público en `js/config.js` (propiedad `clientIdGoogle`). No es un
      secreto y no se guarda en `.env`.

## 2. Prueba de guardado real (la hace el dueño)

- [ ] `npm run dev` y abrir http://localhost:4173.
- [ ] Cargar una ficha de prueba con datos ficticios ("Bodega Ejemplo", "Línea Prueba
      Malbec") y guardar.
- [ ] Identificarse con la cuenta del dueño cuando Google lo pida.
- [ ] Verificar en Drive que existe **FichaCataWeb** con los 35 encabezados de la fila 1
      (`guia-configuracion-hoja.md`, paso 1).
- [ ] Verificar la fila: `autor` es el correo de la cuenta elegida, fechas dd/mm/aaaa y
      hora 24 h.
- [ ] Buscar `ejemp`, abrir la ficha, corregirla y guardar: no debe duplicarse.
- [ ] Recargar con la mitad de la ficha cargada: el borrador se restaura.
- [ ] Borrar la fila de prueba antes de usar la app en el curso.
- [ ] Confirmar que la planilla está en **Restringido** (solo el dueño).

## 3. Publicación en GitHub Pages

- [x] `main` ya está en GitHub (push del 2026-11-01, commit `7302795`; el agente no despliega).
- [ ] Settings → Pages → Deploy from a branch → `main` / root.
- [x] El origen de GitHub Pages ya está autorizado en Google Cloud.
- [ ] Repetir cargar → guardar → buscar → editar desde la URL publicada.
- [ ] Recargar: la app vuelve a pedir identificación (el token no se persiste).

## 4. Cierre

- [ ] CA-17: revisar `githubstatus.com` antes de publicar y anotar las caídas del mes;
      `(minutos del mes − caídas) / minutos del mes ≥ 0,99`.
- [ ] Anotar en MEMORY.md la URL publicada, la fecha de entrega y quién aprobó.
- [ ] Revisar que no se commiteó ningún dato real, ID de planilla ni credencial.
