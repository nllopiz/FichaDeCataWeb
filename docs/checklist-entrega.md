# Checklist de entrega (post-MVP)

> Para el dueño y el Responsable técnico. Todos los ejemplos son ficticios
> (`dueno@ejemplo.test`, `TU-USUARIO`, `NOMBRE-DEL-REPO`); no hay datos reales ni
> credenciales en el repo. La prueba de guardado real se hace con la cuenta del dueño
> y no forma parte de los tests automáticos.

## 0. Antes de empezar

- [ ] `npm test` en verde (154 unitarios).
- [ ] `npm run lint` en verde.
- [ ] `npm run test:e2e` en verde (27 E2E con dobles, nunca una planilla real).
- [ ] `js/config.js` sigue con el placeholder `REEMPLAZAR_CLIENT_ID` en el repo.

## 1. Client ID real (una sola vez)

- [ ] Crear el proyecto en Google Cloud y habilitar Sheets API, Drive API e Identity
      Services (`guia-configuracion-hoja.md`, paso 4).
- [ ] Crear un ID de cliente OAuth de tipo **Aplicación web**.
- [ ] Autorizar los orígenes `http://localhost:4173` y `https://TU-USUARIO.github.io`.
- [ ] Pegar el Client ID en `js/config.js`. Es un valor público por diseño: no es un
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

- [ ] El dueño sube `main` a GitHub (`git push` lo hace él; el agente no publica).
- [ ] Settings → Pages → Deploy from a branch → `main` / root.
- [ ] Agregar la URL publicada en los orígenes autorizados de Google Cloud.
- [ ] Repetir cargar → guardar → buscar → editar desde la URL publicada.
- [ ] Recargar: la app vuelve a pedir identificación (el token no se persiste).

## 4. Cierre

- [ ] CA-17: revisar `githubstatus.com` antes de publicar y anotar las caídas del mes;
      `(minutos del mes − caídas) / minutos del mes ≥ 0,99`.
- [ ] Anotar en MEMORY.md la URL publicada, la fecha de entrega y quién aprobó.
- [ ] Revisar que no se commiteó ningún dato real, ID de planilla ni credencial.
