import { CONFIG } from "./config.js";
import { montarFormulario } from "./formulario.js";

// Arnés inicial (T1): el cableado completo de vistas llega en T10-T12.
void CONFIG;

const form = document.querySelector("#form-ficha");
if (form) {
  montarFormulario(form);
}
