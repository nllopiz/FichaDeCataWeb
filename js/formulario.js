// Formulario completo de la ficha (RF-1, RF-9, RF-12, RF-13, RF-14, RF-16).
// El HTML define secciones y labels accesibles; acá viven los datos de los catálogos
// (una sola fuente: js/catalogos.js), las dependencias (tono, espumante, defecto),
// las filas de cepas y la lectura del formulario hacia la ficha.

import {
  TIPOS_VINO,
  cosechas,
  INTENSIDAD_COLOR,
  VIVACIDAD_BRILLO,
  EVOLUCION_COLOR,
  LIMPIEZA_FRANQUEZA,
  DEFECTOS,
  EXPRESION_INTENSIDAD,
  EQUILIBRIO,
  DULZOR,
  ACIDEZ,
  TANINOS_CANTIDAD,
  TANINOS_CALIDAD,
  ALCOHOL_PERCEPCION,
  CUERPO,
  ENTRADA,
  POSTGUSTO,
  IMPRESION_FINAL,
  COLOR_ESPUMANTE,
  METODO_ESPUMANTE,
  tonoPermitido,
  limpiezaTransparencia,
  catalogoDescriptores,
} from "./catalogos.js";
import { sumarComposicion } from "./validaciones.js";

const SELECTS = [
  ["tipo", () => TIPOS_VINO],
  ["cosecha", () => cosechas(new Date().getFullYear())],
  ["color_espumante", () => COLOR_ESPUMANTE],
  ["metodo_espumante", () => METODO_ESPUMANTE],
  ["intensidad_color", () => INTENSIDAD_COLOR],
  ["vivacidad_brillo", () => VIVACIDAD_BRILLO],
  ["evolucion_color", () => EVOLUCION_COLOR],
  ["limpieza_franqueza", () => LIMPIEZA_FRANQUEZA],
  ["defecto", () => DEFECTOS],
  ["expresion_intensidad", () => EXPRESION_INTENSIDAD],
  ["equilibrio", () => EQUILIBRIO],
  ["dulzor", () => DULZOR],
  ["acidez", () => ACIDEZ],
  ["taninos_cantidad", () => TANINOS_CANTIDAD],
  ["taninos_calidad", () => TANINOS_CALIDAD],
  ["alcohol_percepcion", () => ALCOHOL_PERCEPCION],
  ["cuerpo", () => CUERPO],
  ["entrada", () => ENTRADA],
  ["impresion_final", () => IMPRESION_FINAL],
  ["postgusto", () => POSTGUSTO],
];

// Campos del formulario que mapean 1:1 con columnas de la hoja.
export const CAMPOS_FICHA = [
  "bodega",
  "pais",
  "provincia",
  "zona",
  "tipo",
  "linea",
  "cosecha",
  "graduacion",
  "tono_matiz",
  "intensidad_color",
  "vivacidad_brillo",
  "limpieza_transparencia",
  "evolucion_color",
  "limpieza_franqueza",
  "defecto",
  "expresion_intensidad",
  "equilibrio",
  "dulzor",
  "acidez",
  "taninos_cantidad",
  "taninos_calidad",
  "alcohol_percepcion",
  "cuerpo",
  "entrada",
  "evolucion_boca",
  "impresion_final",
  "postgusto",
  "apreciacion",
];

function poblar(select, valores) {
  const anterior = select.value;
  select.innerHTML = "";
  select.append(new Option("", ""));
  for (const valor of valores) {
    select.append(new Option(valor, String(valor)));
  }
  const siguePresente = [...select.options].some(
    (opcion) => opcion.value === anterior,
  );
  select.value = siguePresente ? anterior : "";
}

function construirDescriptores(contenedor, nombre) {
  const grupos = document.createElement("div");
  grupos.className = "chip-groups";
  contenedor.append(grupos);

  catalogoDescriptores().forEach(({ familia, descriptores }, fi) => {
    const grupo = document.createElement("fieldset");
    grupo.className = "familia-descriptores chip-group";
    const leyenda = document.createElement("legend");
    leyenda.textContent = familia;
    grupo.append(leyenda);

    const chips = document.createElement("div");
    chips.className = "chips";
    grupo.append(chips);

    descriptores.forEach((descriptor, di) => {
      const id = `${nombre}-${fi}-${di}`;
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input";
      checkbox.id = id;
      checkbox.name = nombre;
      checkbox.value = descriptor;
      const label = document.createElement("label");
      label.className = "form-check-label";
      label.htmlFor = id;
      label.textContent = descriptor;
      const envoltorio = document.createElement("div");
      envoltorio.className = "form-check chip";
      envoltorio.append(checkbox, label);
      chips.append(envoltorio);
    });

    grupos.append(grupo);
  });
}

export function agregarFilaCepa(form, datos = {}) {
  const fila = document.createElement("div");
  fila.className = "fila-cepa";
  fila.innerHTML = `
    <label class="form-label">Varietal
      <input class="varietal form-control" type="text" />
    </label>
    <label class="form-label">Porcentaje
      <input class="porcentaje form-control" type="number" min="0" max="100" />
    </label>
    <button type="button" class="btn btn-outline-danger quitar-cepa">Quitar cepa</button>
  `;
  fila.querySelector(".varietal").value = datos.varietal ?? "";
  fila.querySelector(".porcentaje").value = datos.porcentaje ?? "";
  form.querySelector("#composicion").append(fila);
  actualizarSuma(form);
}

function quitarFilaCepa(form, fila) {
  const filas = form.querySelectorAll(".fila-cepa");
  if (filas.length > 1) {
    fila.remove();
    actualizarSuma(form);
  }
}

function actualizarSuma(form) {
  const caja = form.querySelector("#suma-composicion");
  if (!caja) {
    return;
  }
  const composicion = leerFicha(form).composicion;
  const suma = sumarComposicion(composicion);
  caja.textContent = suma === 100 ? "100 % completa" : `Suma: ${suma} %`;
  caja.classList.toggle("incompleta", suma !== 100);

  // La barra es un resumen visual de la composición; el texto del total y el
  // aria-label siguen siendo la fuente accesible (RNF-5).
  const barra = form.querySelector("#blend");
  if (!barra) {
    return;
  }
  barra.textContent = "";
  for (const cepa of composicion) {
    const porcentaje = Number(cepa.porcentaje);
    if (!Number.isFinite(porcentaje) || porcentaje <= 0) {
      continue;
    }
    const tramo = document.createElement("span");
    tramo.style.width = `${Math.min(porcentaje, 100)}%`;
    barra.append(tramo);
  }
  barra.hidden = composicion.length === 0;
  barra.setAttribute(
    "aria-label",
    composicion.length === 0
      ? "Composición vacía"
      : `Composición: ${composicion
          .map(
            (cepa) =>
              `${cepa.varietal || "Cepa"} ${cepa.porcentaje || 0} por ciento`,
          )
          .join(", ")}`,
  );
}

function actualizarTono(form) {
  const tipo = form.querySelector("#tipo").value;
  const color = form.querySelector("#color_espumante").value;
  const tonos = tonoPermitido(tipo, color);
  const select = form.querySelector("#tono_matiz");
  poblar(select, tonos);
  select.disabled = tonos.length === 0;
}

function actualizarLimpieza(form) {
  const tipo = form.querySelector("#tipo").value;
  poblar(
    form.querySelector("#limpieza_transparencia"),
    limpiezaTransparencia(tipo),
  );
}

function actualizarEspumante(form) {
  const esEspumante = form.querySelector("#tipo").value === "Espumante";
  form.querySelector("#bloque-espumante").hidden = !esEspumante;
  if (!esEspumante) {
    form.querySelector("#color_espumante").value = "";
    form.querySelector("#metodo_espumante").value = "";
  }
}

function actualizarDefecto(form) {
  const conDefecto =
    form.querySelector("#limpieza_franqueza").value === "Defectuoso";
  form.querySelector("#bloque-defecto").hidden = !conDefecto;
  if (!conDefecto) {
    form.querySelector("#defecto").value = "";
  }
}

function actualizarDependencias(form) {
  actualizarEspumante(form);
  actualizarLimpieza(form);
  actualizarTono(form);
  actualizarDefecto(form);
}

function cablear(form) {
  form
    .querySelector("#tipo")
    .addEventListener("change", () => actualizarDependencias(form));
  form
    .querySelector("#color_espumante")
    .addEventListener("change", () => actualizarTono(form));
  form
    .querySelector("#limpieza_franqueza")
    .addEventListener("change", () => actualizarDefecto(form));
  form
    .querySelector("#agregar-cepa")
    .addEventListener("click", () => agregarFilaCepa(form));
  form.addEventListener("click", (evento) => {
    if (evento.target.matches(".quitar-cepa")) {
      quitarFilaCepa(form, evento.target.closest(".fila-cepa"));
    }
  });
  form.addEventListener("input", () => actualizarSuma(form));
}

export function montarFormulario(form) {
  for (const [id, opciones] of SELECTS) {
    poblar(form.querySelector(`#${id}`), opciones());
  }
  construirDescriptores(
    form.querySelector("#notas-aromaticas"),
    "notas_aromaticas",
  );
  construirDescriptores(form.querySelector("#aromas-boca"), "aromas_boca");
  agregarFilaCepa(form);
  cablear(form);
  actualizarDependencias(form);
}

export function leerFicha(form) {
  const ficha = {};
  for (const campo of CAMPOS_FICHA) {
    const elemento = form.querySelector(`#${campo}`);
    ficha[campo] = elemento ? elemento.value.trim() : "";
  }
  ficha.composicion = [...form.querySelectorAll(".fila-cepa")]
    .map((fila) => ({
      varietal: fila.querySelector(".varietal").value.trim(),
      porcentaje: fila.querySelector(".porcentaje").value,
    }))
    .filter(({ varietal, porcentaje }) => varietal !== "" || porcentaje !== "");
  ficha.notas_aromaticas = [
    ...form.querySelectorAll('input[name="notas_aromaticas"]:checked'),
  ].map((casilla) => casilla.value);
  ficha.aromas_boca = [
    ...form.querySelectorAll('input[name="aromas_boca"]:checked'),
  ].map((casilla) => casilla.value);
  return ficha;
}

// RF-8: abrir una ficha existente para editar (y resetear con "Nueva ficha").
export function cargarFicha(form, ficha) {
  for (const campo of CAMPOS_FICHA) {
    const elemento = form.querySelector(`#${campo}`);
    if (elemento) {
      elemento.value = ficha[campo] ?? "";
    }
  }
  for (const fila of form.querySelectorAll(".fila-cepa")) {
    fila.remove();
  }
  const cepas = ficha.composicion?.length ? ficha.composicion : [{}];
  for (const cepa of cepas) {
    agregarFilaCepa(form, cepa);
  }
  for (const casilla of form.querySelectorAll(
    'input[name="notas_aromaticas"]',
  )) {
    casilla.checked = (ficha.notas_aromaticas ?? []).includes(casilla.value);
  }
  for (const casilla of form.querySelectorAll('input[name="aromas_boca"]')) {
    casilla.checked = (ficha.aromas_boca ?? []).includes(casilla.value);
  }
  actualizarDependencias(form);
  actualizarSuma(form);
}
