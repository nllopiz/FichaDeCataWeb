// Errores de validación junto al campo (RF-11, RNF-5, CA-2, CA-11).
// El resumen exacto sigue en #estado-guardado (lo arma validaciones.js/guardado.js);
// acá se marca cada campo, se asocia su mensaje con aria-describedby y se resuelve
// el foco del primer control inválido.

const CAMPOS = [
  "bodega",
  "tipo",
  "linea",
  "composicion",
  "cosecha",
  "graduacion",
];

const MENSAJES = {
  bodega: "Completá la bodega.",
  tipo: "Elegí el tipo de vino.",
  linea: "Completá el nombre de la línea de vino.",
  composicion: "Agregá al menos una cepa.",
  cosecha: "Elegí la cosecha.",
  graduacion: "Completá la graduación alcohólica.",
};

// El primer foco se recuerda al marcar: la composición necesita distinguir si
// falta una cepa (botón) o si la suma no da 100 (primer porcentaje).
const primerosFocos = new WeakMap();

function tokensDescritos(control) {
  return (control.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean);
}

function agregarDescrito(control, id) {
  const tokens = tokensDescritos(control);
  if (!tokens.includes(id)) {
    control.setAttribute("aria-describedby", [...tokens, id].join(" "));
  }
}

function quitarDescrito(control, id) {
  const tokens = tokensDescritos(control).filter((token) => token !== id);
  if (tokens.length === 0) {
    control.removeAttribute("aria-describedby");
  } else {
    control.setAttribute("aria-describedby", tokens.join(" "));
  }
}

function contenedorDelError(control) {
  return control.closest(".field") ?? control.parentElement ?? control;
}

function insertarError(control, clave, mensaje) {
  const error = document.createElement("p");
  error.id = `error-${clave}`;
  error.className = "field-error";
  error.textContent = mensaje;

  if (clave === "composicion") {
    control.insertAdjacentElement("afterend", error);
  } else {
    contenedorDelError(control).append(error);
  }
}

function mensajeDe(clave, { faltantes, sumaComposicion }) {
  if (clave !== "composicion") {
    return MENSAJES[clave];
  }
  if (faltantes.includes("composicion")) {
    return MENSAJES.composicion;
  }
  return `La suma de la composición debe ser 100; la suma actual es ${sumaComposicion}.`;
}

function focoDe(clave, control, faltantes) {
  if (clave !== "composicion") {
    return control;
  }
  if (faltantes.includes("composicion")) {
    return control.closest(".composition")?.querySelector("#agregar-cepa");
  }
  return control.closest(".composition")?.querySelector(".porcentaje");
}

export function marcarErrores(form, resultado = {}) {
  const faltantes = resultado.faltantes ?? [];
  const sumaComposicion = resultado.sumaComposicion ?? 0;
  const claves = new Set(faltantes);

  if (faltantes.length === 0 && sumaComposicion !== 100) {
    claves.add("composicion");
  }

  limpiarErrores(form);

  const focos = new Map();
  for (const clave of CAMPOS) {
    if (!claves.has(clave)) {
      continue;
    }
    const control = form.querySelector(`#${clave}`);
    if (!control) {
      continue;
    }
    control.setAttribute("aria-invalid", "true");
    agregarDescrito(control, `error-${clave}`);
    insertarError(control, clave, mensajeDe(clave, resultado));
    focos.set(control, focoDe(clave, control, faltantes));
  }

  // El orden del formulario decide el primer error, no el orden de la lista.
  const primero = [...form.querySelectorAll("[aria-invalid='true']")].find(
    (control) => focos.has(control),
  );
  const foco = primero ? focos.get(primero) : null;
  primerosFocos.set(form, foco);
  return foco;
}

export function limpiarErrores(form) {
  for (const error of form.querySelectorAll(".field-error")) {
    error.remove();
  }
  for (const control of form.querySelectorAll("[aria-invalid]")) {
    control.removeAttribute("aria-invalid");
  }
  for (const control of form.querySelectorAll("[aria-describedby]")) {
    const tokens = tokensDescritos(control);
    for (const token of tokens.filter((valor) => valor.startsWith("error-"))) {
      quitarDescrito(control, token);
    }
  }
  primerosFocos.delete(form);
}

function claveDeControl(control) {
  if (!control) {
    return null;
  }
  if (
    control.id === "agregar-cepa" ||
    control.id === "composicion" ||
    control.closest?.(".fila-cepa") ||
    control.closest?.("#composicion")
  ) {
    return "composicion";
  }
  return CAMPOS.includes(control.id) ? control.id : null;
}

export function limpiarErrorDeCampo(form, control) {
  const clave = claveDeControl(control);
  if (!clave) {
    return;
  }
  const marcado = form.querySelector(`#${clave}`);
  const error = form.querySelector(`#error-${clave}`);
  if (!error && !marcado?.hasAttribute("aria-invalid")) {
    return;
  }
  error?.remove();
  if (marcado) {
    marcado.removeAttribute("aria-invalid");
    quitarDescrito(marcado, `error-${clave}`);
  }
}

export function enfocarPrimerError(form) {
  const foco = primerosFocos.get(form);
  if (foco && typeof foco.focus === "function") {
    foco.focus();
    return foco;
  }
  return null;
}
