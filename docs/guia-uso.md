# Guía: uso diario de FichaDeCataWeb

Los ejemplos de esta guía son ficticios: "Bodega Ejemplo", "Línea Prueba Malbec",
`dueno@ejemplo.test`.

## 1. Abrir la app

Usá la dirección publicada (ver `guia-despliegue.md`) o, en tu compu,
`http://localhost:4173`. El formulario de carga está disponible **sin identificarse**.

## 2. Cargar y guardar una ficha

1. Completá los campos: elegí de las listas (tipo, tono, descriptores…). Los
   obligatorios son **bodega, tipo, línea, composición, cosecha y graduación**.
2. La **composición** necesita varias filas de cepas que sumen **100 %** exacto
   (el marcador de suma te avisa).
3. Pulsá **Guardar**. Ahí —y solo ahí— Google te pide identificarte con tu cuenta
   (un clic en el popup).
4. Si todo sale bien ves **"Ficha guardada."** y la hoja recibe una fila nueva.
5. Si cancelás el popup: **no se registra nada** y lo escrito sigue en el
   formulario; podés intentar de nuevo.

## 3. Buscar fichas

1. **Buscar fichas** → escribí parte de la **bodega** o de la **línea**: no importan
   mayúsculas ni acentos ("ejemp" encuentra "Bodega Ejemplo").
2. La primera vez que buscás te pide identificarte (así solo vos ves tus fichas).
3. Sin coincidencias aparece **"Sin resultados para ‹lo que escribiste›"**.
4. Tocá un resultado para abrirlo y corregirlo.

## 4. Editar sin duplicar

Al guardar desde un resultado, la app **corrige la fila existente**: no se crea otra
ficha. Si editás la misma ficha desde dos dispositivos, **gana el último guardado**.
El botón **Nueva ficha** vacía el formulario para empezar otra.

## 5. El borrador: tu avance a salvo

- Lo que escribís se guarda solo en tu navegador mientras cargás.
- El **borrador se conserva hasta guardar con éxito o pulsar "Nueva ficha"**:
  si recargás la página o se corta la red, la app lo restaura y te avisa
  ("Recuperamos lo que habías cargado.").
- Si guardás y cancelás la identificación, el borrador **no** se borra.
- Nunca se guardan contraseñas ni tokens: solo datos del vino.

## 6. Re-identificarse cada 7 días (modo "Probando")

Mientras el consentimiento OAuth de Google Cloud esté en **Probando**, Google
caduca la autorización **cada 7 días**. El próximo guardado (o búsqueda) te vuelve
a pedir identificarte: es **un clic**, un caso normal, no un error. Lo mismo pasa
si el token vence antes: te pide identificarte de nuevo y listo.

## 7. Privacidad

- Tus fichas las ves solo vos: la planilla está compartida únicamente con tu
  cuenta (ver `guia-configuracion-hoja.md`).
- Si Google responde que no tenés permiso, la app muestra
  **"No tenés acceso a esta planilla."** sin datos técnicos: revisá con quién está
  compartida la hoja y que te identifiques con la cuenta correcta.

## 8. Fechas

Todo se registra en horario de Buenos Aires con formato **dd/mm/aaaa HH:mm**
(24 h), en las columnas `fecha_creacion` y `fecha_modificacion`, junto con tu
correo en `autor` (CA-9).
