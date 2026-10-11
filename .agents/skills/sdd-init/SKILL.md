---
name: sdd-init
description: Úsala cuando se ejecute /init-sdd o cuando MEMORY.md indique una Etapa menor a 6. Conduce el arranque del proyecto etapa por etapa (requisitos, clarificación, entrevista técnica, búsqueda de skills y arnés completo).
---

# Arranque del proyecto

## Reglas generales
- Lee MEMORY.md primero. Ejecuta SOLO la etapa indicada en el campo Etapa y detente en cada punto de aprobación o control.
- Preguntas DE UNA EN UNA. Guarda cada respuesta en el archivo de notas de la etapa apenas la recibas, para poder retomar si se corta la sesión.
- Cada cambio de etapa requiere confirmación de una persona. Las aprobaciones se registran en MEMORY.md (fecha, etapa y quién aprobó) antes de actualizar el campo Etapa.
- NO escribas código de la aplicación en ninguna etapa de arranque.
- Nunca pidas ni aceptes datos reales de personas ni información sensible. Aplica la skill datos-sensibles.
- No instales ni descargues skills por tu cuenta.

## Etapas 0 y 1: Requisitos (sin tecnología)
Notas en docs/notas-requisitos.md. Actúa como Analista de Software senior. Pregunta desde el negocio:
- El problema y cómo se mide el éxito.
- Quién usa el sistema, quién necesita entrar y qué puede hacer cada tipo de persona.
- Qué información se maneja, de qué tipo (salud, personal, visitantes o vehículos, financiera u otra) y qué tan sensible es (sin pedir datos reales).
- Cómo se hace hoy el trabajo y qué reglas de negocio hay.
- Qué debe pasar cuando algo sale mal, en lenguaje de negocio: doble envío, datos faltantes, dos personas editando lo mismo, corte de conexión.
- Con qué otros sistemas del hospital debe convivir (qué intercambian, no cómo).
- Cuánta gente lo usa, con qué frecuencia y desde qué dispositivos.
- Qué NO se incluye en la primera versión.
PROHIBIDO preguntar por lenguajes, frameworks, bases de datos, hosting o cualquier decisión técnica. Si la persona menciona tecnología, regístrala como restricción declarada en Preguntas abiertas, sin decidir nada.
Al comenzar, pasa a Etapa 1. Cuando la persona confirme que terminó, genera specs/001-mvp/spec.md con la plantilla de la skill sdd, pasa a Etapa 2 y detente.

## Etapa 2: Clarificación
Aplica la skill spec-lint sobre la spec. Resuelve las preguntas abiertas con la persona, de una en una, y actualiza la spec. Al terminar, pide la aprobación del Solicitante, regístrala en MEMORY.md y pasa a Etapa 3.

## Etapa 3: Entrevista técnica
Notas en docs/decisiones-tecnicas.md. Lee la spec completa y deduce, confirmándolo con la persona: si hay login o identidad de usuarios, si se guardan datos, si hay datos no públicos o sensibles y de qué categorías, qué integraciones hay y qué volumen se espera.
Haz TODAS las preguntas necesarias, de una en una, hasta no tener dudas, sobre: tecnologías que el equipo ya conoce y puede mantener, lenguaje y framework, base de datos y respaldo, autenticación y roles, entornos y despliegue, pruebas y lint, accesibilidad y dispositivos, zona horaria y formatos, y límites del agente.
Verificación obligatoria: si la spec exige login, zona privada, formularios que guarden datos o datos no públicos, queda descartado un sitio estático con datos en archivos (todo lo publicado es descargable y un login hecho en el navegador no protege nada). Única excepción: autenticación en el servidor web, con aprobación explícita del Responsable técnico registrada en MEMORY.md.
Registra cada decisión de stack con su justificación y la alternativa descartada. Si descubres que un requisito es inviable o ambiguo con el stack elegido, NO lo parches en el plan: detente y propón corregir la spec con /sdd-change.
Al terminar, escribe docs/skills-necesarias.md: las áreas que necesitan una skill (seguridad, testing, base de datos y migraciones, interfaz y las que correspondan al stack) y qué debería cubrir cada una. Presenta un resumen de las decisiones de stack y pide la aprobación del Responsable técnico; no avances sin ella. Con la aprobación registrada en MEMORY.md, pasa a Etapa 4 y muestra exactamente este mensaje: PUNTO DE CONTROL: antes de continuar hay que buscar o escribir las skills de docs/skills-necesarias.md, revisarlas y copiarlas a .agents/skills/. Avísame cuando termines. Detente.

## Etapa 4: Búsqueda de skills (punto de control manual)
No hagas nada hasta que la persona diga que terminó. Entonces verifica que cada skill listada exista en .agents/skills/ y esté registrada en MEMORY.md (nombre, origen, fecha y quién la revisó). Como mínimo se exige una skill de seguridad y una de testing para el stack. Si falta alguna, no avances, salvo que la persona lo declare en la sección Sin skill de MEMORY.md. Pasa a Etapa 5.

## Etapa 5: Arnés completo
Completa SOLO la sección Proyecto de AGENTS.md (stack, categorías de datos, comandos de arranque, tests, lint y checks de cierre, roles, límites, fechas y skills) y la sección Principios del proyecto de docs/constitution.md (máximo 6, sin contradecir los base). Si el stack necesita permisos nuevos en opencode.json, propón el cambio y espera aprobación; nunca aflojes la lectura de .env ni los permisos de push. NUNCA modifiques las reglas fijas de AGENTS.md ni los principios base. Pide la aprobación del Responsable técnico, regístrala y pasa a Etapa 6.

## Etapa 6: Listo
Indica que el siguiente paso es /sdd-plan 001-mvp y que las specs nuevas se inician con /sdd-new.
