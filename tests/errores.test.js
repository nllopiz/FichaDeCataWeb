// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  marcarErrores,
  limpiarErrores,
  limpiarErrorDeCampo,
  enfocarPrimerError,
} from "../js/errores.js";

function formularioDePrueba({ conCepa = false } = {}) {
  document.body.innerHTML = `
    <form id="form-ficha">
      <p id="nota-obligatorios">Los puntos marcan los datos obligatorios.</p>
      <div class="field">
        <label for="bodega">Bodega</label>
        <input id="bodega" name="bodega" />
      </div>
      <div class="field">
        <label for="linea">Nombre de la línea de vino</label>
        <input id="linea" name="linea" />
      </div>
      <div class="field">
        <label for="tipo">Tipo de vino</label>
        <select id="tipo" name="tipo"></select>
      </div>
      <div class="field">
        <label for="cosecha">Cosecha</label>
        <select id="cosecha" name="cosecha"></select>
      </div>
      <div class="field">
        <label for="graduacion">Graduación alcohólica</label>
        <div class="input-wrap">
          <input id="graduacion" name="graduacion" />
        </div>
      </div>
      <div class="composition">
        <fieldset id="composicion" aria-describedby="nota-obligatorios">
          <legend>Composición</legend>
          ${
            conCepa
              ? `<div class="fila-cepa">
                   <input class="varietal" />
                   <input class="porcentaje" type="number" />
                 </div>`
              : ""
          }
        </fieldset>
        <button type="button" id="agregar-cepa">+ Agregar cepa</button>
      </div>
    </form>
  `;
  return document.querySelector("#form-ficha");
}

const todosFaltantes = {
  faltantes: [
    "bodega",
    "tipo",
    "linea",
    "composicion",
    "cosecha",
    "graduacion",
  ],
  sumaComposicion: 0,
};

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("marcarErrores (RF-11, CA-2)", () => {
  it("marca cada campo faltante junto al control y devuelve el primero", () => {
    const form = formularioDePrueba();

    const primero = marcarErrores(form, todosFaltantes);

    expect(primero).toBe(form.querySelector("#bodega"));
    expect(form.querySelectorAll(".field-error")).toHaveLength(6);
    for (const id of todosFaltantes.faltantes) {
      expect(form.querySelector(`#${id}`).getAttribute("aria-invalid")).toBe(
        "true",
      );
      expect(form.querySelector(`#error-${id}`)).not.toBeNull();
    }
    expect(form.querySelector("#error-bodega").textContent).toContain("bodega");
    expect(form.querySelector("#error-composicion").textContent).toContain(
      "cepa",
    );
  });

  it("conserva los aria-describedby previos de la composición", () => {
    const form = formularioDePrueba();

    marcarErrores(form, todosFaltantes);

    const descritos = form
      .querySelector("#composicion")
      .getAttribute("aria-describedby")
      .split(" ");
    expect(descritos).toContain("nota-obligatorios");
    expect(descritos).toContain("error-composicion");
  });

  it("marca la composición cuando la suma no es 100", () => {
    const form = formularioDePrueba({ conCepa: true });

    marcarErrores(form, { faltantes: [], sumaComposicion: 95 });

    expect(
      form.querySelector("#composicion").getAttribute("aria-invalid"),
    ).toBe("true");
    expect(form.querySelector("#error-composicion").textContent).toContain(
      "95",
    );
    expect(form.querySelectorAll(".field-error")).toHaveLength(1);
  });
});

describe("limpiarErrores y limpiarErrorDeCampo", () => {
  it("limpia todos los errores y restaura los aria-describedby", () => {
    const form = formularioDePrueba();
    marcarErrores(form, todosFaltantes);

    limpiarErrores(form);

    expect(form.querySelectorAll(".field-error")).toHaveLength(0);
    expect(form.querySelector("[aria-invalid='true']")).toBeNull();
    expect(
      form.querySelector("#composicion").getAttribute("aria-describedby"),
    ).toBe("nota-obligatorios");
  });

  it("limpia solo el error del campo corregido", () => {
    const form = formularioDePrueba();
    marcarErrores(form, todosFaltantes);

    limpiarErrorDeCampo(form, form.querySelector("#bodega"));

    expect(form.querySelector("#error-bodega")).toBeNull();
    expect(form.querySelector("#bodega").hasAttribute("aria-invalid")).toBe(
      false,
    );
    expect(form.querySelector("#error-linea")).not.toBeNull();
    expect(form.querySelector("#linea").getAttribute("aria-invalid")).toBe(
      "true",
    );
  });

  it("al corregir una cepa se limpia el error de composición", () => {
    const form = formularioDePrueba({ conCepa: true });
    marcarErrores(form, { faltantes: [], sumaComposicion: 95 });

    limpiarErrorDeCampo(form, form.querySelector(".porcentaje"));

    expect(form.querySelector("#error-composicion")).toBeNull();
    expect(
      form.querySelector("#composicion").hasAttribute("aria-invalid"),
    ).toBe(false);
  });
});

describe("enfocarPrimerError (RNF-5, CA-11)", () => {
  it("enfoca el primer campo inválido en orden del formulario", () => {
    const form = formularioDePrueba();
    marcarErrores(form, todosFaltantes);

    const enfocado = enfocarPrimerError(form);

    expect(enfocado).toBe(form.querySelector("#bodega"));
    expect(document.activeElement).toBe(form.querySelector("#bodega"));
  });

  it("si falta la composición enfoca el botón para agregar una cepa", () => {
    const form = formularioDePrueba();
    marcarErrores(form, { faltantes: ["composicion"], sumaComposicion: 0 });

    const enfocado = enfocarPrimerError(form);

    expect(enfocado).toBe(form.querySelector("#agregar-cepa"));
    expect(document.activeElement).toBe(form.querySelector("#agregar-cepa"));
  });

  it("si la suma es distinta de 100 enfoca el primer porcentaje", () => {
    const form = formularioDePrueba({ conCepa: true });
    marcarErrores(form, { faltantes: [], sumaComposicion: 95 });

    const enfocado = enfocarPrimerError(form);

    expect(enfocado).toBe(form.querySelector(".porcentaje"));
    expect(document.activeElement).toBe(form.querySelector(".porcentaje"));
  });
});
