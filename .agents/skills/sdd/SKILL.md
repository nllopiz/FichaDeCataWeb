---
name: sdd
description: Úsala siempre que trabajes con Spec-Driven Development en este proyecto (docs/constitution.md o archivos en specs/), para redactar, revisar o cambiar specs, planes y tareas, o implementar y validar tareas.
---

# Spec-Driven Development (SDD)

## Flujo
Arranque del proyecto (skill sdd-init) y, por cada spec: Clarificación → Plan → Tareas → Implementación → Validación → Cambio.

- Nunca pases a la siguiente fase sin aprobación explícita del usuario.
- La spec manda: si algo no está en la spec, no se implementa. Si falta una decisión, para y pregunta.
- Un cambio se hace primero en la spec, luego en plan y tareas, y al final en el código.
- Cada spec vive en specs/NNN-nombre/ con spec.md, plan.md y tasks.md.
- Al terminar cada fase, actualiza MEMORY.md (qué se hizo, quién aprobó, fecha).
- Nunca uses datos reales de personas ni información sensible (aplica la skill datos-sensibles).
- El stack y los comandos de test, lint y checks están en la sección Proyecto de AGENTS.md. No supongas otros.

## spec.md
Secciones: 1 Contexto y problema · 2 Usuarios y roles · 3 Alcance · 4 Fuera de alcance · 5 Requisitos funcionales (RF) · 6 Requisitos no funcionales (RNF) · 7 Casos límite · 8 Criterios de aceptación · 9 Preguntas abiertas.
Solo el QUÉ y el POR QUÉ, sin stack ni arquitectura. Cada RF y RNF debe ser verificable.

Notación EARS:
- RF-x: EL SISTEMA <comportamiento permanente>.
- RF-x: CUANDO <evento>, EL SISTEMA <respuesta>.
- RF-x: MIENTRAS <estado>, EL SISTEMA <respuesta>.
- RF-x: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.
- RF-x: DONDE <función opcional incluida>, EL SISTEMA <respuesta>.

RNF a considerar siempre: seguridad y permisos, auditoría, rendimiento, disponibilidad, accesibilidad, uso en móvil.

## plan.md
1 Componentes y archivos con su responsabilidad · 2 Modelo de datos y cambios de esquema (si hay datos persistentes) · 3 Lógica de negocio en funciones puras, testeables sin infraestructura · 4 Algoritmo principal en pseudocódigo · 5 Interfaz y flujos · 6 Seguridad, permisos y auditoría · 7 Decisiones con su alternativa descartada (partiendo de docs/decisiones-tecnicas.md) · 8 Estrategia de tests · 9 Trazabilidad RF/RNF → componente.
Preferir lo que ya trae el stack antes que código propio. Si un punto no aplica, dilo en lugar de omitirlo.

## tasks.md
- [ ] **Tn. Descripción.** RF-x, RF-y
  - Hecho cuando: comprobación verificable.

Tareas de 20-30 minutos, en orden de dependencia. Todo RF y RNF debe estar cubierto por al menos una tarea. Cerrar con una tabla de trazabilidad RF/RNF → tareas.

## Implementación TDD
Una tarea por vez: tests primero (rojo), código después (verde), ejecutar los comandos de test, lint y checks de AGENTS.md, marcar la tarea, hacer commit con el mensaje Tn: descripción, y parar.
