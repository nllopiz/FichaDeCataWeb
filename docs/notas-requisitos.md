# Notas de requisitos (Etapa 1)

Analista: agente (rol Analista de Software senior). Solo negocio, sin tecnología.
Fecha de inicio: 2026-10-10

## Idea inicial del cliente
(2026-10-10) El cliente está haciendo un curso de asesor en vinos. Hoy usan fichas de
cata en papel. Quiere reemplazarlas por una ficha web para:
- agilizar la carga de datos, y
- buscar fichas con facilidad después.

## Problema y éxito
Problema: las fichas de cata están en papel → carga lenta y búsqueda difícil.
Éxito (respuesta del cliente, 2026-10-10):
- Campos desplegables que reduzcan bastante el tiempo de carga.
- Tener las fichas en forma digital ya es un éxito en sí mismo.
- Poder buscar las fichas digitalmente.
(no hay métricas numéricas ni tiempos objetivo definidos por el momento).

## Quién usa el sistema / roles
(2026-10-10) Uso individual: solo el cliente carga y busca sus propias fichas.
No hay corrección por terceros. (Rol único, sin administración por el momento.)

## Información que maneja y sensibilidad
(2026-10-10) Estructura de la ficha tal como la pidió el cliente:

- Título: Ficha de Cata
- Subtítulo "Datos del Vino a Degustar":
  - Nombre de la bodega
  - Ubicación de la bodega
  - Tipo de vino (espumante, rosado, blanco, etc.)
  - Nombre de la línea de vino
  - Composición (porcentajes varietal o blend)
  - Cosecha
  - Graduación alcohólica
- Subtítulo "Notas de cata: describir el vino utilizando el término correcto de cata":
  - FASE VISUAL / COLOR: tono o matiz, intensidad del color, vivacidad y brillo,
    limpieza y transparencia, evolución
  - FASE OLFATIVA: limpieza o franqueza, expresión-intensidad, notas aromáticas, equilibrio
  - FASE GUSTATIVA: entrada o ataque en boca, evolución o medio de boca, aromas de boca,
    impresión final, postgusto
- Separador
- Campo: Apreciación personal del vino

Sensibilidad: datos de vinos y apreciaciones personales del propio usuario; sin datos
de salud, financieros ni de terceros. (Confirmar en etapas siguientes si se agregan
fechas, autor u otros datos.)

## Cómo se hace hoy / reglas de negocio
(2026-10-10)
- Llena la ficha en clase; quiere poder llenarla en casa o en una degustación
  desde su teléfono (dispositivo móvil).
- Las fichas en papel las guarda en una carpeta; hoy no se usan.
- La búsqueda la hace por bodega o nombre del vino.
- Datos erroneos: corrige tachando y reescribiendo el dato correcto →
  regla: la ficha se corrige en el mismo lugar (edición in situ), no se duplica.

## Qué pasa cuando algo sale mal
(2026-10-10, respuestas del cliente)
1. Doble envío: debe evitarse crear fichas duplicadas si se toca "guardar" dos veces.
2. Corte de conexión: debería poder guardar en local (lo que estaba escribiendo no se pierde).
3. Campos vacíos: se puede guardar incompleta. Campos obligatorios:
   - Nombre de la bodega
   - Tipo de vino
   - Nombre de la línea de vino
   - Composición
   - Cosecha
   - Graduación alcohólica
   (El resto de los campos es opcional.)

## Integraciones con otros sistemas del hospital / institución
(2026-10-10) Sin integraciones. Originalmente mencionó exportar la ficha en PDF para
compartirla; en P-5 (2026-10-10) decidió dejarlo fuera de la v1 ("para más adelante").
No convive con otros sistemas; no se mencionó compartir con docentes ni cargar en
plataformas del curso.

## Volumen, frecuencia y dispositivos
(2026-10-10)
- Frecuencia actual: 4 o 5 fichas cada dos semanas ("semana por medio"), le quedan
  3 meses de curso → ~25-30 fichas en ese periodo.
- Después del curso: 4 o 5 fichas por mes o cada dos meses.
- Volumen total estimado: decenas hoy, cien o pocas más a largo plazo (bajo volumen).
- Dispositivos: teléfono y computadora.

## Fuera de alcance de la v1
(2026-10-10) No entra en la primera versión:
- Compartir fichas con otros usuarios
- Sistema de puntuación
- Fotos
- Estadísticas

## Preguntas abiertas
- (Resuelta 2026-10-10) Búsqueda: "nombre del vino" = campo "Nombre de la línea de vino".
  No hace falta un campo nuevo de nombre de vino. Búsqueda por bodega y por línea de vino.
- (Resuelta 2026-10-10, P-7) Protección de fichas: **privadas**. Solo el propietario
  identificado ve, edita y borra; ni siquiera con el enlace. (Primero había elegido
  "sin protección", luego cambió.)
- (Resuelta 2026-10-10, P-5) PDF: **fuera de la v1**; queda para una versión posterior.
  No se definió formato ni idioma de PDF.
- (Decisión 2026-10-10) Borrado de fichas: **fuera de la v1**; el cliente eligió que no
  haya opción de borrar.
- (Resuelta 2026-10-10, P-4) Búsqueda: solo por bodega y línea de vino; sin otros filtros.
- (Resuelta 2026-10-10, P-3) Edición simultánea en dos dispositivos: gana el último guardado.
- (2026-10-10) Restricción declarada del cliente (sin decidir): "iniciar sesión con mi
  cuenta de gmail, y guardar los datos en un sheet" → a evaluar en Etapa 3.
- (Resuelta 2026-10-10) P-1 · Campos desplegables (respuesta detallada del cliente):

  **Selección simple:**
  - Tipo de vino: Tinto, Blanco, Rosado, Naranjo, Espumante (tradicional / Charmat /
    ancestral), Dulce o de cosecha tardía, Fortificado o generoso
  - Cosecha: años (del actual hacia atrás) + "Sin añada (NV)"
  - Ubicación de la bodega: tres niveles encadenados País → Provincia → Zona
    (ej.: Mendoza → Valle de Uco / Luján de Cuyo / Maipú)
  - Intensidad del color: Pálida, Media, Profunda (o Baja, Media, Alta según el curso)
  - Vivacidad y brillo: Apagado, Poco brillante, Brillante, Muy brillante
  - Limpidez y transparencia: Cristalino, Limpio, Velado, Turbio; para tintos:
    Transparente, Translúcido, Opaco, Cubierto
  - Evolución (color): Joven, En desarrollo, Evolucionado, Oxidado
  - Limpieza o franqueza: Franco, Con defecto leve, Defectuoso (lista de defecto:
    TCA, reducción, acidez volátil, oxidación, Brett)
  - Expresión-Intensidad: Baja, Media-, Media, Media+, Alta
  - Equilibrio: Desequilibrado, Poco equilibrado, Equilibrado, Armónico
  - Postgusto (persistencia): Corto, Medio, Largo, Muy largo
  - Impresión final: Defectuoso, Pobre, Aceptable, Bueno, Muy bueno, Sobresaliente

  **Dependientes (el valor cambia según otro campo):**
  - Tono o matiz según Tipo de vino:
    - Blanco: limón-verdoso, limón, dorado, ámbar
    - Rosado: rosa pálido, salmón, rosa, frambuesa
    - Tinto: púrpura, rubí, granate, teja
    - Espumante / Naranjo: escala de blanco o rosado + cobre y ámbar

  **Selección múltiple, dos niveles (familia → descriptor),** compartido entre
  Notas aromáticas y Aromas de boca:
  - Frutales: cítricos, carozo, tropicales, frutas rojas, frutas negras, secas o confitadas
  - Florales: rosa, violeta, azahar, etc.
  - Vegetales y herbáceos: pimiento, hierba cortada, menta, etc.
  - Especiados: pimienta, clavo, canela, etc.
  - Crianza (secundarios): vainilla, coco, tostado, ahumado, cacao, café, manteca
  - Terciarios: cuero, tabaco, tierra, hongos, miel, frutos secos
  - Minerales: tiza, piedra húmeda, etc.

  **Campos a desdoblar (fase gustativa):** hoy "Entrada o ataque en boca" y
  "Evolución o medio de boca" son cajas de texto; se separan en subcampos:
  - Dulzor: seco, semiseco, semidulce, dulce
  - Acidez: baja, media, alta
  - Taninos (cantidad): bajos, medios, altos
  - Taninos (calidad): sedosos, redondos, firmes, rugosos, astringentes
  - Alcohol: bajo, medio, alto
  - Cuerpo: ligero, medio, pleno
  - Entrada: suave, fresca, ácida, cálida, astringente, untuosa

  **Composición:** repetible, con una fila por cepa (desplegable de varietal +
  campo numérico de %) y validación de que sume 100.

## Segunda pasada de Clarificación (2026-10-11)
- RF-13 cerrada: listas de aromas aprobadas por el cliente (sin "etc."):
  - Florales: rosa, violeta, azahar, jazmín, acacia, saúco, manzanilla
  - Vegetales y herbáceos: pimiento, hierba cortada, menta, hoja de tomate, alcachofa,
    tomillo, laurel, espárrago
  - Especiados: pimienta, clavo, canela, regaliz, jengibre, nuez moscada, comino
  - Minerales: tiza, piedra húmeda, pizarra, sílex, tierra mojada, grafito, sal
- RF-12/RF-16: para distinguir espumantes se agrega el dato de color del espumante
  (Blanco/Rosado, solo cuando tipo = Espumante); el tono o matiz depende del color.
  Naranjo: escala de blanco más cobre.
- (2026-10-11, tercera pasada) El método del espumante (tradicional / Charmat /
  ancestral) es un **dato que se carga** en la ficha, no una aclaración → RF-16
  incluye color y método. La lista de tipo de vino queda "Espumante" a secas.
- (2026-10-11, cuarta pasada, aprobada) Ajustes de trazabilidad y redacción:
  CA-16 (mensaje de sin resultados, RF-10), CA-17 (disponibilidad RNF-4),
  CA-18 (sin datos personales de terceros, RNF-7); RF-3 aclara "composición con
  al menos una cepa"; el Alcance ya no dice "guardado local" (el mecanismo se
  define en el plan, no en la spec).
- (2026-10-11, quinta pasada, aprobada) Dos huecos de catálogo detectados al cruzar
  Alcance ↔ RF:
  1. Los 7 desplegables de la fase gustativa (dulzor, acidez, taninos cantidad/calidad,
     alcohol percepción, cuerpo, entrada) ahora están en RF-9 con sus valores cerrados.
  2. La varietal de la composición pasa a **texto libre** (decisión del cliente: la lista
     de varietales sería demasiado extensa); el Alcance lo aclara.
  (La "Composición" deja de tener desplegable de varietal; el % numérico y la suma 100
  se mantienen.)
- (2026-10-11, sexta pasada, aprobada) La ubicación de la bodega (país, provincia, zona)
  pasa a **tres campos de texto libre, sin listas** (decisión del cliente); sale de la
  lista de desplegables de RF-9 y queda aclarada en el Alcance.
- (2026-10-11, séptima pasada, aprobada) Búsqueda: regla de coincidencia definida en
  RF-7 (parcial, sin distinguir mayúsculas ni acentos) + CA-19 de ejemplo.
  RF-6 ampliada a "carga o edición" (igual CL-2 y CA-4).
- Decisión 2026-10-11: borrar quedó fuera de la v1 (ya registrado).
