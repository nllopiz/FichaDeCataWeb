import { CONFIG } from "./config.js";
import { montarFormulario, leerFicha } from "./formulario.js";
import { guardarFicha } from "./guardado.js";
import { configurarAuth, obtenerToken, descartarToken } from "./auth.js";
import * as sheets from "./sheets.js";

const form = document.querySelector("#form-ficha");

if (form) {
  montarFormulario(form);
  sheets.configurarSheets({ spreadsheetId: CONFIG.idPlanilla, obtenerToken });

  const boton = document.querySelector("#guardar");
  const estado = document.querySelector("#estado-guardado");

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    // RF-5: además del flag interno, el botón queda inerte durante el guardado.
    boton.disabled = true;
    estado.textContent = "";
    try {
      try {
        // RF-18: el token se pide solo al guardar, nunca al cargar (RF-17).
        configurarAuth({ clientId: CONFIG.clientIdGoogle });
      } catch {
        // GIS puede no haber cargado todavía: obtenerToken avisa con mensaje claro.
      }
      const resultado = await guardarFicha({
        datos: leerFicha(form),
        autor: CONFIG.correoDueno,
        obtenerToken,
        descartarToken,
        append: sheets.append,
        batchUpdate: sheets.batchUpdate,
      });
      estado.textContent = mensajeDe(resultado);
    } finally {
      boton.disabled = false;
    }
  });
}

function mensajeDe({ estado, motivo }) {
  if (estado === "ok") {
    return "Ficha guardada.";
  }
  if (estado === "invalida") {
    return motivo;
  }
  if (estado === "cancelado") {
    // RF-19: no se registra nada y lo escrito sigue en el formulario.
    return "Identificación cancelada: no se registró ninguna ficha. Podés intentar de nuevo.";
  }
  if (estado === "duplicado") {
    return "";
  }
  return motivo ?? "No se pudo guardar la ficha.";
}
