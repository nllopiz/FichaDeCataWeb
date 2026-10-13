// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mostrarVista, renderResultados } from "../js/ui.js";
import { cargarFicha } from "../js/formulario.js";

function paginasDePrueba() {
  document.body.innerHTML = `
    <section id="vista-carga"><h2 id="titulo-carga">Nueva ficha</h2></section>
    <section id="vista-busqueda" hidden>
      <h2 id="titulo-busqueda">Buscar fichas</h2>
      <div id="resultados-busqueda"></div>
    </section>
    <section id="vista-edicion" hidden></section>
  `;
}

beforeEach(() => {
  document.body.innerHTML = "";
  paginasDePrueba();
});

describe("mostrarVista", () => {
  it("muestra solo la sección pedida y oculta las demás", () => {
    mostrarVista("busqueda");

    expect(document.querySelector("#vista-busqueda").hidden).toBe(false);
    expect(document.querySelector("#vista-carga").hidden).toBe(true);
    expect(document.querySelector("#vista-edicion").hidden).toBe(true);
  });

  it("al cambiar de vista lleva el foco al título de la nueva (WCAG 2.4.3)", () => {
    mostrarVista("busqueda");

    expect(document.activeElement).toBe(
      document.querySelector("#titulo-busqueda"),
    );
    expect(document.activeElement.getAttribute("tabindex")).toBe("-1");
  });
});

describe("renderResultados (sin innerHTML: skill seguridad-gis-sheets §6)", () => {
  const fichas = [
    { bodega: "Bodega Ejemplo", linea: "Línea Prueba Malbec", cosecha: "2022" },
    { bodega: "<img src=x onerror=alert(1)>", linea: "Otra Línea" },
  ];

  it("dibuja una entrada por ficha con bodega, línea y cosecha", () => {
    renderResultados(
      document.querySelector("#resultados-busqueda"),
      fichas,
      () => {},
    );

    const texto = document.querySelector("#resultados-busqueda").textContent;
    expect(texto).toContain("Bodega Ejemplo");
    expect(texto).toContain("Línea Prueba Malbec");
    expect(texto).toContain("2022");
  });

  it("el texto del usuario se inserta como texto, nunca como HTML", () => {
    renderResultados(
      document.querySelector("#resultados-busqueda"),
      fichas,
      () => {},
    );

    expect(document.querySelector("#resultados-busqueda img")).toBeNull();
    expect(
      document.querySelector("#resultados-busqueda").textContent,
    ).toContain("<img");
  });

  it("al pulsar una ficha se llama a alAbrir con esa ficha", () => {
    const alAbrir = vi.fn();
    renderResultados(
      document.querySelector("#resultados-busqueda"),
      fichas,
      alAbrir,
    );

    document.querySelector("#resultados-busqueda button").click();

    expect(alAbrir).toHaveBeenCalledWith(fichas[0]);
  });

  it("lista vacía limpia el contenedor", () => {
    renderResultados(
      document.querySelector("#resultados-busqueda"),
      fichas,
      () => {},
    );
    renderResultados(
      document.querySelector("#resultados-busqueda"),
      [],
      () => {},
    );

    expect(document.querySelector("#resultados-busqueda").textContent).toBe("");
  });
});

describe("cargarFicha (RF-8: abrir para editar)", () => {
  function formDePrueba() {
    const form = document.createElement("form");
    form.innerHTML = `
      <input id="bodega" />
      <select id="tipo"><option value=""></option><option value="Tinto">Tinto</option></select>
      <select id="tono_matiz"></select>
      <input id="graduacion" />
      <select id="cosecha"><option value="2022">2022</option></select>
      <div id="composicion"></div>
      <fieldset id="notas-aromaticas">
        <input type="checkbox" name="notas_aromaticas" value="frutas rojas" />
        <input type="checkbox" name="notas_aromaticas" value="violeta" />
      </fieldset>
      <fieldset id="aromas-boca">
        <input type="checkbox" name="aromas_boca" value="cuero" />
      </fieldset>
      <div id="bloque-espumante" hidden><select id="color_espumante"></select><select id="metodo_espumante"></select></div>
      <span id="suma-composicion"></span>
      <select id="limpieza_transparencia"></select>
      <div id="bloque-defecto" hidden><select id="defecto"></select></div>
      <select id="limpieza_franqueza"></select>
    `;
    document.body.append(form);
    return form;
  }

  it("rellena el formulario con la ficha y su composición", () => {
    const form = formDePrueba();

    cargarFicha(form, {
      bodega: "Bodega Ejemplo",
      tipo: "Tinto",
      graduacion: 13.5,
      cosecha: 2022,
      composicion: [
        { varietal: "Malbec", porcentaje: 80 },
        { varietal: "Cabernet Franc", porcentaje: 20 },
      ],
      notas_aromaticas: ["violeta"],
      aromas_boca: ["cuero"],
    });

    expect(form.querySelector("#bodega").value).toBe("Bodega Ejemplo");
    expect(form.querySelector("#tipo").value).toBe("Tinto");
    expect(form.querySelector("#graduacion").value).toBe("13.5");
    expect(form.querySelector("#cosecha").value).toBe("2022");
    const cepas = form.querySelectorAll(".fila-cepa");
    expect(cepas).toHaveLength(2);
    expect(cepas[0].querySelector(".varietal").value).toBe("Malbec");
    expect(cepas[1].querySelector(".porcentaje").value).toBe("20");
    expect(form.querySelector('input[value="violeta"]').checked).toBe(true);
    expect(form.querySelector('input[value="frutas rojas"]').checked).toBe(
      false,
    );
    expect(
      form.querySelector('input[name="aromas_boca"][value="cuero"]').checked,
    ).toBe(true);
  });

  it("una ficha vacía resetea el formulario (usado por 'Nueva ficha')", () => {
    const form = formDePrueba();
    form.querySelector("#bodega").value = "Sucio";

    cargarFicha(form, {});

    expect(form.querySelector("#bodega").value).toBe("");
    expect(form.querySelectorAll(".fila-cepa")).toHaveLength(1);
    expect(form.querySelector(".varietal").value).toBe("");
  });
});
