---
name: systematic-debugging
description: Úsala cuando un test falle o haya un error, antes de modificar código de producción.
---

1. Reproduce el fallo con un test mínimo y aislado.
2. Lee el error completo y formula una hipótesis explícita.
3. Verifica la hipótesis (log, test o inspección) sin cambiar código de producción.
4. Corrige solo la causa raíz confirmada, con el mínimo cambio.
5. Corre toda la suite para descartar regresiones.
Si después de 3 intentos no hay causa raíz confirmada, detente y consulta al usuario. Nunca apliques arreglos a ciegas.
