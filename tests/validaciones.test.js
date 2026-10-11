import { describe, it, expect } from "vitest";
import {
  validarFicha,
  sumarComposicion,
  camposObligatorios,
} from "../js/validaciones.js";

const fichaValida = () => ({
  bodega: "Bodega Ejemplo",
  linea: "Línea Prueba Malbec",
  tipo: "Tinto",
  composicion: [
    { varietal: "Malbec", porcentaje: 80 },
    { varietal: "Cabernet Franc", porcentaje: 20 },
  ],
  cosecha: 2022,
  graduacion: 14,
  pais: "", // opcional (RF-4)
});

describe("camposObligatorios (RF-3)", () => {
  it("son exactamente los seis de la spec", () => {
    expect(camposObligatorios().map((c) => c.clave)).toEqual([
      "bodega",
      "tipo",
      "linea",
      "composicion",
      "cosecha",
      "graduacion",
    ]);
  });

  it("cada campo tiene una etiqueta legible para el mensaje", () => {
    for (const { clave, etiqueta } of camposObligatorios()) {
      expect(etiqueta.length, clave).toBeGreaterThan(0);
    }
  });
});

describe("validarFicha (RF-3, RF-4, RF-11, RF-14)", () => {
  it("una ficha completa con suma 100 es válida (RF-2)", () => {
    const v = validarFicha(fichaValida());
    expect(v.valido).toBe(true);
    expect(v.faltantes).toEqual([]);
    expect(v.sumaComposicion).toBe(100);
  });

  it("obligatorios completos y opcionales vacíos también es válida (RF-4)", () => {
    const v = validarFicha(fichaValida());
    expect(v.valido).toBe(true);
  });

  it("falta bodega → se rechaza y nombra el campo (CA-2, RF-11)", () => {
    const v = validarFicha({ ...fichaValida(), bodega: "" });
    expect(v.valido).toBe(false);
    expect(v.faltantes).toEqual(["bodega"]);
    expect(v.motivo).toContain("Bodega");
  });

  it("faltan varios → nombra todos los faltantes (CA-2)", () => {
    const v = validarFicha({
      ...fichaValida(),
      bodega: "",
      tipo: "",
      linea: "",
    });
    expect(v.faltantes).toEqual(["bodega", "tipo", "linea"]);
    expect(v.motivo.toLowerCase()).toContain("tipo de vino");
    expect(v.motivo).toContain("línea");
  });

  it("composición sin cepas → falta la composición (RF-3)", () => {
    const v = validarFicha({ ...fichaValida(), composicion: [] });
    expect(v.valido).toBe(false);
    expect(v.faltantes).toEqual(["composicion"]);
  });

  it("graduación vacía o no numérica → falta graduación (RF-3)", () => {
    expect(
      validarFicha({ ...fichaValida(), graduacion: "" }).faltantes,
    ).toEqual(["graduacion"]);
    expect(
      validarFicha({ ...fichaValida(), graduacion: "fuerte" }).faltantes,
    ).toEqual(["graduacion"]);
  });

  it("graduación acepta coma o punto decimal", () => {
    expect(validarFicha({ ...fichaValida(), graduacion: "13,5" }).valido).toBe(
      true,
    );
    expect(validarFicha({ ...fichaValida(), graduacion: "13.5" }).valido).toBe(
      true,
    );
  });

  it("suma 95 o 105 se rechaza informando la suma actual (CA-13, CL-8)", () => {
    const cepas95 = [
      { varietal: "Malbec", porcentaje: 75 },
      { varietal: "Cabernet", porcentaje: 20 },
    ];
    const v = validarFicha({ ...fichaValida(), composicion: cepas95 });
    expect(v.valido).toBe(false);
    expect(v.sumaComposicion).toBe(95);
    expect(v.motivo).toContain("95");
  });

  it("suma 100 con porcentuales en texto se acepta", () => {
    const v = validarFicha({
      ...fichaValida(),
      composicion: [
        { varietal: "Malbec", porcentaje: "80" },
        { varietal: "Merlot", porcentaje: "20" },
      ],
    });
    expect(v.valido).toBe(true);
    expect(v.sumaComposicion).toBe(100);
  });
});

describe("sumarComposicion (RF-14)", () => {
  it("suma solo porcentajes finitos", () => {
    expect(
      sumarComposicion([
        { varietal: "Malbec", porcentaje: 50 },
        { varietal: "Cabernet", porcentaje: "50" },
        { varietal: "Raro", porcentaje: "x" },
      ]),
    ).toBe(100);
  });

  it("vacío suma 0", () => {
    expect(sumarComposicion([])).toBe(0);
  });
});
