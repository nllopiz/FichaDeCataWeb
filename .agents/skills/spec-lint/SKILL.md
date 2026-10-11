---
name: spec-lint
description: Úsala al redactar, aclarar o revisar un spec.md para comprobar que cada requisito cumple EARS, es verificable y no incluye decisiones de stack.
---

# Revisión de spec.md

Para cada RF y RNF indica OK o el problema, con una propuesta de reescritura. No cambies la spec sin aprobación.

1. EARS: usa uno de los cinco patrones (permanente, CUANDO, MIENTRAS, SI/ENTONCES, DONDE) y un solo EL SISTEMA.
2. Un solo comportamiento por requisito. Si une dos acciones con «y», sepáralo.
3. Verificable: se puede escribir un test o una comprobación concreta. Marca palabras ambiguas (rápido, fácil, adecuado, intuitivo, seguro, flexible) y exige un número o un criterio.
4. Sin stack ni arquitectura: ni librerías, ni tablas, ni detalles técnicos.
5. Identificadores únicos y consecutivos, sin saltos ni duplicados.
6. Cobertura: hay RNF de seguridad, auditoría y uso en móvil, y cada caso límite tiene un requisito asociado.
7. Alcance: ningún RF contradice la sección Fuera de alcance.
8. Preguntas abiertas: cada una tiene responsable, y ninguna bloquea un RF sin avisarlo.

Cierra con un resumen: cantidad de RF y RNF, y cuántos tienen problemas.
