// Orquestación del guardado (RF-2, RF-5, RF-8, RF-17 a RF-19, RNF-2).
// Flujo: validar → identificar si hace falta → registrar (append o batchUpdate por
// id) → borrar borrador solo en éxito. El doble toque se bloquea con un flag
// síncrono: el segundo toque no hace nada (CA-3). Dependencias inyectadas para
// poder probarlo sin Google (skill datos-sensibles: dobles siempre).

import { generarId, serializarFila } from "./serializacion.js";
import { validarFicha } from "./validaciones.js";
import { borrarBorrador, CLAVE_NUEVA } from "./borrador.js";

const MILISEGUNDOS_DOBLE_TOQUE = 2000;

export function esDobleToque(t1, t2) {
  return Math.abs(t2 - t1) < MILISEGUNDOS_DOBLE_TOQUE;
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function fechaHoraBuenosAires(fecha = new Date()) {
  const partes = Object.fromEntries(
    FORMATO_FECHA.formatToParts(fecha).map(({ type, value }) => [type, value]),
  );
  return `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`;
}

let enProgreso = false;

export function guardadoEnProgreso() {
  return enProgreso;
}

export async function guardarFicha({
  datos,
  idExistente = null,
  fechaCreacionPrevia = null,
  obtenerCorreo,
  obtenerToken,
  descartarToken,
  append,
  batchUpdate,
  generar = generarId,
  ahora = () => new Date(),
}) {
  if (enProgreso) {
    // RF-5: el segundo toque dentro de la ventana no registra otra ficha.
    return { estado: "duplicado" };
  }
  enProgreso = true;
  try {
    const validacion = validarFicha(datos);
    if (!validacion.valido) {
      return {
        estado: "invalida",
        faltantes: validacion.faltantes,
        motivo: validacion.motivo,
      };
    }

    // RF-18: identificar solo al guardar; RF-19: cancelar no registra nada.
    // T19: además hace falta el correo de la cuenta elegida (columna `autor`);
    // sin él, mismo criterio que "sin identificar": no se registra y se avisa.
    if (!(await obtenerToken())) {
      return { estado: "cancelado" };
    }
    const autor = obtenerCorreo();
    if (!autor) {
      return { estado: "sin-correo" };
    }

    const momento = fechaHoraBuenosAires(ahora());
    const ficha = {
      ...datos,
      id: idExistente ?? generar(),
      autor,
      fecha_creacion: fechaCreacionPrevia ?? momento,
      fecha_modificacion: momento,
    };
    const celdas = serializarFila(ficha);

    const registrar = async () => {
      if (idExistente !== null) {
        // RF-8: editar no duplica; se corrige la fila por id (grill-me p. 2).
        await batchUpdate(idExistente, celdas);
      } else {
        await append(celdas);
      }
    };

    try {
      await registrar();
    } catch (error) {
      if (error?.codigo !== "no-autenticado") {
        throw error;
      }
      // Skill sheets-api-navegador §6: token vencido → descartar, re-identificar
      // y reintentar una sola vez; nunca en loop.
      descartarToken();
      if (!(await obtenerToken())) {
        return { estado: "cancelado" };
      }
      if (!obtenerCorreo()) {
        // T19: la re-identificación también debe dar la cuenta elegida.
        return { estado: "sin-correo" };
      }
      await registrar();
    }

    borrarBorrador(idExistente !== null ? String(idExistente) : CLAVE_NUEVA);
    return { estado: "ok", ficha };
  } catch (error) {
    // Skill sheets-api-navegador §6: nunca perder datos; el borrador ya está a salvo.
    return {
      estado: "error",
      codigo: error?.codigo ?? "desconocido",
      motivo: error?.message ?? "Error inesperado.",
    };
  } finally {
    enProgreso = false;
  }
}
