---
name: datos-sensibles
description: Úsala siempre que escribas o revises specs, fixtures, tests, seeds, logs, capturas o ejemplos en este proyecto, para evitar datos reales de personas o información sensible de la institución y generar datos ficticios.
---

# Datos sensibles

## Regla
Ningún dato real de personas (pacientes, personal, visitantes, proveedores) ni información sensible de la institución en specs, tests, fixtures, seeds, logs, capturas ni mensajes de commit. Si el usuario pega algo que parece real, no lo copies a ningún archivo: avísale y propón un reemplazo ficticio.

## Qué categorías aplican
Las declara el proyecto en la sección Proyecto de AGENTS.md. Mientras no estén declaradas, rigen TODAS (la opción más estricta). La categoría Base rige siempre.

### Base (siempre)
- DNI: 7 u 8 dígitos, con o sin puntos (12.345.678 o 12345678).
- Nombres y apellidos de personas reales, fechas de nacimiento, teléfonos, direcciones y mails.
- Patentes de vehículos asociadas a una persona, y horarios de ingreso, egreso o presencia de personas identificables.

### Salud
- HSI Id: solo números [COMPLETAR: largo]. Buscarlo junto a etiquetas como HSI, historia o paciente.
- Nº Informe: solo números [COMPLETAR: largo]. Buscarlo junto a etiquetas como informe o Nº.
- Diagnósticos, tratamientos o estudios asociados a una persona identificable.

### Personal
- CUIL, legajo, sueldos, licencias y sanciones [COMPLETAR: formatos].
- Las licencias médicas cuentan también como Salud.

Cuando aparezca un proyecto con otro tipo de datos (por ejemplo financieros o de proveedores), el Responsable técnico agrega una categoría.

## Datos ficticios
- Nombres obviamente falsos: Persona Prueba 01, Persona Prueba 02.
- Un número generado al azar puede coincidir con un DNI real. Usar valores obviamente falsos (por ejemplo 00000001 a 00000100) y definir la convención del equipo en AGENTS.md [confirmar con el equipo].
- Patentes: usar una convención que no corresponda a vehículos reales, definida por el equipo [COMPLETAR].
- HSI Id, Nº Informe, CUIL y legajo: usar valores claramente de prueba, una vez confirmado el formato real.
- Para volumen, un generador de datos con semilla fija, así los tests son reproducibles.

## Revisión antes de cerrar una tarea
1. Busca en los archivos nuevos o modificados los patrones de arriba.
2. Si encuentras algo dudoso, detente, no lo ocultes y avísame.
3. Esta revisión no reemplaza la revisión humana.
