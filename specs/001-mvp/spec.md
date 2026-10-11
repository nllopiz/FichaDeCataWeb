# Spec 001-mvp: Ficha de Cata Web (MVP)

> Solo el QUÉ y el POR QUÉ. Sin stack ni arquitectura.
> Datos de ejemplo ficticios (skill datos-sensibles): "Bodega Ejemplo", "Línea Prueba Malbec".

## 1. Contexto y problema

El usuario cursa un curso de asesor en vinos y registra sus catas en fichas de papel.
Problemas del proceso actual:

- Cargar una ficha a mano es lento; campos con valores conocidos (tipo de vino, etc.)
  se reescriben siempre a mano.
- Las fichas archivadas en carpeta son difíciles de consultar: la búsqueda hoy es
  hojear el papel por bodega o nombre del vino.
- El papel obliga a estar en un solo lugar; hoy solo llena en clase.

Éxito del proyecto (declarado por el usuario): tener las fichas en forma digital,
agilizar la carga con campos desplegables y poder buscar digitalmente por bodega y
por nombre del vino.

## 2. Usuarios y roles

| Rol | Quién es | Qué puede hacer |
|---|---|---|
| Propietario (único) | El propio usuario del curso | Crear, editar, buscar y ver sus fichas |

- No hay otros roles en la v1: nadie corrige, administra ni revisa fichas de terceros.
- No hay uso compartido: cada ficha pertenece al propietario.

## 3. Alcance

- Alta de ficha de cata con la estructura actual de la ficha de papel:
  - Datos del vino a degustar: nombre de la bodega, ubicación de la bodega en tres campos
    de texto libre (país, provincia y zona), tipo de vino, nombre de la línea de vino
    (= nombre del vino), composición (una fila por cepa: varietal en texto libre + porcentaje), cosecha,
    graduación alcohólica.
  - Notas de cata:
    - Fase visual / color: tono o matiz, intensidad del color, vivacidad y brillo,
      limpieza y transparencia, evolución.
    - Fase olfativa: limpieza o franqueza, expresión-intensidad, notas aromáticas, equilibrio.
    - Fase gustativa: dulzor, acidez, taninos (cantidad y calidad), alcohol, cuerpo,
      entrada o ataque en boca, evolución o medio de boca, aromas de boca,
      impresión final, postgusto.
  - Separador y campo final: apreciación personal del vino.
- Edición de una ficha existente (corregir datos en el mismo lugar, como tachar y reescribir).
- Búsqueda de fichas por nombre de la bodega y por nombre de la línea de vino.
- Guardado con campos obligatorios definidos y permitido guardar el resto incompleto.
- Protección ante doble activación de guardado (sin fichas duplicadas).
- Conservación del avance cargado cuando se corta la conexión.
- Carga de la ficha sin identificación previa; la identificación (cuenta de Google) ocurre al guardar.
- Acceso privado: solo el propietario identificado ve y edita sus fichas.
- Uso desde teléfono y desde computadora.

## 4. Fuera de alcance (v1)

Declarado por el usuario (2026-10-10):

- Compartir fichas con otros usuarios.
- Sistema de puntuación.
- Fotos (por ejemplo de la botella o de la etiqueta).
- Estadísticas.
- Exportación a PDF (pospuesta por el usuario a una versión posterior; P-5).
- Borrado de fichas (decisión 2026-10-10: no disponible en la v1).

## 5. Requisitos funcionales (RF)

- RF-1: EL SISTEMA permite crear una ficha de cata con los campos y secciones descritos en el Alcance.
- RF-2: CUANDO el usuario guarda una ficha con los campos obligatorios completos, EL SISTEMA la guarda.
- RF-3: SI al guardar faltan uno o más campos obligatorios (nombre de la bodega, tipo de vino, nombre de la línea de vino, composición con al menos una cepa, cosecha, graduación alcohólica), ENTONCES EL SISTEMA impide el guardado.
- RF-4: SI los campos obligatorios están completos, ENTONCES EL SISTEMA permite guardar la ficha aunque el resto de los campos estén vacíos.
- RF-5: CUANDO el usuario activa el guardado dos veces dentro de los 2 segundos, EL SISTEMA registra exactamente una ficha.
- RF-6: SI la conexión se interrumpe mientras el usuario carga o edita una ficha, ENTONCES EL SISTEMA conserva lo ya escrito para que el usuario pueda continuar después.
- RF-7: EL SISTEMA permite buscar fichas por nombre de la bodega y por nombre de la línea de vino, con coincidencia parcial y sin distinguir mayúsculas ni acentos.
- RF-8: CUANDO el usuario modifica una ficha existente, EL SISTEMA conserva una única ficha con los datos corregidos (no duplica la ficha al editarla).
- RF-9: EL SISTEMA ofrece como lista de selección simple los siguientes campos, con estos valores cerrados:
  - Tipo de vino: Tinto, Blanco, Rosado, Naranjo, Espumante, Dulce o de cosecha tardía, Fortificado o generoso. (Para Espumante, los datos dependientes de color y método están en RF-16.)
  - Cosecha: años desde el actual hacia atrás, más "Sin añada (NV)".
  - Intensidad del color: Baja, Media, Alta.
  - Vivacidad y brillo: Apagado, Poco brillante, Brillante, Muy brillante.
  - Limpidez y transparencia: Cristalino, Limpio, Velado, Turbio; y para tintos: Transparente, Translúcido, Opaco, Cubierto.
  - Evolución (color): Joven, En desarrollo, Evolucionado, Oxidado.
  - Limpieza o franqueza: Franco, Con defecto leve, Defectuoso (con lista de defecto: TCA, reducción, acidez volátil, oxidación, Brett).
  - Expresión-Intensidad: Baja, Media-, Media, Media+, Alta.
  - Equilibrio: Desequilibrado, Poco equilibrado, Equilibrado, Armónico.
  - Dulzor: seco, semiseco, semidulce, dulce.
  - Acidez: baja, media, alta.
  - Taninos (cantidad): bajos, medios, altos.
  - Taninos (calidad): sedosos, redondos, firmes, rugosos, astringentes.
  - Alcohol (percepción en boca): bajo, medio, alto. (Coexiste con la graduación alcohólica numérica de Datos del vino.)
  - Cuerpo: ligero, medio, pleno.
  - Entrada: suave, fresca, ácida, cálida, astringente, untuosa.
  - Postgusto (persistencia): Corto, Medio, Largo, Muy largo.
  - Impresión final: Defectuoso, Pobre, Aceptable, Bueno, Muy bueno, Sobresaliente.
  (La varietal de la composición y los campos de texto libre no forman parte de esta lista.)
- RF-10: CUANDO una búsqueda no arroja resultados, EL SISTEMA muestra el mensaje "Sin resultados para ‹término buscado›".
- RF-11: CUANDO el guardado se rechaza, EL SISTEMA indica al usuario el motivo (campos obligatorios faltantes o suma de composición distinta de 100).
- RF-12: CUANDO el usuario selecciona el tipo de vino, EL SISTEMA ofrece el tono o matiz correspondiente a ese tipo:
  - Blanco: limón-verdoso, limón, dorado, ámbar.
  - Rosado: rosa pálido, salmón, rosa, frambuesa.
  - Tinto: púrpura, rubí, granate, teja.
  - Naranjo: valores de blanco, más cobre.
  - Espumante blanco: valores de blanco, más cobre.
  - Espumante rosado: valores de rosado.
- RF-13: EN los campos notas aromáticas y aromas de boca, EL SISTEMA permite seleccionar varios descriptores organizados en dos niveles (familia → descriptor) con este catálogo compartido:
  - Frutales: cítricos, carozo, tropicales, frutas rojas, frutas negras, secas o confitadas.
  - Florales: rosa, violeta, azahar, jazmín, acacia, saúco, manzanilla.
  - Vegetales y herbáceos: pimiento, hierba cortada, menta, hoja de tomate, alcachofa, tomillo, laurel, espárrago.
  - Especiados: pimienta, clavo, canela, regaliz, jengibre, nuez moscada, comino.
  - Crianza (secundarios): vainilla, coco, tostado, ahumado, cacao, café, manteca.
  - Terciarios: cuero, tabaco, tierra, hongos, miel, frutos secos.
  - Minerales: tiza, piedra húmeda, pizarra, sílex, tierra mojada, grafito, sal.
- RF-14: SI la suma de los porcentajes de las cepas de la composición es distinta de 100, ENTONCES EL SISTEMA impide el guardado.
- RF-15: CUANDO el usuario guarda la misma ficha desde dos dispositivos, EL SISTEMA conserva la versión guardada más reciente (gana el último guardado).
- RF-16: CUANDO el usuario selecciona Espumante como tipo de vino, EL SISTEMA solicita además elegir el color del espumante (Blanco o Rosado) y el método de elaboración (tradicional, Charmat o ancestral).
- RF-17: EL SISTEMA permite completar el formulario de carga de la ficha sin identificarse.
- RF-18: CUANDO el usuario activa Guardar sin haberse identificado, EL SISTEMA solicita identificarse con su cuenta de Google antes de guardar.
- RF-19: SI el usuario no completa la identificación, ENTONCES EL SISTEMA no registra la ficha.

## 6. Requisitos no funcionales (RNF)

- RNF-1 (seguridad y permisos): EL SISTEMA permite buscar, ver y editar una ficha guardada únicamente a su propietario identificado; un tercero no identificado no puede consultarlas ni modificarlas, ni siquiera con el enlace de la ficha.
- RNF-2 (auditoría): EL SISTEMA registra para cada ficha su autor, fecha de creación y fecha de última modificación.
- RNF-3 (rendimiento): CUANDO el usuario busca o abre una ficha, EL SISTEMA responde en menos de 2 segundos con 500 fichas cargadas.
- RNF-4 (disponibilidad): EL SISTEMA mantiene disponibles las fichas ya guardadas para consulta y búsqueda, con una disponibilidad de al menos el 99% del tiempo mensual y sin mantenimiento programado en horario de uso.
- RNF-5 (accesibilidad): EL SISTEMA cumple el nivel AA de WCAG 2.1 (navegación con teclado, anuncio por lector de pantalla, contraste y tamaño de texto).
- RNF-6 (uso en móvil): MIENTRAS el usuario opera desde un teléfono, EL SISTEMA habilita el flujo completo cargar → buscar → editar sin ocultar ni recortar campos.
- RNF-7 (datos): EL SISTEMA solo solicita datos del vino y apreciaciones del propio usuario; no pide datos personales de terceros.

## 7. Casos límite

- CL-1: Doble toque rápido en "guardar" → no debe crear dos fichas (RF-5).
- CL-2: Corte de conexión a mitad de carga o edición → no se pierde lo escrito (RF-6).
- CL-3: Guardar con uno o más campos obligatorios vacíos → se bloquea y se informa qué falta (RF-3, RF-11).
- CL-4: Editar una ficha ya existente y guardar → queda una sola ficha corregida (RF-8).
- CL-5: Búsqueda sin coincidencias → mensaje claro de sin resultados (RF-10).
- CL-6: Dos sesiones abiertas a la vez (teléfono y computadora) editando la misma ficha → gana el último guardado (RF-15).
- CL-7: Intentar acceder a las fichas guardadas sin identificarse → el sistema no muestra contenido guardado y pide identificarse (RNF-1); el formulario de carga nueva sí está disponible sin identificarse (RF-17).
- CL-8: Guardar la composición con cepas cuyos porcentajes no suman 100 → se bloquea y se informa la suma actual (RF-14, RF-11).
- CL-9: Guardar una ficha sin haberse identificado → el sistema solicita identificarse con Google antes de guardar (RF-18).

## 8. Criterios de aceptación

- CA-1: Se puede crear una ficha completa con todos los campos del Alcance y volver a encontrarla por bodega y por línea de vino (RF-1, RF-2, RF-7).
- CA-2: Guardar sin uno de los campos obligatorios es rechazado con mensaje que nombra los campos faltantes; guardando esos campos, la ficha se guarda aunque falten datos opcionales (RF-3, RF-11, RF-4).
- CA-3: Un doble toque en "guardar" produce exactamente una ficha (RF-5).
- CA-4: Simulada la pérdida de conexión a mitad de carga o edición, el avance sigue disponible y no se pierde (RF-6).
- CA-5: Editar una ficha y guardarla no incrementa la cantidad de fichas; la búsqueda devuelve la versión corregida (RF-8).
- CA-6: Cada campo de la lista de RF-9 se carga eligiendo de la lista, sin escribir valores propios (RF-9).
- CA-7: Desde un teléfono se completa el flujo cargar → buscar → editar sin perder campos (RNF-6).
- CA-8: Una persona distinta del propietario no puede ver ni editar fichas guardadas, ni con el enlace directo de una ficha (RNF-1).
- CA-9: Cada ficha muestra autor y fechas de creación y modificación (RNF-2).
- CA-10: La búsqueda responde en menos de 2 segundos con 500 fichas cargadas (RNF-3).
- CA-11: El flujo principal es navegable con teclado y anunciable por lector de pantalla (RNF-5).
- CA-12: Elegido un tipo de vino, el tono o matiz solo ofrece valores de ese tipo (RF-12); y en notas de cata se pueden seleccionar varios descriptores de distintas familias (RF-13).
- CA-13: Una composición con porcentajes que suman 100 guarda correctamente y otra que suma 95 o 105 se rechaza con el motivo indicado (RF-14, RF-11).
- CA-14: Guardada la misma ficha desde dos dispositivos, la búsqueda devuelve la versión guardada al final (RF-15).
- CA-15: Elegido Espumante como tipo de vino, aparecen los datos de color y método de elaboración, y el tono o matiz ofrecido depende del color elegido (RF-16, RF-12).
- CA-16: Una búsqueda sin coincidencias muestra el mensaje "Sin resultados para ‹término buscado›" (RF-10).
- CA-17: No hay interrupciones programadas en horario de uso y la disponibilidad mensual registrada es de al menos el 99% (RNF-4).
- CA-18: El formulario de ficha no solicita datos personales de terceros (RNF-7).
- CA-19: Escrito "ejemp", la búsqueda encuentra la ficha con bodega "Bodega Ejemplo", y "prueba" encuentra "Línea Prueba Malbec", sin distinguir mayúsculas ni acentos (RF-7).
- CA-20: Completado el formulario sin identificarse, al guardar se solicita iniciar sesión con la cuenta de Google y, una vez identificado, la ficha queda registrada (RF-18, RF-2).
- CA-21: Sin identificarse no hay ninguna ficha registrada; abandonar el formulario sin guardar no deja ficha (RF-19).

## 9. Preguntas abiertas

- ~~P-1~~ (resuelta 2026-10-10): campos desplegables definidos en RF-9, RF-12 y RF-13; escala de intensidad del color: Baja, Media, Alta.
- ~~P-2 / P-2b~~ (resueltas 2026-10-10 por P-7): protección confirmada como privada.
- ~~P-3~~ (resuelta 2026-10-10): edición simultánea → gana el último guardado (RF-15, CL-6, CA-14).
- ~~P-4~~ (resuelta 2026-10-10): la búsqueda de la v1 es solo por bodega y línea de vino (RF-7 sin cambios).
- ~~P-5~~ (resuelta 2026-10-10): sin exportación a PDF en la v1; pasada a Fuera de alcance. No se definen formato ni idioma de PDF.
- ~~P-6~~ (resuelta 2026-10-11): identidad = cuenta de Google, identificándose al guardar (RF-18); datos = Google Sheets vía API (una fila por ficha). Riesgos y alternativas registrados en docs/decisiones-tecnicas.md.
- ~~P-7~~ (resuelta 2026-10-10): las fichas son privadas; solo el propietario identificado ve y edita (RNF-1, CL-7, CA-8).
