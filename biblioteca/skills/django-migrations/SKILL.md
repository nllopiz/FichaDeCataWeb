---
name: django-migrations
description: Úsala cuando una tarea cree o modifique modelos de Django o migraciones en este proyecto (MariaDB).
---

# Migraciones Django en MariaDB

- Un cambio de modelo, una migración. Genérala con makemigrations y revísala antes de aplicarla.
- Nunca edites ni borres una migración ya aplicada fuera de tu entorno local. Si hay que corregirla, crea una nueva.
- Revisa el SQL con python manage.py sqlmigrate <app> <número> antes de aplicar.
- Las migraciones deben ser reversibles. Si no lo son, justifícalo en plan.md.
- Separa las migraciones de esquema de las de datos (RunPython), y haz las de datos idempotentes.
- Agregar una columna obligatoria a una tabla con datos exige un valor por defecto o dos pasos: agregarla nullable, rellenarla y volverla obligatoria.
- Nunca apliques migraciones contra la base de producción desde el agente. Las aplica una persona, con aprobación del Responsable técnico y después de un respaldo.
- Antes de cerrar la tarea: python manage.py makemigrations --check sin cambios pendientes y la suite de tests en verde.
