// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { leerFicha } from "../js/formulario.js";

// Formulario mínimo con los nodos que leeFicha consume (por id y por clase).
function formDePrueba() {
  const form = document.createElement("form");
  form.innerHTML = `
    <input id="bodega" value="Bodega Ejemplo" />
    <input id="pais" value="Argentina" />
    <input id="provincia" value="Mendoza" />
    <input id="zona" value="Valle de Uco" />
    <select id="tipo"><option value="Tinto" selected>Tinto</option></select>
    <input id="linea" value="Línea Prueba Malbec" />
    <select id="cosecha"><option value="2022" selected>2022</option></select>
    <input id="graduacion" value="13.5" />
    <select id="tono_matiz"><option value="granate" selected>granate</option></select>
    <input id="evolucion_boca" value="media boca larga" />
    <textarea id="apreciacion">Muy buena para el precio.</textarea>
    <div id="composicion">
      <div class="fila-cepa">
        <input class="varietal" value="Malbec" />
        <input class="porcentaje" value="80" />
      </div>
      <div class="fila-cepa">
        <input class="varietal" value="Cabernet Franc" />
        <input class="porcentaje" value="20" />
      </div>
      <div class="fila-cepa">
        <input class="varietal" value="" />
        <input class="porcentaje" value="" />
      </div>
    </div>
    <fieldset id="notas-aromaticas">
      <input type="checkbox" name="notas_aromaticas" value="frutas rojas" checked />
      <input type="checkbox" name="notas_aromaticas" value="violeta" checked />
      <input type="checkbox" name="notas_aromaticas" value="pimienta" />
    </fieldset>
    <fieldset id="aromas-boca">
      <input type="checkbox" name="aromas_boca" value="cuero" checked />
    </fieldset>
  `;
  document.body.append(form);
  return form;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("leerFicha: del formulario a la ficha", () => {
  it("lee textos, selects y textarea con sus valores", () => {
    const ficha = leerFicha(formDePrueba());

    expect(ficha.bodega).toBe("Bodega Ejemplo");
    expect(ficha.pais).toBe("Argentina");
    expect(ficha.provincia).toBe("Mendoza");
    expect(ficha.zona).toBe("Valle de Uco");
    expect(ficha.tipo).toBe("Tinto");
    expect(ficha.linea).toBe("Línea Prueba Malbec");
    expect(ficha.cosecha).toBe("2022");
    expect(ficha.graduacion).toBe("13.5");
    expect(ficha.tono_matiz).toBe("granate");
    expect(ficha.evolucion_boca).toBe("media boca larga");
    expect(ficha.apreciacion).toBe("Muy buena para el precio.");
  });

  it("arma la composición como lista de cepas y omite las filas vacías", () => {
    const ficha = leerFicha(formDePrueba());

    expect(ficha.composicion).toEqual([
      { varietal: "Malbec", porcentaje: "80" },
      { varietal: "Cabernet Franc", porcentaje: "20" },
    ]);
  });

  it("arma notas y aromas de boca con los descriptores marcados", () => {
    const ficha = leerFicha(formDePrueba());

    expect(ficha.notas_aromaticas).toEqual(["frutas rojas", "violeta"]);
    expect(ficha.aromas_boca).toEqual(["cuero"]);
  });

  it("no inventa datos de sesión ni auditoría (esos los pone guardado.js)", () => {
    const ficha = leerFicha(formDePrueba());

    expect(ficha.id).toBeUndefined();
    expect(ficha.autor).toBeUndefined();
    expect(ficha.fecha_creacion).toBeUndefined();
    expect(ficha.token).toBeUndefined();
  });

  it("una ficha con todo vacío devuelve strings vacíos y listas vacías", () => {
    const form = document.createElement("form");
    form.innerHTML = `
      <input id="bodega" value="" />
      <select id="tipo"><option value="" selected></option></select>
      <div id="composicion">
        <div class="fila-cepa"><input class="varietal" value="" /><input class="porcentaje" value="" /></div>
      </div>
      <fieldset id="notas-aromaticas"></fieldset>
      <fieldset id="aromas-boca"></fieldset>
    `;
    document.body.append(form);

    const ficha = leerFicha(form);

    expect(ficha.bodega).toBe("");
    expect(ficha.tipo).toBe("");
    expect(ficha.composicion).toEqual([]);
    expect(ficha.notas_aromaticas).toEqual([]);
    expect(ficha.aromas_boca).toEqual([]);
  });
});
